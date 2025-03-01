import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Order, OrderStatus } from '../../types';
import { OrderCard } from './OrderCard';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface IOrderListProps {
  orders: Order[];
  onStatusChange: (orderId: string, status: OrderStatus) => void;
  onCancel?: (orderId: string) => void;
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

export function OrderList(props: IOrderListProps) {
  const {
    orders,
    onStatusChange,
    onCancel,
    isLoading = false,
    hasMore = false,
    onLoadMore,
  } = props;

  const { t } = useTranslation('order');
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore || !onLoadMore) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !isLoading) {
          onLoadMore();
        }
      },
      {
        rootMargin: '200px',
        threshold: 0.1,
      }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, onLoadMore, isLoading]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {orders.map(order => (
            <motion.div
              key={order.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{
                layout: { duration: 0.3 },
                opacity: { duration: 0.2 },
              }}
            >
              <OrderCard
                order={order}
                onStatusChange={onStatusChange}
                onCancel={onCancel}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && orders.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full flex flex-col items-center justify-center py-12"
          >
            <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
            <p className="mt-4 text-gray-500 dark:text-gray-400">
              {t('loading-orders')}
            </p>
          </motion.div>
        )}

        {!isLoading && orders.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400"
          >
            <p className="text-lg">{t('no-order-found')}</p>
          </motion.div>
        )}
      </div>

      {hasMore && onLoadMore && (
        <div ref={observerTarget} className="h-10 w-full" aria-hidden="true" />
      )}
    </div>
  );
}
