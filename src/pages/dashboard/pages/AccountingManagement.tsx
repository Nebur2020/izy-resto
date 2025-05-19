import { useState, useRef, useEffect } from 'react';
import { Tabs } from '../../../components/ui/Tabs';
import { AccountingOverview } from '../../../components/dashboard/components/accounting/AccountingOverview';
import { TransactionList } from '../../../components/dashboard/components/accounting/TransactionList';
import { DateFilter } from '../../../components/dashboard/components/accounting/DateFilter';
import { AssetsManagement } from '../../../components/dashboard/components/accounting/AssetsManagement';
import { DebtsManagement } from '../../../components/dashboard/components/accounting/DebtsManagement';
import { Button } from '../../../components/ui/Button';
import { Plus, Download } from 'lucide-react';
import { useAccounting } from '../../../hooks/useAccounting';
import { TransactionForm } from '../../../components/dashboard/components/accounting/TransactionForm';
import { FinancialStatement } from '../../../components/dashboard/components/accounting/FinancialStatement';
import { accountingService } from '../../../services/accounting/accounting.service';
import { exportToPdf } from '../../../utils/export';
import toast from 'react-hot-toast';
import { useSettings } from '../../../hooks';
import { AccountingTaxesManagement } from './AccountingTaxesManagement';
import { AccountingTipsManagement } from './AccountingTipsManagement';
import { AccountingDeliveryManagement } from './AccountingDeliveryManagement';
import { useTranslation } from 'react-i18next';
import { downloadCsv } from '../../../utils/export';
import { Transaction, Order } from '../../../types';
import { formatCurrency } from '../../../utils/currency';
import { formatDate } from '../../../utils/date';
import { Language } from '../../../types';
import { useOrders } from '../../../context/OrderContext';

export function AccountingManagement() {
  const { t, i18n } = useTranslation();
  const { settings, isLoading: settingsLoading } = useSettings();
  const { getDateOrders } = useOrders();

  const [activeTab, setActiveTab] = useState('transactions');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setHours(0, 0, 0, 0)),
    endDate: new Date(),
  });
  const [isDownloading, setIsDownloading] = useState(false);
  const [isExportCsv, setIsExportCsv] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [exportData, setExportData] = useState<any[]>([]);
  const [periodOrders, setPeriodOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const statementRef = useRef<HTMLDivElement>(null);

  const primaryColor = settings?.palette.primary;

  const tabs = [
    { id: 'transactions', label: t('comptability:transaction') },
    { id: 'tax', label: t('comptability:tax') },
    { id: 'tips', label: t('comptability:tip') },
    { id: 'delivery', label: t('comptability:delivery') },
  ];

  // Fetch orders when date range changes
  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoadingOrders(true);
      try {
        const orders = await getDateOrders({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        });
        setPeriodOrders(orders);
      } catch (error) {
        console.error('Error fetching orders for accounting:', error);
        toast.error(t('common:error-loading-orders'));
      } finally {
        setIsLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [dateRange, getDateOrders, t]);

  const {
    transactions,
    stats,
    isLoading,
    isLoadingMore,
    refreshData,
    loadMore,
    hasMore,
    displayedCount,
    totalCount,
    fetchAllTransactions,
  } = useAccounting(dateRange, periodOrders);

  const sortedTransactions = [...transactions].sort((a, b) => {
    const dateA =
      a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
    const dateB =
      b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
    return dateB.getTime() - dateA.getTime();
  });

  const handleDateChange = (start: Date, end: Date) => {
    setDateRange({ startDate: start, endDate: end });
  };

  const handleSaveTransaction = async (data: any) => {
    try {
      await accountingService.createTransaction(data);
      setIsFormOpen(false);
      refreshData();
      toast.success(t('comptability:transaction-successfully-add'));
    } catch (error) {
      console.error('Error saving transaction:', error);
      toast.error(t('comptability:transaction-saving-error'));
    }
  };

  const handleUpdateTransaction = async (id: string, data: any) => {
    try {
      await accountingService.updateTransaction(id, data);
      refreshData();
      toast.success(t('comptability:transaction-successfully-update'));
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast.error(t('comptability:transaction-updating-error'));
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      await accountingService.deleteTransaction(id);
      refreshData();
      toast.success(t('comptability:transaction-successfully-deleted'));
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error(t('comptability:transaction-deleting-error'));
    }
  };
  const handleExport = async () => {
    if (!settings) return;

    try {
      setIsDownloading(true);

      // Fetch all transactions from the selected period
      const allTransactions = await fetchAllTransactions();
      setExportData(allTransactions);

      // Create the financial statement component
      const statement = (
        <FinancialStatement
          transactions={allTransactions}
          period={dateRange}
          settings={settings as any}
          orders={periodOrders}
        />
      );

      // Create a container for rendering the component off-screen
      const root = document.createElement('div');
      root.style.position = 'absolute';
      root.style.left = '-9999px';
      // Add necessary styles for proper rendering
      root.style.width = '1000px';
      root.style.backgroundColor = 'white';
      root.style.padding = '20px';
      root.style.zIndex = '-1000';
      document.body.appendChild(root);

      // Render the component using React 18 createRoot API
      const { createRoot } = await import('react-dom/client');
      const reactRoot = createRoot(root);

      // Wait for rendering to complete
      await new Promise<void>(resolve => {
        reactRoot.render(<div ref={statementRef}>{statement}</div>);
        // Allow more time for complex components to render
        setTimeout(resolve, 500);
      });

      // Export to PDF
      await exportToPdf(root);

      // Clean up
      document.body.removeChild(root);
      reactRoot.unmount();

      toast.success(t('comptability:financial-statements-successfully-export'));
    } catch (error) {
      console.error('Error exporting statement:', error);
      toast.error(t('comptability:export-error'));
    } finally {
      setIsDownloading(false);
    }
  };

  function convertToCsv(transactions: Transaction[]) {
    if (transactions.length === 0) return '';

    // Static keys in the order we want them to appear in the CSV
    const keys = [
      'date',
      'source',
      'description',
      'reference',
      'debit',
      'credit',
      'gross',
      'id',
    ];

    // Translate CSV headers using the translation function
    const headers = keys.map(k => t(`common:${k}`)).join(',');

    // Format rows with proper date and number formatting
    const rows = transactions
      .map(transaction =>
        keys
          .map(key => {
            const value = transaction[key as keyof Transaction];

            // Format date fields
            if (key === 'date') {
              return `"${formatDate(value as string, false,
                i18n.language as Language)}"`;
            }

            // Format numeric fields with proper currency formatting
            if (['debit', 'credit', 'gross'].includes(key)) {
              const numValue = typeof value === 'number' ? value : 0;
              if (numValue === 0) return '0';
              return numValue.toFixed(2);
            }

            // Format string fields with quotes and escape quotes
            if (typeof value === 'string') {
              return `"${value.replace(/"/g, '""')}"`;
            }

            return value || '';
          })
          .join(',')
      )
      .join('\n');

    return `${headers}\n${rows}`;
  }

  const handleExportCsv = async () => {
    if (!settings) return;

    try {
      setIsExportCsv(true);

      const allTransactions = await fetchAllTransactions();

      // Add a summary section at the top of the CSV
      const periodSummary = [
        `"${t('common:period')}","${formatDate(dateRange.startDate, false, i18n.language as Language)} - ${formatDate(dateRange.endDate, false, i18n.language as Language)}"`,
        `"${t('common:total-debit')}","${formatCurrency(stats.totalDebit, settings?.currency)}"`,
        `"${t('common:total-credit')}","${formatCurrency(stats.totalCredit, settings?.currency)}"`,
        `"${t('common:net-amount')}","${formatCurrency(stats.netAmount, settings?.currency)}"`,
        `"${t('common:total-transactions')}","${stats.transactionCount}"`,
        // Add tax, tip, and delivery stats if available
        ...(stats.totalTaxes !== undefined ? [`"${t('comptability:total-taxes')}","${formatCurrency(stats.totalTaxes, settings?.currency)}"`] : []),
        ...(stats.totalTips !== undefined ? [`"${t('comptability:total-tips')}","${formatCurrency(stats.totalTips, settings?.currency)}"`] : []),
        ...(stats.totalDelivery !== undefined ? [`"${t('comptability:total-delivery')}","${formatCurrency(stats.totalDelivery, settings?.currency)}"`] : []),
        `"${t('common:export-date')}","${formatDate(new Date().toISOString(), false, i18n.language as Language)}"`,
        '' // Empty line to separate summary from data
      ].join('\n');

      const csvContent = periodSummary + '\n' + convertToCsv(allTransactions);

      // Use a more descriptive filename with date range
      const startDateStr = formatDate(dateRange.startDate, false, i18n.language as Language).replace(/\//g, '-');
      const endDateStr = formatDate(dateRange.endDate, false, i18n.language as Language).replace(/\//g, '-');
      const fileName = `transactions_${startDateStr}_to_${endDateStr}.csv`;

      downloadCsv(csvContent, fileName);

      toast.success(t('comptability:financial-statements-successfully-export'));
    } catch (error) {
      console.error('Error exporting statement:', error);
      toast.error(t('comptability:export-error'));
    } finally {
      setIsExportCsv(false);
    }
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'assets':
        return <AssetsManagement />;
      case 'debts':
        return <DebtsManagement />;
      case 'tax':
        return <AccountingTaxesManagement />;
      case 'tips':
        return <AccountingTipsManagement />;
      case 'delivery':
        return <AccountingDeliveryManagement />;
      default:
        return (
          <>
            <AccountingOverview stats={stats} isLoading={isLoading} />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <DateFilter
                startDate={dateRange.startDate}
                endDate={dateRange.endDate}
                onDateChange={handleDateChange}
              />
              <div className="flex gap-2">
                <Button
                  onClick={() => setIsFormOpen(true)}
                  variant="custom"
                  style={{ backgroundColor: primaryColor }}
                  spanClassName="text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t('comptability:add-transaction')}
                </Button>
                <Button
                  disabled={(settingsLoading && !settings) || isDownloading}
                  variant="secondary"
                  onClick={handleExport}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isDownloading
                    ? t('common:downloading')
                    : t('comptability:download-financial-assments-pdf')}
                </Button>
                <Button
                  disabled={(settingsLoading && !settings) || isExportCsv}
                  variant="secondary"
                  onClick={handleExportCsv}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isExportCsv
                    ? t('common:downloading')
                    : t('comptability:download-financial-assments-csv')}
                </Button>
              </div>
            </div>

            <TransactionList
              transactions={sortedTransactions}
              isLoading={isLoading}
              isLoadingMore={isLoadingMore}
              onUpdate={handleUpdateTransaction}
              onDelete={handleDeleteTransaction}
              hasMore={hasMore}
              onLoadMore={loadMore}
              displayedCount={displayedCount}
              totalCount={totalCount}
            />
          </>
        );
    }
  };

  return (
    <div className="space-y-6">
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {renderActiveTab()}

      {isFormOpen && (
        <TransactionForm
          onSave={handleSaveTransaction}
          onCancel={() => setIsFormOpen(false)}
        />
      )}

      {settings && exportData.length > 0 && (
        <div className="hidden">
          <div ref={statementRef}>
            <FinancialStatement
              transactions={exportData}
              period={dateRange}
              settings={settings as any}
            />
          </div>
        </div>
      )}
    </div>
  );
}
