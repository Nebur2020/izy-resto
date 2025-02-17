import { Truck, Utensils, CreditCard } from 'lucide-react';
import { Order } from '../../../types';
import { useSettings } from '../../../hooks/useSettings';
import { formatCurrency } from '../../../utils/currency';
import { formatFirestoreTimestamp } from '../../../utils/date';
import { formatTaxRate } from '../../../utils/tax';
import { useTranslation } from 'react-i18next';

interface OrderReceiptDetailsProps {
  order: Order;
}

export function OrderReceiptDetails({ order }: OrderReceiptDetailsProps) {
  const { settings } = useSettings();

  const { t } = useTranslation('order');

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
            {t('order')} #{order.id.slice(0, 8)}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {formatFirestoreTimestamp(order.createdAt)}
          </p>
        </div>
        <div className="text-center sm:text-right">
          <p className="text-3xl sm:text-4xl font-bold text-blue-600 dark:text-blue-400">
            {formatCurrency(order.total, settings?.currency)}
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            {order.items.length} articles
          </p>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-8">
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
            <span>{order.paymentMethod.name}</span>
          </div>
        )}
      </div>
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg shadow-inner mb-8">
        <div className="px-4 sm:px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            {t('common:item-ordered')}
          </h2>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {order.items.map(item => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4"
              >
                <div className="mb-2 sm:mb-0">
                  <p className="font-medium text-gray-800 dark:text-white">
                    {item.name}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {formatCurrency(item.price, settings?.currency)} ×{' '}
                    {item.quantity}
                  </p>
                </div>
                <p className="font-medium text-gray-800 dark:text-white">
                  {formatCurrency(
                    item.price * item.quantity,
                    settings?.currency
                  )}
                </p>
              </div>
            ))}
          </div>
          <div className="space-y-2  pt-4 border-t border-gray-200 dark:border-gray-700">
            {order.subtotal && (
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>{t('cart:sub-total')}</span>
                <span>
                  {formatCurrency(order.subtotal, settings?.currency)}
                </span>
              </div>
            )}
            {(order?.taxes || []).map(tax => (
              <div
                key={tax.id}
                className="flex justify-between text-sm text-gray-800 dark:text-gray-400"
              >
                <span>
                  {t(tax.name)} ({formatTaxRate(tax.rate)})
                </span>
                <span>{formatCurrency(tax.amount, settings?.currency)}</span>
              </div>
            ))}
            {order?.tip?.percentage && (
              <div
                key={order.tip.amount}
                className="flex justify-between text-sm text-gray-600 dark:text-gray-400"
              >
                <span>
                  {t('tip')} ({order.tip.percentage}%)
                </span>
                <span>
                  {formatCurrency(order.tip.amount, settings?.currency)}
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-lg font-semibold text-gray-800 dark:text-white mb-2 sm:mb-0">
              {t('total')}
            </p>
            <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(order.total, settings?.currency)}
            </span>
          </div>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="px-4 sm:px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            {t('customer-information')}
          </h2>
          <div className="space-y-2">
            <p className="text-gray-700 dark:text-gray-200">
              {order.customerName}
            </p>
            <p className="text-gray-700 dark:text-gray-200">
              {order.customerPhone}
            </p>
            {order.customerEmail && (
              <p className="text-gray-700 dark:text-gray-200">
                {order.customerEmail}
              </p>
            )}
            {order.diningOption === 'delivery' && (
              <p className="text-gray-700 dark:text-gray-200 font-medium mt-4">
                {t('delivery-address')}: {order.customerAddress}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
