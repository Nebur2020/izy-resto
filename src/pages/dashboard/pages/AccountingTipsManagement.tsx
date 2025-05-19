import { useEffect, useState } from 'react';
import { DateFilter } from '../../../components/dashboard/components/accounting/DateFilter';
import { Button } from '../../../components/ui';
import {
  DollarSign,
  Download,
  Package,
} from 'lucide-react';
import { useSettings } from '../../../hooks';
import { useOrders } from '../../../context/OrderContext';
import { AnimatePresence, motion } from 'framer-motion';
import { formatDate } from '../../../utils';
import { formatCurrency } from '../../../utils/currency';
import { Language, Order } from '../../../types';
import { useTranslation } from 'react-i18next';
import LoadMoreButton from '../../../components/ui/LoadMoreButton';
import { exportTipsToCSV } from '../../../utils/csvExportHelpers';

const ITEMS_PER_PAGE = 10;

export const AccountingTipsManagement = () => {
  const { t, i18n } = useTranslation();
  const lng = i18n.language as Language;
  const { settings, isLoading: settingsLoading } = useSettings();
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [displayedOrders, setDisplayedOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const { getDateOrders } = useOrders();

  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().setHours(0, 0, 0, 0)),
    to: new Date(),
  });

  const handleDateChange = (start: Date, end: Date) => {
    setDateRange({ from: start, to: end });
  };

  const handleExport = async () => {
    try {
      setIsDownloading(true);
      exportTipsToCSV(allOrders, settings, dateRange, t, lng);
    } catch (error) {
      console.error('Error exporting tips:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await getDateOrders({
        startDate: dateRange.from,
        endDate: dateRange.to,
      });

      const ordersWithTips = response
        .filter(order => !!order?.tip)
        .filter(order => order.status === 'delivered');

      const sortedOrders = ordersWithTips.sort((a, b) => {
        return b.createdAt - a.createdAt;
      });

      setAllOrders(sortedOrders);

      const initialBatch = sortedOrders.slice(0, ITEMS_PER_PAGE);
      setDisplayedOrders(initialBatch);

      setHasMore(sortedOrders.length > ITEMS_PER_PAGE);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      const currentSize = displayedOrders.length;
      const nextBatch = allOrders.slice(
        currentSize,
        currentSize + ITEMS_PER_PAGE
      );

      setDisplayedOrders(prev => [...prev, ...nextBatch]);
      setHasMore(currentSize + nextBatch.length < allOrders.length);
    } catch (error) {
      console.error('Error loading more orders:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [dateRange]);

  const totalTips = allOrders.reduce(
    (acc, curr) => acc + (curr.tip?.amount || 0),
    0
  );

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20`}>
              <DollarSign
                className={`w-6 h-6 text-blue-600 dark:text-blue-400`}
              />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('comptability:total-taxes')}
              </p>
              <p className="text-2xl font-semibold">
                {formatCurrency(totalTips, settings?.currency)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <DateFilter
          startDate={dateRange.from}
          endDate={dateRange.to}
          onDateChange={handleDateChange}
        />
        <div className="flex gap-2">
          <Button
            disabled={(settingsLoading && !settings) || isDownloading}
            variant="secondary"
            onClick={handleExport}
          >
            <Download className="w-4 h-4 mr-2" />
            {isDownloading
              ? t('common:downloading')
              : t('comptability:download-tip')}
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b dark:border-gray-700 text-left">
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                  {t('comptability:date')}
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                  {t('comptability:references')}
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                  {t('comptability:tip')}
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                  {t('comptability:customer-name')}
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                  {t('comptability:payment-method')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              <AnimatePresence mode="wait" initial={false}>
                {displayedOrders.length > 0 ? (
                  displayedOrders.map((order, index) => (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{
                        duration: 0.2,
                        delay: Math.min(index * 0.05, 0.3),
                      }}
                      className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm whitespace-nowrap">
                        {formatDate(
                          order.createdAt,
                          false,
                          settings?.language || 'fr'
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap">
                        #{order.id}
                      </td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap">
                        {formatCurrency(order?.tip?.amount, settings?.currency)}
                        {order?.tip?.percentage && (
                          <span className="ml-1 text-xs text-gray-500">
                            ({order.tip.percentage}%)
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap">
                        {order.customerName}
                      </td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap">
                        {order.paymentMethod?.name || '-'}
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-4 text-sm text-center text-gray-500"
                    >
                      {t('comptability:no-tips-found')}
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {!loading && displayedOrders.length < 1 && (
          <div className="text-center py-8">
            <Package className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-500">{t('comptability:no-tips-found')}</p>
          </div>
        )}

        {hasMore && (
          <div className="px-6 py-4 border-t dark:border-gray-700">
            <LoadMoreButton
              handleLoadMore={loadMore}
              isLoading={isLoadingMore}
            />
          </div>
        )}
      </div>
    </>
  );
};
