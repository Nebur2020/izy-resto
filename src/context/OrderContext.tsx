import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from 'react';
import { Order, OrderStatus } from '../types';
import { orderService } from '../services/orders/order.service';
import toast from 'react-hot-toast';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  Timestamp,
  QueryDocumentSnapshot,
  DocumentData,
  orderBy,
  limit,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../lib/firebase/config';
import { Bell } from 'lucide-react';

interface PaginatedOrders {
  items: Order[];
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}

interface OrderContextType {
  orders: Order[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMoreOrders: () => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  getOrderById: (orderId: string) => Promise<Order | undefined>;
  filteredOrders: (status?: OrderStatus) => Order[];
  deliveredOrders: Order[];
  pendingOrders: Order[];
  preparingOrders: Order[];
  getDateOrders: (period: {
    startDate: Date;
    endDate: Date;
  }) => Promise<Order[]>;
  searchOrders: (searchTerm: string) => Promise<Order[]>;
  refreshOrders: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastDoc, setLastDoc] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [pageSize] = useState(10); // Default page size for orders

  // Keep track of newest order timestamp for real-time filtering
  const newestOrderTimestampRef = useRef<number | null>(null);

  // Set up initial load and pagination
  useEffect(() => {
    loadInitialOrders();

    // Set up real-time listener for only new orders
    const unsubscribe = orderService.subscribeToRecentOrders(
      newOrder => {
        // Show notification for new order
        showNewOrderNotification(1);

        // Update orders state with new order at the beginning
        setOrders(currentOrders => {
          // Avoid duplicates
          if (currentOrders.some(o => o.id === newOrder.id)) {
            return currentOrders;
          }

          // Add new order at the beginning, maintain page size
          return [newOrder, ...currentOrders.slice(0, -1)];
        });
      },
      error => {
        console.error('Error in order subscription:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  // Helper to get consistently formatted timestamp
  const getOrderTimestamp = (order: Order): number => {
    if (!order.createdAt) return 0;

    if (typeof order.createdAt === 'object' && 'seconds' in order.createdAt) {
      return order.createdAt.seconds;
    }

    if (order.createdAt instanceof Date) {
      return Math.floor(order.createdAt.getTime() / 1000);
    }

    return Math.floor(new Date(order.createdAt).getTime() / 1000);
  };

  // Show notification for new orders
  const showNewOrderNotification = (count: number) => {
    const message =
      count === 1
        ? 'Nouvelle commande reçue !'
        : `${count} nouvelles commandes reçues !`;

    toast.success(
      <div className="flex items-center gap-2">
        <Bell className="w-4 h-4" />
        <span>{message}</span>
      </div>,
      { duration: 5000 }
    );

    // Play notification sound if not in focus
    if (document.visibilityState !== 'visible') {
      playNotificationSound();
    }
  };

  // Play notification sound
  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification.mp3');
      audio.volume = 0.5;
      audio
        .play()
        .catch(err => console.error('Failed to play notification sound:', err));
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  };

  const loadInitialOrders = async () => {
    try {
      setIsLoading(true);
      const result = await orderService.getOrdersPaginated(pageSize);
      setOrders(result.items);
      setLastDoc(result.lastDoc);
      setHasMore(result.hasMore);
      setError(null);

      // Store timestamp of newest order for real-time filtering
      if (result.items.length > 0) {
        const newest = result.items[0];
        newestOrderTimestampRef.current = getOrderTimestamp(newest);
      }
    } catch (error: any) {
      console.error('Error loading initial orders:', error);
      setError(error);
      toast.error('Erreur de chargement des commandes');
    } finally {
      setIsLoading(false);
    }
  };

  // Force refresh orders
  const refreshOrders = async () => {
    try {
      setIsLoading(true);
      await loadInitialOrders();
    } catch (error) {
      console.error('Error refreshing orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreOrders = async () => {
    if (!hasMore || isLoadingMore) return;

    try {
      setIsLoadingMore(true);
      const result = await orderService.getOrdersPaginated(pageSize, lastDoc);

      // Append new orders
      setOrders(prev => [...prev, ...result.items]);
      setLastDoc(result.lastDoc);
      setHasMore(result.hasMore);
    } catch (error: any) {
      console.error('Error loading more orders:', error);
      toast.error('Échec du chargement des commandes supplémentaires');
    } finally {
      setIsLoadingMore(false);
    }
  };

  const searchOrders = async (searchTerm: string): Promise<Order[]> => {
    try {
      if (!searchTerm.trim()) {
        return orders;
      }
      return await orderService.searchOrders(searchTerm);
    } catch (error: any) {
      console.error('Error searching orders:', error);
      toast.error('Échec de la recherche des commandes');
      return [];
    }
  };

  const getDateOrders = async (period: {
    startDate: Date;
    endDate: Date;
  }): Promise<Order[]> => {
    try {
      const q = query(
        collection(db, 'orders'),
        where('createdAt', '>=', Timestamp.fromDate(period.startDate)),
        where('createdAt', '<=', Timestamp.fromDate(period.endDate))
      );

      const snapshot = await getDocs(q);
      const orders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[];

      return orders;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, status);

      // Update local state for better responsiveness
      setOrders(prev =>
        prev.map(order => (order.id === orderId ? { ...order, status } : order))
      );

      toast.success('Statut mis à jour');
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  };

  const getOrderById = async (orderId: string): Promise<Order | undefined> => {
    try {
      // First check if the order is already in our state
      const cachedOrder = orders.find(order => order.id === orderId);
      if (cachedOrder) {
        return cachedOrder;
      }

      // If not found in state, fetch directly from database
      const orderRef = doc(db, 'orders', orderId);
      const orderSnapshot = await getDoc(orderRef);

      if (!orderSnapshot.exists()) {
        toast.error('Commande introuvable');
        return undefined;
      }

      const orderData = {
        id: orderSnapshot.id,
        ...orderSnapshot.data(),
      } as Order;

      return orderData;
    } catch (error) {
      console.error(`Error fetching order ${orderId}:`, error);
      toast.error('Erreur lors de la récupération de la commande');
      return undefined;
    }
  };

  const filteredOrders = (status?: OrderStatus) => {
    if (!status) return orders;
    return orders.filter(order => order.status === status);
  };

  // Memoized filtered lists
  const deliveredOrders = orders.filter(order => order.status === 'delivered');
  const pendingOrders = orders.filter(order => order.status === 'pending');
  const preparingOrders = orders.filter(order => order.status === 'preparing');

  return (
    <OrderContext.Provider
      value={{
        orders,
        isLoading,
        isLoadingMore,
        error,
        hasMore,
        loadMoreOrders,
        updateOrderStatus,
        getOrderById,
        filteredOrders,
        deliveredOrders,
        pendingOrders,
        preparingOrders,
        getDateOrders,
        searchOrders,
        refreshOrders,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
}
