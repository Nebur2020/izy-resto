import { motion } from 'framer-motion';
import { X, ShoppingBag, MapPin, Phone, Mail } from 'lucide-react';
import { Language, Order } from '../../../../types';
import { useSettings } from '../../../../hooks/useSettings';
import { formatCurrency } from '../../../../utils/currency';
import { formatFirestoreTimestamp } from '../../../../utils/date';
import { OrderTimeline } from '../../../orders/OrderTimeline';
import { Button } from '../../../ui/Button';
import { useTranslation } from 'react-i18next';

interface RecentOrderModalProps {
  order: Order | null;
  onClose: () => void;
}

export function RecentOrderModal({ order, onClose }: RecentOrderModalProps) {
  const { settings } = useSettings();
  const { t, i18n } = useTranslation('order');
  const lng = i18n.language as Language;

  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden"
      >
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-blue-500" />
                {t('order')} #{order.id.slice(0, 8)}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatFirestoreTimestamp(order.createdAt, lng)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="overflow-y-auto p-4 space-y-6 max-h-[calc(100vh-200px)]">
          <OrderTimeline
            order={order}
            status={order.status}
            createdAt={order.createdAt}
            updatedAt={order.updatedAt}
          />
          <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 space-y-3">
            <h3 className="font-medium">{t('common:client-details')}</h3>
            <div className="space-y-2">
              <p className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <Phone className="w-4 h-4" />
                {order.customerPhone}
              </p>
              {order.customerEmail && (
                <p className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <Mail className="w-4 h-4" />
                  {order.customerEmail}
                </p>
              )}
              {order.diningOption === 'delivery' && order.customerAddress && (
                <p className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <MapPin className="w-4 h-4" />
                  {order.customerAddress}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="font-medium">{t('common:item-ordered')}</h3>
            <div className="divide-y dark:divide-gray-700">
              {order.items.map(item => (
                <div
                  key={item.id}
                  className="py-3 flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatCurrency(item.price, settings?.currency)} ×{' '}
                      {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium">
                    {formatCurrency(
                      item.price * item.quantity,
                      settings?.currency
                    )}
                  </p>
                </div>
              ))}
            </div>
            <div className="border-t dark:border-gray-700 pt-4 flex justify-between items-center">
              <span className="font-medium">Total</span>
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(order.total, settings?.currency)}
              </span>
            </div>
          </div>
        </div>
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t dark:border-gray-700 p-4">
          <Button onClick={onClose} className="w-full">
            {t('common:close')}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
