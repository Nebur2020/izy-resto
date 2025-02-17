import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Users, Calendar } from 'lucide-react';
import { useSettings } from '../../../hooks/useSettings';
import {
  formatCurrency,
  formatNumberByLanguage,
} from '../../../utils/currency';
import { useTranslation } from 'react-i18next';

interface AnalyticsGridProps {
  totalRevenue: number;
  totalOrders: number;
  uniqueCustomers: number;
  dailyOrderRate: number;
}

export function AnalyticsGrid(props: AnalyticsGridProps) {
  const { totalRevenue, totalOrders, uniqueCustomers, dailyOrderRate } = props;
  const { settings } = useSettings();

  const { t } = useTranslation('dashboard');

  const stats = [
    {
      title: t('total-income-without-tax'),
      value: formatCurrency(Number(totalRevenue), settings?.currency),
      icon: DollarSign,
      color: 'green',
    },
    {
      title: t('orders'),
      value: totalOrders.toString(),
      icon: TrendingUp,
      color: 'blue',
    },
    {
      title: t('unique-customers'),
      value: uniqueCustomers.toString(),
      icon: Users,
      color: 'purple',
    },
    {
      title: t('day-order'),
      value: formatNumberByLanguage(Number(dailyOrderRate.toFixed(1)), 'fr-FR'),
      icon: Calendar,
      color: 'orange',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <div
              className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${
                stat.color === 'green'
                  ? 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400'
                  : stat.color === 'blue'
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400'
                  : stat.color === 'purple'
                  ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400'
                  : 'bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400'
              }`}
            >
              <stat.icon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="flex-1 min-w-0 overflow-hidden">
              <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                {stat.title}
              </p>
              <p
                className={`text-lg sm:text-xl font-semibold text-gray-900 dark:text-white truncate`}
              >
                {stat.value}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
