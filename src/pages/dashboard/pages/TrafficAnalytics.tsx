import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  TrendingUp,
  XCircle,
  Clock,
  Truck,
  Utensils,
  DollarSign,
  TrendingDown,
} from 'lucide-react';
import { useOrdersRealtime } from '../../../hooks/useOrdersRealtime';
import { useTrafficStats } from '../../../hooks/useTrafficStats';
import { DateFilter } from '../../../components/dashboard/components/accounting/DateFilter';
import { useSettings } from '../../../hooks/useSettings';
import {
  formatCurrency,
  formatNumberByLanguage,
} from '../../../utils/currency';
import { Tabs } from '../../../components/ui/Tabs';
import { FeedbackAnalytics } from '../../../components/dashboard/components/analytics/FeedbackAnalytics';
import { useTranslation } from 'react-i18next';

export function TrafficAnalytics() {
  const { t } = useTranslation('analyse');
  const { orders } = useOrdersRealtime();
  const { settings } = useSettings();
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setHours(0, 0, 0, 0)), // First day of current month
    end: new Date(),
  });
  const [currentPage, setCurrentPage] = useState(1);

  const stats = useTrafficStats(orders, dateRange);

  const tabs = [
    { id: 'overview', label: t('dashboard:overview') },
    { id: 'feedback', label: t('client-note') },
  ];

  const metrics = useMemo(() => {
    const filteredOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt.seconds * 1000);
      return (
        order.status === 'delivered' &&
        orderDate >= dateRange.start &&
        orderDate <= dateRange.end
      );
    });

    const totalRevenue = filteredOrders.reduce(
      (sum, order) =>
        order.status === 'delivered' ? sum + Number(order.subtotal) : sum,
      0
    );

    const averageOrderValue =
      filteredOrders.length > 0 ? totalRevenue / filteredOrders.length : 0;

    const canceledOrders = orders.filter(o => o.status === 'cancelled');
    const cancelRate =
      filteredOrders.length > 0
        ? (canceledOrders.length / orders.length) * 100
        : 0;

    const dineInOrders = filteredOrders.filter(
      o => o.diningOption === 'dine-in'
    );
    const deliveryOrders = filteredOrders.filter(
      o => o.diningOption === 'delivery'
    );
    const dineInRate =
      filteredOrders.length > 0
        ? (dineInOrders.length / filteredOrders.length) * 100
        : 0;

    const uniqueCustomers = new Set(
      filteredOrders.map(o => o.customerEmail || o.customerPhone)
    ).size;

    return {
      totalRevenue,
      averageOrderValue,
      canceledOrders: canceledOrders.length,
      cancelRate,
      dineInOrders: dineInOrders.length,
      deliveryOrders: deliveryOrders.length,
      dineInRate,
      uniqueCustomers,
    };
  }, [orders, dateRange]);

  const handleDateChange = (start: Date, end: Date) => {
    setDateRange({ start, end });
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('trafic-title')}</h1>
        <DateFilter
          startDate={dateRange.start}
          endDate={dateRange.end}
          onDateChange={handleDateChange}
        />
      </div>
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      {activeTab === 'overview' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('common:tota-income')}
                  </p>
                  <p className="text-2xl font-semibold">
                    {formatCurrency(metrics.totalRevenue, settings?.currency)}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('average-order')}
                  </p>
                  <p className="text-2xl font-semibold">
                    {formatCurrency(
                      metrics.averageOrderValue,
                      settings?.currency
                    )}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('common:unique-customers')}
                  </p>
                  <p className="text-2xl font-semibold">
                    {metrics.uniqueCustomers}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('common:cancellation-rate')}
                  </p>
                  <p className="text-2xl font-semibold">
                    {formatNumberByLanguage(
                      Number(metrics.cancelRate.toFixed(2)),
                      'fr-FR'
                    )}
                    %
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('common:pending')}
                  </p>
                  <p className="text-2xl font-semibold">
                    {stats.pendingOrders}
                  </p>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <Truck className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('common:delivery')}
                  </p>
                  <p className="text-2xl font-semibold">
                    {metrics.deliveryOrders}
                  </p>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                  <Utensils className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('common:on-site')}
                  </p>
                  <p className="text-2xl font-semibold">
                    {metrics.dineInOrders} (
                    {formatNumberByLanguage(
                      Number(metrics.dineInRate.toFixed(2)),
                      'fr-FR'
                    )}
                    %)
                  </p>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-lg">
                  <TrendingDown className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('common:order-cancel')}
                  </p>
                  <p className="text-2xl font-semibold">
                    {metrics.canceledOrders}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-6">{t('best-selling')}</h2>
            <div className="space-y-4">
              {stats.bestSellers.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg font-medium">
                      #{index + 1}
                    </div>
                    <div>
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {item.quantity} {t('sell')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600 dark:text-green-400">
                      {formatCurrency(item.revenue, settings?.currency)}
                    </p>
                  </div>
                </motion.div>
              ))}

              {stats.bestSellers.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Aucune donnée disponible
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <FeedbackAnalytics
          orders={orders}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
