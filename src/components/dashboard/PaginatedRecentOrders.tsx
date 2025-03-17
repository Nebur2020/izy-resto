import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Language, Order } from '../../types';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../../hooks/useSettings';
import { formatCurrency } from '../../utils/currency';
import { formatFirestoreTimestamp } from '../../utils/date';
import { Pagination } from '../ui/Pagination';
import { RecentOrderModal } from './components/overview/RecentOrderModal';

interface PaginatedRecentOrdersProps {
  orders: Order[];
  itemsPerPage: number;
}

export function PaginatedRecentOrders({
  orders,
  itemsPerPage,
}: PaginatedRecentOrdersProps) {
  const { t, i18n } = useTranslation('order');
  const lng = i18n.language as Language;
  const { settings } = useSettings();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = orders.slice(startIndex, startIndex + itemsPerPage);

  const statusColors = {
    pending:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    preparing:
      'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    delivered:
      'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  };

  return (
    <>
      <div className="space-y-4">
        {paginatedOrders.length > 0 ? (
          paginatedOrders.map((order, index) => (
            <motion.button
              key={order.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedOrder(order)}
              className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600/50 transition-colors text-left"
            >
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {t('order-number')} {order.id.slice(0, 8)}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatFirestoreTimestamp(order.createdAt, lng)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(order.total, settings?.currency)}
                </p>
                <span
                  className={`inline-block px-2 py-1 text-xs rounded-full ${
                    statusColors[order.status]
                  }`}
                >
                  {t(`order-status-${order.status}`)} 
                </span>
              </div>
            </motion.button>
          ))
        ) : (
          <div className="text-center bg-gray-50 dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              {t('no-orders-found')}
            </h2>
          </div>
        )}

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      <AnimatePresence>
        {selectedOrder && (
          <RecentOrderModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
