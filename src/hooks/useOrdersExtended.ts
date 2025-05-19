import { useState, useEffect, useCallback, useMemo } from 'react';
import { orderService } from '../services/orders/order.service';
import { Order, OrderStatus } from '../types';
import toast from 'react-hot-toast';
import { validateOrderTimestamp, getOrderDate } from '../utils/orderUtils';

/**
 * Enhanced version of useOrdersRealtime with better filtering capabilities
 * and more functionality specific to the delivered orders dashboard
 */
export function useOrdersExtended() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Create memoized deliveredOrders
  const deliveredOrders = useMemo(() => {
    return orders.filter(order => order.status === 'delivered');
  }, [orders]);

  useEffect(() => {
    let isMounted = true; // Track component mount state
    setIsLoading(true);

    const unsubscribe = orderService.subscribeToOrders(
      updatedOrders => {
        if (!isMounted) return; // Prevent state updates if unmounted

        try {
          // Safely format orders with error handling
          const formattedOrders = updatedOrders.map(o => {
            // Create a properly formatted order object with all necessary fields
            const formattedOrder = {
              ...o,
              // Ensure all numeric fields are properly converted
              total: Number(o.total || 0),
              subtotal: o.subtotal ? Number(o.subtotal) : Number(o.total || 0),
              taxTotal: o.taxTotal ? Number(o.taxTotal) : 0,
              amountPaid: o.amountPaid ? Number(o.amountPaid) : 0,
              change: o.change ? Number(o.change) : 0,
              // Ensure createdAt is always a valid object with seconds
              createdAt:
                o.createdAt &&
                typeof o.createdAt === 'object' &&
                'seconds' in o.createdAt
                  ? o.createdAt
                  : { seconds: Date.now() / 1000 },
            };

            // Ensure status is always a valid string
            if (
              !formattedOrder.status ||
              typeof formattedOrder.status !== 'string'
            ) {
              formattedOrder.status = 'pending';
            }

            // Ensure customer data is always available for analytics
            if (!formattedOrder.customerName) formattedOrder.customerName = '';
            if (!formattedOrder.customerEmail)
              formattedOrder.customerEmail = '';
            if (!formattedOrder.customerPhone)
              formattedOrder.customerPhone = '';

            return formattedOrder;
          });

          setOrders(formattedOrders);
          setIsLoading(false);
          setError(null);
        } catch (err) {
          console.error('Error formatting orders:', err);
          setError(
            err instanceof Error
              ? err
              : new Error('Unknown error formatting orders')
          );
          setIsLoading(false);
        }
      },
      error => {
        if (!isMounted) return;
        console.error('Error in orders subscription:', error);
        setError(error);
        setIsLoading(false);
        toast.error('Erreur de chargement des commandes');
      }
    );

    // Cleanup subscription on unmount
    return () => {
      isMounted = false;
      if (typeof unsubscribe === 'function') {
        try {
          unsubscribe();
        } catch (err) {
          console.error('Error unsubscribing from orders:', err);
        }
      }
    };
  }, []);

  /**
   * Filter orders by date range
   * Using useCallback to maintain referential stability to avoid rerenders
   */
  const filterOrdersByDateRange = useCallback(
    (startDate: Date, endDate: Date, statusFilter?: OrderStatus): Order[] => {
      return orders.filter(order => {
        // Apply status filter if provided
        if (statusFilter && order.status !== statusFilter) {
          return false;
        }

        try {
          if (!validateOrderTimestamp(order)) {
            return false;
          }

          const orderDate = getOrderDate(order);
          return orderDate >= startDate && orderDate <= endDate;
        } catch (err) {
          console.error('Error parsing order date:', err, order);
          return false;
        }
      });
    },
    [orders] // Only recalculate when orders change
  );

  /**
   * Get only delivered orders within a date range
   * Using useCallback to maintain referential stability
   */
  const getDeliveredOrdersByDateRange = useCallback(
    (startDate: Date, endDate: Date): Order[] => {
      return filterOrdersByDateRange(startDate, endDate, 'delivered');
    },
    [filterOrdersByDateRange] // Only recalculate when filterOrdersByDateRange changes
  );

  return {
    orders,
    deliveredOrders,
    isLoading,
    error,
    isError: !!error,
    filterOrdersByDateRange,
    getDeliveredOrdersByDateRange,
  };
}

/**
 * Debounce a value change to prevent too many updates
 * @param value The value to debounce
 * @param delay The delay in ms
 * @returns The debounced value
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
