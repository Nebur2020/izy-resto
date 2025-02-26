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

export function AccountingManagement() {
  const { t } = useTranslation();
  const { settings, isLoading: settingsLoading } = useSettings();

  const [activeTab, setActiveTab] = useState('transactions');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setHours(0, 0, 0, 0)),
    endDate: new Date(),
  });
  const [isDownloading, setIsDownloading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [exportData, setExportData] = useState<any[]>([]);
  const statementRef = useRef<HTMLDivElement>(null);

  const tabs = [
    { id: 'transactions', label: t('comptability:transaction') },
    { id: 'tax', label: t('comptability:tax') },
    { id: 'tips', label: t('comptability:tip') },
    { id: 'delivery', label: t('comptability:delivery') },
  ];

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
  } = useAccounting(dateRange);

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

      // Fetch all transactions for export
      const allTransactions = await fetchAllTransactions();
      setExportData(allTransactions);

      const statement = (
        <FinancialStatement
          transactions={allTransactions}
          period={dateRange}
          settings={settings as any}
        />
      );

      const root = document.createElement('div');
      root.style.position = 'absolute';
      root.style.left = '-9999px';
      document.body.appendChild(root);

      const { createRoot } = await import('react-dom/client');
      const reactRoot = createRoot(root);
      await new Promise<void>(resolve => {
        reactRoot.render(<div ref={statementRef}>{statement}</div>);
        setTimeout(resolve, 100);
      });

      await exportToPdf(root);

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
                <Button onClick={() => setIsFormOpen(true)}>
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
                    : t('comptability:download-financial-assments')}
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
