import { Utensils, Truck } from 'lucide-react';
import { Order, Language } from '../../../types';
import { useSettings } from '../../../hooks/useSettings';
import { formatCurrency } from '../../../utils/currency';
import { formatFirestoreTimestamp } from '../../../utils/date';
import { useTranslation } from 'react-i18next';

interface OrderCardHeaderProps {
  order: Order;
}

export function OrderCardHeader({ order }: OrderCardHeaderProps) {
  const { settings } = useSettings();
  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const { t, i18n } = useTranslation(['order', 'common']);
   const lang = i18n.language as Language;

  return (
    <div className="flex justify-between items-start">
      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-2">
          <h3 className="text-lg font-semibold">
            {t("order")} #{order.id.slice(0, 8)}
          </h3>

          {order.diningOption === 'dine-in' ? (
            <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-medium">
              <Utensils className="w-4 h-4 mr-2" />
              Table {order.tableNumber}
            </span>
          ) : (
            <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-sm font-medium">
              <Truck className="w-4 h-4 mr-2" />
              {t('delivery')}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {formatFirestoreTimestamp(order.createdAt, lang)}
        </p>
      </div>

      <div className="text-right">
        <p className="text-lg font-bold text-gray-900 dark:text-white">
          {formatCurrency(order.total, settings?.currency)}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {totalItems} article{totalItems > 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
}
