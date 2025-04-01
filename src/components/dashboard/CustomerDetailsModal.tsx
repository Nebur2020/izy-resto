import React from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  ShoppingBag,
  TrendingUp,
} from 'lucide-react';
import { Language, Order } from '../../types';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../../hooks/useSettings';
import { formatCurrency } from '../../utils/currency';
import { formatFirestoreTimestamp } from '../../utils/date';
import { Button } from '../ui/Button';

interface CustomerDetailsModalProps {
  customer: {
    name: string;
    email?: string | null;
    phone: string;
  } | null;
  orders: Order[];
  onClose: () => void;
}

export function CustomerDetailsModal({
  customer,
  orders,
  onClose,
}: CustomerDetailsModalProps) {
  const { t, i18n } = useTranslation(['dashboard', 'common']);
  const { settings } = useSettings();
  const primaryColor = settings?.palette.primary;
  const lng = i18n.language as Language;

  const stats = React.useMemo(() => {
    if (!orders.length) return null;

    const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
    const averageOrder = totalSpent / orders.length;
    const firstOrder = orders[orders.length - 1];
    const lastOrder = orders[0];

    return {
      totalSpent,
      averageOrder,
      ordersCount: orders.length,
      firstOrder,
      lastOrder,
    };
  }, [orders]);

  if (!customer || !stats) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden flex flex-col"
      >
        <div className="flex items-start justify-between p-4 border-b dark:border-gray-700">
          <div className="space-y-1">
            <h2 className="text-xl font-bold">{t(customer.name)}</h2>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              {customer.email && (
                <span className="flex items-center">
                  <Mail className="w-4 h-4 mr-1" />
                  {customer.email}
                </span>
              )}
              <span className="flex items-center">
                <Phone className="w-4 h-4 mr-1" />
                {customer.phone}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {t('costumer-total-spent')}
                </span>
              </div>
              <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                {formatCurrency(stats.totalSpent, settings?.currency)}
              </p>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <ShoppingBag className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {t('orders')}
                </span>
              </div>
              <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                {stats.ordersCount}
              </p>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {t('average-order-value')}
                </span>
              </div>
              <p className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                {formatCurrency(stats.averageOrder, settings?.currency)}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-3 text-gray-900 dark:text-white">
              {t('costumer-history')}
            </h3>
            <div className="space-y-2">
              {orders.map(order => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-sm">
                      #{order.id.slice(0, 8)}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {formatFirestoreTimestamp(order.createdAt, lng)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">
                      {formatCurrency(order.total, settings?.currency)}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {order.items.length} {t('orders-items')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {t('first-order')}
                </span>
              </div>
              <p className="text-sm font-medium">
                {formatFirestoreTimestamp(stats.firstOrder.createdAt, lng)}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {t('last-order')}
                </span>
              </div>
              <p className="text-sm font-medium">
                {formatFirestoreTimestamp(stats.lastOrder.createdAt, lng)}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t dark:border-gray-700 p-4">
          <Button
            onClick={onClose}
            className="w-full"
            style={{ backgroundColor: primaryColor }}
            variant="custom"
            spanClassName="text-white"
          >
            {t('common:close')}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
