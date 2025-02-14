import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useIsMobile } from '../../../hooks/useIsMobile';
import { DateFilter } from '../../../components/dashboard/components/accounting/DateFilter';
import { AnalyticsGrid } from '../../../components/dashboard/analytics/AnalyticsGrid';
import { AnalyticsChart } from '../components/AnalyticsChart';
import { ProductSalesStats } from '../../../components/dashboard/components/analytics/ProductSalesStats';
import { PaginatedCustomerList } from '../../../components/dashboard/PaginatedCustomerList';
import { PaginatedRecentOrders } from '../../../components/dashboard/PaginatedRecentOrders';
import { RevenueDetails } from '../../../components/dashboard/RevenueDetails';
import { useOrdersRealtime } from '../../../hooks/useOrdersRealtime';
import { Laptop } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function Overview() {
  const isMobile = useIsMobile();
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setHours(0, 0, 0, 0)),
    endDate: new Date(),
  });

  const { orders } = useOrdersRealtime();

  const { t } = useTranslation('dashboard');

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const orderDate = new Date(order.createdAt.seconds * 1000);
      return orderDate >= dateRange.startDate && orderDate <= dateRange.endDate;
    });
  }, [orders, dateRange]);

  const deliveredOrders = useMemo(() => {
    return filteredOrders.filter(order => order.status === 'delivered');
  }, [filteredOrders]);

  const analytics = useMemo(() => {
    const daysDiff = Math.max(
      1,
      Math.ceil(
        (dateRange.endDate.getTime() - dateRange.startDate.getTime()) /
          (1000 * 60 * 60 * 24)
      )
    );

    const dailyOrderRate = deliveredOrders.length / daysDiff;

    return {
      totalRevenue: deliveredOrders.reduce(
        (sum, order) => sum + Number(order.subtotal || 0),
        0
      ),
      totalOrders: deliveredOrders.length,
      uniqueCustomers: new Set(
        deliveredOrders.map(order => order.customerEmail || order.customerPhone)
      ).size,
      dailyOrderRate: Math.round(dailyOrderRate * 10) / 10,
    };
  }, [filteredOrders, deliveredOrders, dateRange]);

  if (isMobile) {
    return (
      <div className="p-4 space-y-6">
        <div className="text-center bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <Laptop className="w-12 h-12 mx-auto text-blue-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            {t('limit-view-on-mobile')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t('best-experience')}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Commandes Récentes</h3>
          <PaginatedRecentOrders orders={deliveredOrders} itemsPerPage={5} />
        </div>
        <AnalyticsGrid {...analytics} />
        <ProductSalesStats orders={deliveredOrders} />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          {t('dashboard')}
        </h2>
        <DateFilter
          startDate={dateRange.startDate}
          endDate={dateRange.endDate}
          onDateChange={(start, end) =>
            setDateRange({ startDate: start, endDate: end })
          }
        />
      </div>

      <AnalyticsGrid {...analytics} />

      <ProductSalesStats orders={deliveredOrders} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
        >
          <h3 className="text-lg font-semibold mb-4">{t('income')}</h3>
          <RevenueDetails orders={deliveredOrders} dateRange={dateRange} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
        >
          <h3 className="text-lg font-semibold mb-4">{t('order-status')}</h3>
          <AnalyticsChart
            data={deliveredOrders.reduce((acc, order) => {
              acc[order.status] = (acc[order.status] || 0) + 1;
              return acc;
            }, {} as Record<string, number>)}
          />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
        >
          <h3 className="text-lg font-semibold mb-4">{t('recent-orders')}</h3>
          <PaginatedRecentOrders orders={deliveredOrders} itemsPerPage={5} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
        >
          <h3 className="text-lg font-semibold mb-4">{t('best-customer')}</h3>
          <PaginatedCustomerList
            orders={deliveredOrders.filter(order => !!order.customerPhone)}
            itemsPerPage={5}
          />
        </motion.div>
      </div>
    </div>
  );
}
