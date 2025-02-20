import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  Timestamp,
  orderBy,
  onSnapshot,
  getDoc,
  QuerySnapshot,
  FirestoreError,
  runTransaction,
  limit,
  updateDoc,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore';
import { db } from '../../lib/firebase/config';
import { DeliveryZone, Order, OrderStatus, TaxRate } from '../../types';
import { accountingService } from '../accounting/accounting.service';
import { stockUpdateService } from '../inventory/stockUpdate.service';
import { validateOrder } from './validators';
import { formatOrderData } from './formatters';
import { OrderServiceError } from './errors';
import type { OrderFilters } from './types';
import { anonymousAuthService } from '../auth/anonymousAuth.service';
import { calculateTaxes } from '../../utils/tax';
import toast from 'react-hot-toast';

interface PaginatedResult<T> {
  items: T[];
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}

class OrderService {
  private collection = 'orders';
  private readonly MAX_REALTIME_ORDERS = 100; // Limit to most recent 100 orders for better performance
  private readonly PAGINATION_DEFAULT_SIZE = 10;

  subscribeToRecentOrders(
    onNewOrder: (newOrder: Order) => void,
    onError: (error: Error) => void
  ) {
    try {
      // Query only for very recent orders (most likely to be new)
      const q = query(
        collection(db, this.collection),
        orderBy('createdAt', 'desc'),
        limit(5) // Only need the most recent few
      );

      return onSnapshot(
        q,
        { includeMetadataChanges: true },
        (snapshot: QuerySnapshot) => {
          // Only process if snapshot is from server
          if (snapshot.metadata.hasPendingWrites) {
            return;
          }

          // Process only new orders that were added
          snapshot.docChanges().forEach(change => {
            if (change.type === 'added') {
              // Only consider orders created in the last minute to be "new"
              const orderData = {
                id: change.doc.id,
                ...change.doc.data(),
              } as Order;

              const createdAt = orderData.createdAt;
              let orderTimestamp: number;

              if (createdAt instanceof Timestamp) {
                orderTimestamp = createdAt.toMillis();
              } else if (createdAt instanceof Date) {
                orderTimestamp = createdAt.getTime();
              } else if (
                typeof createdAt === 'object' &&
                'seconds' in createdAt
              ) {
                orderTimestamp = createdAt.seconds * 1000;
              } else {
                orderTimestamp = new Date(createdAt).getTime();
              }

              // Only notify about orders created in the last minute
              const isRecentOrder = Date.now() - orderTimestamp < 60000;

              if (isRecentOrder) {
                onNewOrder(orderData);
              }
            }
          });
        },
        (error: FirestoreError) => {
          console.error('Firestore subscription error:', error);
          onError(
            new OrderServiceError(
              'Failed to subscribe to orders',
              'orders/subscribe-error',
              error
            )
          );
        }
      );
    } catch (error) {
      console.error('Error setting up orders subscription:', error);
      throw new OrderServiceError(
        'Failed to setup orders subscription',
        'orders/subscribe-setup-error',
        error
      );
    }
  }

  subscribeToOrders(
    onUpdate: (orders: Order[]) => void,
    onError: (error: Error) => void
  ) {
    try {
      // Optimize query with limit and orderBy
      const q = query(
        collection(db, this.collection),
        orderBy('createdAt', 'desc'),
        limit(this.MAX_REALTIME_ORDERS)
      );

      return onSnapshot(
        q,
        { includeMetadataChanges: true }, // Enable offline support
        (snapshot: QuerySnapshot) => {
          // Only process if snapshot is from server or initial load
          if (!snapshot.metadata.hasPendingWrites) {
            const orders = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
            })) as Order[];
            onUpdate(orders);
          }
        },
        (error: FirestoreError) => {
          console.error('Firestore subscription error:', error);
          onError(
            new OrderServiceError(
              'Failed to subscribe to orders',
              'orders/subscribe-error',
              error
            )
          );
        }
      );
    } catch (error) {
      console.error('Error setting up orders subscription:', error);
      throw new OrderServiceError(
        'Failed to setup orders subscription',
        'orders/subscribe-setup-error',
        error
      );
    }
  }

  async getOrdersPaginated(
    pageSize: number = this.PAGINATION_DEFAULT_SIZE,
    lastDoc: QueryDocumentSnapshot<DocumentData> | null = null,
    filters?: OrderFilters
  ): Promise<PaginatedResult<Order>> {
    try {
      let constraints = [];

      // Add orderBy by default
      constraints.push(orderBy('createdAt', 'desc'));

      // Add filters if provided
      if (filters?.status) {
        constraints.push(where('status', '==', filters.status));
      }

      if (filters?.dateFrom) {
        constraints.push(
          where('createdAt', '>=', Timestamp.fromDate(filters.dateFrom))
        );
      }

      if (filters?.dateTo) {
        constraints.push(
          where('createdAt', '<=', Timestamp.fromDate(filters.dateTo))
        );
      }

      // Add pagination
      constraints.push(limit(pageSize + 1));

      let q = query(collection(db, this.collection), ...constraints);

      // If we have a last document, start after it
      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const snapshot = await getDocs(q);
      const orders: Order[] = [];
      let newLastDoc: QueryDocumentSnapshot<DocumentData> | null = null;

      // Check if we have more items
      const hasMore = snapshot.docs.length > pageSize;

      // Only process up to pageSize items
      const docsToProcess = hasMore
        ? snapshot.docs.slice(0, pageSize)
        : snapshot.docs;

      docsToProcess.forEach(doc => {
        orders.push({
          id: doc.id,
          ...doc.data(),
        } as Order);
        newLastDoc = doc;
      });

      return {
        items: orders,
        lastDoc: newLastDoc,
        hasMore,
      };
    } catch (error) {
      console.error('Error fetching paginated orders:', error);
      throw new OrderServiceError(
        'Failed to fetch paginated orders',
        'orders/fetch-paginated-error',
        error
      );
    }
  }

  async searchOrders(searchTerm: string): Promise<Order[]> {
    try {
      // Since Firestore doesn't support full-text search natively,
      // we need to fetch all orders and filter them
      // For large collections, consider using Algolia or Elasticsearch
      const snapshot = await getDocs(
        query(
          collection(db, this.collection),
          orderBy('createdAt', 'desc'),
          limit(500) // Limit search to last 500 orders for performance
        )
      );

      const orders: Order[] = [];
      const normalizedSearchTerm = searchTerm.toLowerCase().trim();

      snapshot.forEach(doc => {
        const order = { id: doc.id, ...doc.data() } as Order;

        // Search in order ID
        if (order.id.toLowerCase().includes(normalizedSearchTerm)) {
          orders.push(order);
          return;
        }

        // Search in customer name
        if (order.customerName?.toLowerCase().includes(normalizedSearchTerm)) {
          orders.push(order);
          return;
        }

        // Search in customer email
        if (order.customerEmail?.toLowerCase().includes(normalizedSearchTerm)) {
          orders.push(order);
          return;
        }

        // Search in customer phone
        if (order.customerPhone?.toLowerCase().includes(normalizedSearchTerm)) {
          orders.push(order);
          return;
        }

        // Search in items (product names)
        if (order.items && Array.isArray(order.items)) {
          const foundInItems = order.items.some(item =>
            item.name.toLowerCase().includes(normalizedSearchTerm)
          );

          if (foundInItems) {
            orders.push(order);
          }
        }
      });

      return orders;
    } catch (error) {
      console.error('Error searching orders:', error);
      throw new OrderServiceError(
        'Failed to search orders',
        'orders/search-error',
        error
      );
    }
  }

  async getOrders(filters?: OrderFilters): Promise<Order[]> {
    try {
      let q = collection(db, this.collection);
      const constraints = [];

      if (filters?.status) {
        constraints.push(where('status', '==', filters.status));
      }

      if (filters?.dateFrom) {
        constraints.push(
          where('createdAt', '>=', Timestamp.fromDate(filters.dateFrom))
        );
      }

      if (filters?.dateTo) {
        constraints.push(
          where('createdAt', '<=', Timestamp.fromDate(filters.dateTo))
        );
      }

      constraints.push(orderBy('createdAt', 'desc'));
      constraints.push(limit(1000)); // Add reasonable limit

      if (constraints.length > 0) {
        q = query(q, ...constraints);
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(
        doc =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Order)
      );
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw new OrderServiceError(
        'Failed to fetch orders',
        'orders/fetch-error',
        error
      );
    }
  }

  async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const docRef = doc(db, this.collection, orderId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        } as Order;
      }

      return null;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw new OrderServiceError(
        'Failed to fetch order',
        'orders/fetch-single-error',
        error
      );
    }
  }

  subscribeToOrder(orderId: string, callback: (order: Order) => void) {
    const docRef = doc(db, this.collection, orderId);
    return onSnapshot(docRef, doc => {
      if (doc.exists()) {
        callback({
          id: doc.id,
          ...doc.data(),
        } as Order);
      }
    });
  }

  async createOrder(
    orderData: Omit<Order, 'id'> & {
      taxRates: TaxRate[];
      tip: { amount: number; percentage?: number } | null;
      delivery: DeliveryZone | null;
    }
  ): Promise<string> {
    try {
      const user = anonymousAuthService.getCurrentUser();

      if (user?.isAnonymous) {
        // Check rate limit
        const { canOrder, reason } = await anonymousAuthService.canPlaceOrder(
          user.uid
        );
        if (!canOrder) {
          throw new OrderServiceError(
            reason || 'Rate limit exceeded',
            'orders/rate-limit'
          );
        }
      }
      // Validate order data
      validateOrder(orderData);

      // Calculate taxes and total
      const { taxes, total: taxTotal } = calculateTaxes(
        orderData.subtotal,
        orderData.taxRates || [],
        orderData.items.map(item => item.categoryId)
      );

      // Format order data and add user ID
      const order = {
        ...formatOrderData(orderData, orderData.paymentMethod),
        anonymousUid: user?.uid || null,
        total: orderData.total,
        subtotal: orderData.subtotal,
        taxes,
        taxTotal,
        tip: orderData.tip || null,
      };

      // Format order data

      const docRef = await addDoc(collection(db, this.collection), order);
      return docRef.id;
    } catch (error: any) {
      console.error('Error creating order:', error);
      throw new OrderServiceError(
        error?.message ? error?.message : 'Failed to create order',
        error?.code ? error?.code : 'orders/create-error',
        error
      );
    }
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    try {
      await runTransaction(db, async transaction => {
        const docRef = doc(db, this.collection, orderId);
        const docSnap = await transaction.get(docRef);

        if (!docSnap.exists()) {
          toast.error('Commande introuvable...');
          throw new OrderServiceError('Order not found', 'orders/not-found');
        }

        const order = { id: docSnap.id, ...docSnap.data() } as Order;
        const previousStatus = order.status;

        // Validate status transition
        if (previousStatus === 'cancelled') {
          toast.error('Impossible de mettre à jour la commande...');
          throw new OrderServiceError(
            'Cannot update cancelled order',
            'orders/invalid-status-transition'
          );
        }

        if (previousStatus === 'delivered' && status !== 'cancelled') {
          toast.error('Impossible de mettre à jour la commande...');
          throw new OrderServiceError(
            'Cannot update delivered order',
            'orders/invalid-status-transition'
          );
        }

        // Update order status
        transaction.update(docRef, {
          status,
          updatedAt: Timestamp.now(),
        });

        // If transitioning to delivered, handle related operations
        if (status === 'delivered' && previousStatus !== 'delivered') {
          // Update stock quantities
          await stockUpdateService.updateStockOnDelivery(order);

          // Create accounting transaction
          await accountingService.createOrderTransaction(order);
        }
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      if (error instanceof OrderServiceError) {
        toast.error('Une erreur est survenue...');
        throw error;
      }
      throw new OrderServiceError(
        'Failed to update order status',
        'orders/update-status-error',
        error
      );
    }
  }

  async updateOrderRating(
    orderId: string,
    rating: number,
    feedback?: string
  ): Promise<void> {
    try {
      // Validate rating
      if (rating < 1 || rating > 5) {
        throw new OrderServiceError(
          'Rating must be between 1 and 5',
          'orders/invalid-rating'
        );
      }

      const docRef = doc(db, this.collection, orderId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new OrderServiceError('Order not found', 'orders/not-found');
      }

      const order = docSnap.data() as Order;

      if (order.status !== 'delivered' && order.status !== 'cancelled') {
        throw new OrderServiceError(
          'Cannot rate an order that is not delivered or cancelled',
          'orders/invalid-status'
        );
      }

      if (order.rating) {
        throw new OrderServiceError(
          'Order has already been rated',
          'orders/already-rated'
        );
      }

      await updateDoc(docRef, {
        rating: {
          rating,
          feedback: feedback?.trim() || null,
          createdAt: new Date().toISOString(),
        },
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating order rating:', error);
      if (error instanceof OrderServiceError) {
        throw error;
      }
      throw new OrderServiceError(
        'Failed to update order rating',
        'orders/update-rating-error',
        error
      );
    }
  }

  async cancelOrder(orderId: string): Promise<void> {
    try {
      const docRef = doc(db, this.collection, orderId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new OrderServiceError('Order not found', 'orders/not-found');
      }

      const order = docSnap.data() as Order;

      // Only allow cancellation of pending orders
      if (order.status !== 'pending') {
        throw new OrderServiceError(
          'Only pending orders can be cancelled',
          'orders/invalid-status'
        );
      }

      await updateDoc(docRef, {
        status: 'cancelled',
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error cancelling order:', error);
      if (error instanceof OrderServiceError) {
        throw error;
      }
      throw new OrderServiceError(
        'Failed to cancel order',
        'orders/cancel-error',
        error
      );
    }
  }
}

export const orderService = new OrderService();
