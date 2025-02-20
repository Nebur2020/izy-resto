import { useEffect, useState } from 'react';
import { DateFilter } from '../../../components/dashboard/components/accounting/DateFilter';
import { Button } from '../../../components/ui';
import {
  DollarSign,
  Download,
  Package,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import { useSettings } from '../../../hooks';
import { useOrders } from '../../../context/OrderContext';
import { AnimatePresence, motion } from 'framer-motion';
import { formatDate } from '../../../utils';
import { formatCurrency } from '../../../utils/currency';
import { Language, Order } from '../../../types';
import { useTranslation } from 'react-i18next';

const ITEMS_PER_PAGE = 10;

const exportTipsToCSV = (
  orders: Order[],
  settings: any,
  dateRange: { from: Date; to: Date },
  t: (key: string) => string,
  lng: Language
) => {
  const totalDelivery = orders.reduce(
    (sum, order) => sum + Number(order.delivery?.price || 0),
    0
  );
  const averageTip = totalDelivery / orders.length;

  const headers = [
    t('common:date'),
    t('common:references'),
    t('comptability:order-amount'),
    t('comptability:delivery-amount'),
    t('comptability:customer-name'),
    t('common:payment-method'),
  ].join(',');

  const summary = [
    `${t('common:period')},${formatDate(dateRange.from)} - ${formatDate(
      dateRange.to
    )}`,
    `${t('comptability:total-delivery')},${formatCurrency(
      totalDelivery,
      settings?.currency
    )}`,
    `${t('comptability:delivery-average')},${formatCurrency(
      averageTip,
      settings?.currency
    )}`,
    '',
  ].join('\n');

  const rows = orders
    .map(order => {
      return [
        formatDate(order.createdAt),
        order.id,
        formatCurrency(order.total, settings?.currency),
        formatCurrency(Number(order.delivery?.price || 0), settings?.currency),
        order.customerName || order.customerPhone || order.customerEmail || '#',
        order.paymentMethod?.name || '-',
      ].join(',');
    })
    .join('\n');

  const csv = `${summary}\n${headers}\n${rows}`;

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `${t('common:delivery-report')}-${formatDate(
      dateRange.from,
      false,
      lng
    )}-${formatDate(dateRange.to, false, lng)}.csv`
  );
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const AccountingDeliveryManagement = () => {
  const { t, i18n } = useTranslation();
  const { settings, isLoading: settingsLoading } = useSettings();
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [displayedOrders, setDisplayedOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const lng = i18n.language as Language;

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
      // Use all filtered orders for export
      const ordersWithDelivery = allOrders.filter(
        order => !!order.delivery && Number(order.delivery?.price || 0) !== 0
      );
      exportTipsToCSV(ordersWithDelivery, settings, dateRange, t, lng);
    } catch (error) {
      console.error('Error exporting delivery data:', error);
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

      // Filter orders with delivery fees
      const ordersWithDelivery = response.filter(
        order => !!order.delivery && Number(order.delivery?.price || 0) !== 0
      );

      // Sort by date descending
      const sortedOrders = ordersWithDelivery.sort((a, b) => {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });

      setAllOrders(sortedOrders);

      // Initialize with first batch
      const initialBatch = sortedOrders.slice(0, ITEMS_PER_PAGE);
      setDisplayedOrders(initialBatch);

      // Set hasMore if there are more orders than initial batch
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

  // Calculate total delivery fees
  const totalDelivery = allOrders.reduce(
    (acc, curr) => acc + Number(curr.delivery?.price || 0),
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
                {t('comptability:total-delivery')}
              </p>
              <p className="text-2xl font-semibold">
                {formatCurrency(totalDelivery, settings?.currency)}
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
              : t('comptability:download-delivery')}
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
                  {t('order:delivery')}
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                  {t('comptability:customer-name')}
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                  {t('comptability:delivery-zone')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              <AnimatePresence mode="wait" initial={false}>
                {displayedOrders.map((order, index) => (
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
                      {formatDate(order.createdAt, false, lng)}
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap">
                      #{order.id}
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap">
                      {formatCurrency(
                        Number(order.delivery?.price || 0),
                        settings?.currency
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap">
                      {order.customerName || order.customerPhone || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap">
                      {order.delivery?.name || '-'}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {!loading && displayedOrders.length < 1 && (
          <div className="text-center py-8">
            <Package className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-500">
              {t('comptability:no-delivery-found')}
            </p>
          </div>
        )}

        {hasMore && (
          <div className="px-6 py-4 border-t dark:border-gray-700">
            <Button
              variant="outline"
              onClick={loadMore}
              disabled={isLoadingMore}
              className="w-full flex items-center justify-center gap-2"
            >
              {isLoadingMore ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
              <span>
                {isLoadingMore ? t('common:loading') : t('common:load-more')}
                {displayedOrders.length > 0 && allOrders.length > 0 && (
                  <span className="ml-1 text-gray-500">
                    ({displayedOrders.length}/{allOrders.length})
                  </span>
                )}
              </span>
            </Button>
          </div>
        )}
      </div>
    </>
  );
};
