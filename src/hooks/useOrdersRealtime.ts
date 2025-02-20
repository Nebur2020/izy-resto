import { useState, useEffect } from 'react';
import { orderService } from '../services/orders/order.service';
import { Order } from '../types';
import toast from 'react-hot-toast';

export function useOrdersRealtime() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true; // Track component mount state
    setIsLoading(true);

    const unsubscribe = orderService.subscribeToOrders(
      updatedOrders => {
        if (!isMounted) return; // Prevent state updates if unmounted

        try {
          // Safely format orders with error handling
          const formattedOrders = updatedOrders.map(o => ({
            ...o,
            total: Number(o.total || 0),
            subtotal: o.subtotal ? Number(o.subtotal) : Number(o.total || 0),
            taxTotal: o.taxTotal ? Number(o.taxTotal) : 0,
            amountPaid: o.amountPaid ? Number(o.amountPaid) : 0,
            change: o.change ? Number(o.change) : 0,
            // Ensure createdAt is always a valid object with seconds
            createdAt: o.createdAt || { seconds: Date.now() / 1000 },
          }));

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

  return {
    orders,
    isLoading,
    error,
    isError: !!error,
  };
}
