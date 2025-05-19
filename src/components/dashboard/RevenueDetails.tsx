import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../../hooks/useSettings';
import { formatCurrency } from '../../utils/currency';
import { Order } from '../../types';
import { TrendingUp, DollarSign, ShoppingBag, Calendar } from 'lucide-react';

interface RevenueDetailsProps {
  orders: Order[];
  dateRange: { startDate: Date; endDate: Date };
}

export function RevenueDetails({ orders, dateRange }: RevenueDetailsProps) {
  const { t } = useTranslation('dashboard');
  const { settings } = useSettings();

  const totalRevenue = React.useMemo(() => {
    // The orders are already filtered for 'delivered' status in both Overview and EnhancedOverview
    // Calculate total revenue using the standardized approach
    return orders.reduce((sum, order) => {
      // Safely access subtotal - handle strings or numbers
      const subtotal = typeof order.subtotal === 'string'
        ? parseFloat(order.subtotal)
        : (typeof order.subtotal === 'number' ? order.subtotal : 0);

      // Only add valid numbers
      return sum + (isNaN(subtotal) ? 0 : subtotal);
    }, 0);
  }, [orders]);

  // Calculate average order value simply as total divided by count
  const averageOrder = orders.length > 0 ? Number(totalRevenue) / orders.length : 0;
  const ordersCount = orders.length;

  const dailyRevenue = React.useMemo(() => {
    if (!dateRange?.startDate || !dateRange?.endDate) return 0;

    const days = Math.max(
      1,
      Math.ceil(
        (dateRange.endDate.getTime() - dateRange.startDate.getTime()) /
        (1000 * 60 * 60 * 24)
      )
    );

    return Number(totalRevenue) / days;
  }, [dateRange, totalRevenue]);

  const stats = [
    {
      label: t('total-income'),
      value: formatCurrency(Number(totalRevenue), settings?.currency),
      icon: DollarSign,
      color: 'text-green-600 dark:text-green-400',
    },
    {
      label: t('average-order-value'),
      value: formatCurrency(Number(averageOrder), settings?.currency),
      icon: TrendingUp,
      color: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: t('orders-count'),
      value: ordersCount.toString(),
      icon: ShoppingBag,
      color: 'text-purple-600 dark:text-purple-400',
    },
    {
      label: t('daily-income'),
      value: formatCurrency(dailyRevenue, settings?.currency),
      icon: Calendar,
      color: 'text-orange-600 dark:text-orange-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white dark:bg-gray-800 p-4 rounded-lg"
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg bg-opacity-20 ${stat.color.replace(
                'text',
                'bg'
              )}`}
            >
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {stat.label}
              </p>
              <p className="text-xl font-semibold">{stat.value}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
