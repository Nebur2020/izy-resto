import { useState, useEffect, useRef } from 'react';
import { Order } from '../types';
import { useOrdersRealtime } from './useOrdersRealtime';

interface Notification {
  id: string;
  order: Order;
  read: boolean;
}

const MAX_NOTIFICATIONS = 10;

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { orders } = useOrdersRealtime();
  const initialOrdersRef = useRef<Order[] | null>(null);
  const previousOrdersRef = useRef<Order[]>([]);

  useEffect(() => {
    // Store initial orders
    if (initialOrdersRef.current === null && orders.length > 0) {
      initialOrdersRef.current = orders;
      previousOrdersRef.current = orders;
      return;
    }

    // Skip if we haven't received initial orders yet
    if (initialOrdersRef.current === null) {
      return;
    }

    // Check for new orders by comparing with previous orders
    const newOrders = orders.filter(
      order =>
        !previousOrdersRef.current.some(prevOrder => prevOrder.id === order.id)
    );

    if (newOrders.length > 0) {
      // Add new notifications
      setNotifications(prev =>
        [
          ...newOrders.map(order => ({
            id: crypto.randomUUID(),
            order,
            read: false,
          })),
          ...prev,
        ].slice(0, MAX_NOTIFICATIONS)
      );
    }

    // Update previous orders reference
    previousOrdersRef.current = orders;
  }, [orders]);

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const hasUnread = notifications.some(n => !n.read);

  return {
    notifications: notifications.slice(0, MAX_NOTIFICATIONS),
    clearNotification,
    hasUnread,
  };
}
