import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { db } from '../../lib/firebase/config';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  Timestamp,
  orderBy,
  getDoc,
  runTransaction,
  limit,
  updateDoc,
} from 'firebase/firestore';
import { DeliveryZone, Order, OrderStatus, TaxRate } from '../../types';
import { accountingService } from '../../services';
import { stockUpdateService } from '../../services/inventory/stockUpdate.service';
import { validateOrder } from '../../services/orders/validators';
import { formatOrderData } from '../../services/orders/formatters';
import { OrderServiceError } from '../../services/orders/errors';
import { OrderFilters } from '../../services/orders/types';
import { anonymousAuthService } from '../../services/auth/anonymousAuth.service';
import { calculateTaxes } from '../../utils/tax';
import toast from 'react-hot-toast';

export const orderApi = createApi({
  reducerPath: 'orderApi',
  baseQuery: fakeBaseQuery(),
  endpoints: builder => ({
    getOrders: builder.query<Order[], OrderFilters | void>({
      async queryFn(filters) {
        try {
          let q = collection(db, 'orders');
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
          constraints.push(limit(1000));

          if (constraints.length > 0) {
            q = query(q, ...constraints) as any;
          }

          const snapshot = await getDocs(q);
          const orders = snapshot.docs.map(
            doc =>
              ({
                id: doc.id,
                ...doc.data(),
              } as Order)
          );

          return { data: orders };
        } catch (error: any) {
          console.error('Error fetching orders:', error);
          return {
            error: {
              status: 'FETCH_ERROR',
              message: 'Failed to fetch orders',
              error: error.message,
            },
          };
        }
      },
    }),

    getOrderById: builder.query<Order | null, string>({
      async queryFn(orderId) {
        try {
          const docRef = doc(db, 'orders', orderId);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            return {
              data: {
                id: docSnap.id,
                ...docSnap.data(),
              } as Order,
            };
          }

          return { data: null };
        } catch (error: any) {
          console.error('Error fetching order:', error);
          return {
            error: {
              status: 'FETCH_ERROR',
              message: 'Failed to fetch order',
              error: error.message,
            },
          };
        }
      },
    }),

    createOrder: builder.mutation<
      string,
      Omit<Order, 'id'> & {
        taxRates: TaxRate[];
        tip: { amount: number; percentage?: number } | null;
        delivery: DeliveryZone | null;
      }
    >({
      async queryFn(orderData) {
        try {
          const user = anonymousAuthService.getCurrentUser();

          if (user?.isAnonymous) {
            const { canOrder, reason } =
              await anonymousAuthService.canPlaceOrder(user.uid);
            if (!canOrder) {
              throw new OrderServiceError(
                reason || 'Rate limit exceeded',
                'orders/rate-limit'
              );
            }
          }

          validateOrder(orderData);

          const { taxes, total: taxTotal } = calculateTaxes(
            orderData.subtotal,
            orderData.taxRates || [],
            orderData.items.map(item => item.categoryId)
          );

          const order = {
            ...formatOrderData(orderData, orderData.paymentMethod),
            anonymousUid: user?.uid || null,
            total: orderData.total,
            subtotal: orderData.subtotal,
            taxes,
            taxTotal,
            tip: orderData.tip || null,
          };

          const docRef = await addDoc(collection(db, 'orders'), order);
          return { data: docRef.id };
        } catch (error: any) {
          console.error('Error creating order:', error);
          return {
            error: {
              status: 'CREATE_ERROR',
              message: error?.message || 'Failed to create order',
              error: error.message,
            },
          };
        }
      },
    }),

    updateOrderStatus: builder.mutation<
      void,
      { orderId: string; status: OrderStatus }
    >({
      async queryFn({ orderId, status }) {
        try {
          await runTransaction(db, async transaction => {
            const docRef = doc(db, 'orders', orderId);
            const docSnap = await transaction.get(docRef);

            if (!docSnap.exists()) {
              toast.error('Commande introuvable...');
              throw new OrderServiceError(
                'Order not found',
                'orders/not-found'
              );
            }

            const order = { id: docSnap.id, ...docSnap.data() } as Order;
            const previousStatus = order.status;

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

            transaction.update(docRef, {
              status,
              updatedAt: Timestamp.now(),
            });

            if (status === 'delivered' && previousStatus !== 'delivered') {
              await stockUpdateService.updateStockOnDelivery(order);
              await accountingService.createOrderTransaction(order);
            }
          });

          return { data: undefined };
        } catch (error: any) {
          console.error('Error updating order status:', error);
          toast.error('Une erreur est survenue...');
          return {
            error: {
              status: 'UPDATE_ERROR',
              message: 'Failed to update order status',
              error: error.message,
            },
          };
        }
      },
    }),

    cancelOrder: builder.mutation<void, string>({
      async queryFn(orderId) {
        try {
          const docRef = doc(db, 'orders', orderId);
          const docSnap = await getDoc(docRef);

          if (!docSnap.exists()) {
            throw new OrderServiceError('Order not found', 'orders/not-found');
          }

          const order = docSnap.data() as Order;

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

          return { data: undefined };
        } catch (error: any) {
          console.error('Error cancelling order:', error);
          return {
            error: {
              status: 'CANCEL_ERROR',
              message: 'Failed to cancel order',
              error: error.message,
            },
          };
        }
      },
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useCreateOrderMutation,
  useUpdateOrderStatusMutation,
  useCancelOrderMutation,
} = orderApi;
