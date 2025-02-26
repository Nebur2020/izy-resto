import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, CreditCard } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Order } from '../../../../types';
import { formatCurrency } from '../../../../utils/currency';
import { useSettings } from '../../../../hooks';

export const PaymentMethodStats = ({ orders }: { orders: Order[] }) => {
  const { t } = useTranslation('dashboard');
  const { settings } = useSettings();

  const paymentStats = useMemo(() => {
    // Group payments by method
    const paymentTotals = orders.reduce((acc, order) => {
      const methodName = t(
        `order:payment-method-names.${order?.paymentMethod?.name || 'dine-in'}`
      );
      acc[methodName] =
        (acc[methodName] || 0) + Number(order.amountPaid || order.total || 0);
      return acc;
    }, {} as Record<string, number>);

    // Convert to array for rendering
    return Object.entries(paymentTotals)
      .map(([name, total]) => ({
        name,
        total: Number(total).toFixed(2),
        percentage: (
          (total /
            orders.reduce(
              (sum, order) =>
                sum + Number(order.amountPaid || order.total || 0),
              0
            )) *
          100
        ).toFixed(1),
      }))
      .sort((a, b) => Number(b.total) - Number(a.total));
  }, [orders]);

  const totalPayments = useMemo(() => {
    return orders
      .reduce(
        (sum, order) => sum + Number(order.amountPaid || order.total || 0),
        0
      )
      .toFixed(2);
  }, [orders]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">
          {t('settingData:payment-methods') || 'Payment Methods'} <br />{' '}
          <span className="text-sm">{t('common:all-taxes-included')}</span>
        </h3>
        <div className="flex items-center space-x-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full">
          <DollarSign className="w-4 h-4" />
          <span className="font-medium">
            {formatCurrency(totalPayments, settings?.currency)}
          </span>
        </div>
      </div>

      {paymentStats.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>{t('dashboard:no-payment-data') || 'No payment data available'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {paymentStats.map(stat => (
            <div key={stat.name} className="relative">
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium">{stat.name}</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {formatCurrency(stat.total, settings?.currency)}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${stat.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};
