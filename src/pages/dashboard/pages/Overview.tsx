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
import { useOrdersExtended, useDebouncedValue } from '../../../hooks/useOrdersExtended';
import { Laptop, Loader } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PaymentMethodStats } from '../../../components/dashboard/components/analytics/MemoizedPaymentMethodStats';
import { useSettings } from '../../../hooks';
import { OverviewSwitcher } from '../components/OverviewSwitcher';

export function Overview() {
  const isMobile = useIsMobile();
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setHours(0, 0, 0, 0)),
    endDate: new Date(),
  });

  // Use debounced values to prevent excessive re-renders
  const debouncedStartDate = useDebouncedValue(dateRange.startDate, 300);
  const debouncedEndDate = useDebouncedValue(dateRange.endDate, 300);

  const { filterOrdersByDateRange, isLoading, error } = useOrdersExtended();
  const { t } = useTranslation('dashboard');

  const { settings } = useSettings();
  const primaryColor = settings?.palette.primary;

  const filteredOrders = useMemo(() => {
    // Use the same function as EnhancedOverview - filter with status parameter
    return filterOrdersByDateRange(debouncedStartDate, debouncedEndDate, 'delivered');
  }, [filterOrdersByDateRange, debouncedStartDate, debouncedEndDate]);

  // No need to filter again since we're already filtering by 'delivered' status above
  const deliveredOrders = useMemo(() => {
    return filteredOrders;
  }, [filteredOrders]);

  const analytics = useMemo(() => {
    const daysDiff = Math.max(
      1,
      Math.ceil(
        (debouncedEndDate.getTime() - debouncedStartDate.getTime()) /
        (1000 * 60 * 60 * 24)
      )
    );

    const dailyOrderRate = deliveredOrders.length / daysDiff;

    return {
      totalRevenue: deliveredOrders.reduce((sum, order) => {
        // Safely access subtotal - handle strings or numbers
        const subtotal = typeof order.subtotal === 'string'
          ? parseFloat(order.subtotal)
          : (typeof order.subtotal === 'number' ? order.subtotal : 0);

        // Only add valid numbers
        return sum + (isNaN(subtotal) ? 0 : subtotal);
      }, 0),
      totalOrders: deliveredOrders.length,
      // Add average order value using simple total/count approach
      avgOrderValue: deliveredOrders.length > 0
        ? deliveredOrders.reduce((sum, order) => {
          const subtotal = typeof order.subtotal === 'string'
            ? parseFloat(order.subtotal)
            : (typeof order.subtotal === 'number' ? order.subtotal : 0);
          return sum + (isNaN(subtotal) ? 0 : subtotal);
        }, 0) / deliveredOrders.length
        : 0,
      uniqueCustomers: new Set(
        deliveredOrders
          .filter(order => order.customerEmail || order.customerPhone)
          .map(order => order.customerEmail || order.customerPhone)
      ).size,
      dailyOrderRate: Math.round(dailyOrderRate * 10) / 10,
    };
  }, [deliveredOrders, debouncedStartDate, debouncedEndDate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="w-10 h-10 mx-auto text-blue-500 animate-spin mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            {t('loading-orders')}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center bg-red-50 dark:bg-red-900/20 p-6 rounded-xl max-w-md">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-800/30 flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold mb-2 text-red-700 dark:text-red-400">
            {t('error-loading-orders')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error.message || t('unknown-error')}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('try-again')}
          </button>
        </div>
      </div>
    );
  }

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
          <h3 className="text-lg font-semibold mb-4">{t('recent-orders')}</h3>
          <PaginatedRecentOrders orders={deliveredOrders} itemsPerPage={5} />
        </div>
        <AnalyticsGrid {...analytics} />
        <ProductSalesStats orders={deliveredOrders} />
        <PaymentMethodStats orders={deliveredOrders} />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <OverviewSwitcher />
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

      {filteredOrders.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm text-center">
          <div
            className={`w-16 h-16 mx-auto mb-4 rounded-full dark:bg-blue-900/30 flex items-center justify-center`}
            style={{ backgroundColor: primaryColor, opacity: 0.5 }}
          >
            <span className="text-2xl">📊</span>
          </div>
          <h3 className="text-lg font-semibold mb-2">
            {t('order:no-orders-found')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {t('common:try-different-date-range')}
          </p>
        </div>
      ) : (
        <>
          <AnalyticsGrid {...analytics} />

          <ProductSalesStats orders={deliveredOrders} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
            >
              <h3 className="text-lg font-semibold mb-4">{t('income')}</h3>
              <RevenueDetails orders={deliveredOrders} dateRange={{
                startDate: debouncedStartDate,
                endDate: debouncedEndDate
              }} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
            >
              <h3 className="text-lg font-semibold mb-4">
                {t('order-status')}
              </h3>
              <AnalyticsChart
                data={deliveredOrders.reduce((acc, order) => {
                  const status = order.status || 'unknown';
                  acc[status] = (acc[status] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)}
              />
            </motion.div>
          </div>

          <div>
            <PaymentMethodStats orders={deliveredOrders} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm lg:col-span-1"
            >
              <h3 className="text-lg font-semibold mb-4">
                {t('recent-orders')}
              </h3>
              <PaginatedRecentOrders
                orders={deliveredOrders}
                itemsPerPage={5}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm lg:col-span-1"
            >
              <h3 className="text-lg font-semibold mb-4">
                {t('best-customer')}
              </h3>
              <PaginatedCustomerList
                orders={deliveredOrders.filter(order => !!order.customerPhone)}
                itemsPerPage={5}
              />
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}
