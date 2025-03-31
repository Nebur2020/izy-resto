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

export async function generateTaxReportCSV(
  receivedOrders: Order[],
  t: (key: string) => string,
  lng: Language,
  settings?: any,
  dateRange?: { from: Date; to: Date }
): Promise<void> {
  try {
    const orders = receivedOrders.sort((a, b) => {
      return a.createdAt - b.createdAt;
    });
    const taxTotals = new Map<string, { amount: number; rate: number }>();
    let totalHT = 0;
    let totalTTC = 0;

    orders.forEach(order => {
      totalHT += order.subtotal;
      totalTTC += totalHT + order.taxTotal;

      order.taxes.forEach(tax => {
        const existing = taxTotals.get(tax.name);
        if (existing) {
          existing.amount += tax.amount;
        } else {
          taxTotals.set(tax.name, { amount: tax.amount, rate: tax.rate });
        }
      });
    });

    let csvContent = '';

    csvContent += `${settings?.name || 'Restaurant'}\n`;
    csvContent += t('comptability:tax-report') + '\n';
    csvContent += `${t('common:period')} ${formatDate(
      dateRange?.from
    )} - ${formatDate(dateRange?.to)}\n\n`;

    csvContent += t('comptability:summary') + '\n';
    csvContent += `${t('comptability:total-ht')},${formatCurrency(
      totalHT,
      settings?.currency
    )}\n`;
    csvContent += `${t('comptability:total-tax')},${formatCurrency(
      totalTTC - totalHT,
      settings?.currency
    )}\n`;
    csvContent += `${t('comptability:total-ttc')},${formatCurrency(
      totalTTC,
      settings?.currency
    )}\n\n`;

    csvContent += t('comptability:tax-details') + '\n';
    csvContent +=
      t('comptability:tax-name') +
      ',' +
      t('comptability:tax-rate') +
      ',' +
      t('comptability:tax-amount') +
      '\n';
    Array.from(taxTotals.entries()).forEach(([name, data]) => {
      csvContent += `${name},${(data.rate * 100).toFixed(2)}%,${formatCurrency(
        data.amount,
        settings?.currency
      )}\n`;
    });
    csvContent += '\n';

    csvContent += t('comptability:orders-details') + '\n';
    csvContent += `${t('common:date')},${t('common:references')},${t(
      'comptability:total-ht'
    )},${t('comptability:tax-details')},${t('comptability:total-tax')},${t(
      'comptability:total-ttc'
    )}\n`;

    orders.forEach(order => {
      const taxDetails = order.taxes
        .map(
          tax =>
            `${tax.name} (${(tax.rate * 100).toFixed(2)}%): ${formatCurrency(
              tax.amount,
              settings?.currency
            )}`
        )
        .join(' | ');

      csvContent +=
        [
          formatDate(order.createdAt),
          `#${order.id}`,
          formatCurrency(order.subtotal, settings?.currency),
          taxDetails,
          formatCurrency(order.taxTotal, settings?.currency),
          formatCurrency(order.total, settings?.currency),
        ].join(',') + '\n';
    });

    const blob = new Blob(['\ufeff' + csvContent], {
      type: 'text/csv;charset=utf-8;',
    });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `taxes-${formatDate(dateRange?.from, false, lng)}-${formatDate(
        dateRange?.to,
        false,
        lng
      )}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error generating tax report CSV:', error);
    throw new Error('Failed to generate tax report CSV');
  }
}

export const AccountingTaxesManagement = () => {
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

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await getDateOrders({
        startDate: dateRange.from,
        endDate: dateRange.to,
      });

      const ordersWithTaxes = response.filter(order => order.status === 'delivered').filter(
        order => order?.taxes?.length > 0
      )

      const sortedOrders = ordersWithTaxes.sort((a, b) => {
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

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const ordersWithTaxes = allOrders.filter(
        order => order?.taxes?.length > 0
      );
      await generateTaxReportCSV(ordersWithTaxes, t, lng, settings, dateRange);
    } catch (error) {
      console.error(error);
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [dateRange]);

  const totalTaxes = allOrders.reduce((acc, curr) => {
    return acc + (curr.taxTotal || 0);
  }, 0);

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
                {formatCurrency(totalTaxes, settings?.currency)}
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
            onClick={handleDownload}
          >
            <Download className="w-4 h-4 mr-2" />
            {isDownloading
              ? t('common:downloading')
              : t('comptability:download-taxes')}
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
                  {t('comptability:taxes')}
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                  {t('comptability:tax-total')}
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                  {t('comptability:amount')} (HT)
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                  {t('comptability:amount')} (TTC)
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
                        {formatDate(order.createdAt, false, lng)}
                      </td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap">
                        #{order.id}
                      </td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap">
                        {order.taxes.map((tax, idx) => (
                          <div key={idx}>
                            <p>
                              {tax.name} ({tax.rate}%) :{' '}
                              {formatCurrency(tax.amount, settings?.currency)}
                            </p>
                          </div>
                        ))}
                      </td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap">
                        {formatCurrency(order.taxTotal, settings?.currency)}
                      </td>

                      <td className="px-6 py-4 text-sm whitespace-nowrap">
                        {formatCurrency(order.subtotal, settings?.currency)}
                      </td>

                      <td className="px-6 py-4 text-sm whitespace-nowrap">
                        {formatCurrency(
                          order.subtotal + order.taxTotal,
                          settings?.currency
                        )}
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-6">
                      {t('comptability:no-tax-found')}
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
            <p className="text-gray-500">{t('comptability:no-tax-found')}</p>
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
