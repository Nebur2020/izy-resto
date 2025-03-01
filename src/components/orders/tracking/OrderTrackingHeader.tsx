import { Language, Order } from '../../../types';
import { useSettings } from '../../../hooks/useSettings';
import { formatCurrency } from '../../../utils/currency';
import { formatFirestoreTimestamp } from '../../../utils/date';
import { CreditCard, Truck, Utensils } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface OrderTrackingHeaderProps {
  order: Order;
}

export function OrderTrackingHeader({ order }: OrderTrackingHeaderProps) {
  const { settings } = useSettings();
  const { t, i18n } = useTranslation('order');

  const lang = i18n.language as Language;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-b-xl p-6 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className="text-2xl font-bold mb-2">
            {t('order')} #{order.id.slice(0, 8)}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {formatFirestoreTimestamp(order.createdAt, lang)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {formatCurrency(order.total, settings?.currency)}
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            {order.items.length} {t('common:items')}
          </p>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="flex items-center space-x-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-full">
          {order.diningOption === 'dine-in' ? (
            <>
              <Utensils className="h-5 w-5" />
              <span>
                {t('on-site')} (Table {order.tableNumber})
              </span>
            </>
          ) : (
            <>
              <Truck className="h-5 w-5" />
              <span>{t('delivery')}</span>
            </>
          )}
        </div>
        {order.paymentMethod && (
          <div className="flex items-center space-x-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-4 py-2 rounded-full">
            <CreditCard className="h-5 w-5" />
            <span>
              {t(`payment-method-names.${order.paymentMethod.name}`) ===
              `payment-method-names.${order.paymentMethod.name}`
                ? order.paymentMethod.name
                : t(`payment-method-names.${order.paymentMethod.name}`)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
