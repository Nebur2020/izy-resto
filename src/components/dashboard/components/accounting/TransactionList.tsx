import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, Trash2, ChevronDown, Loader2 } from 'lucide-react';
import { Transaction } from '../../../../types/accounting';
import { useSettings } from '../../../../hooks/useSettings';
import { formatCurrency } from '../../../../utils/currency';
import { formatDate } from '../../../../utils/date';
import { Button } from '../../../ui/Button';
import { TransactionForm } from './TransactionForm';
import { ConfirmationModal } from '../../../ui/ConfirmationModal';
import { useTranslation } from 'react-i18next';
import { Language } from '../../../../types';

interface TransactionListProps {
  transactions: Transaction[];
  isLoading: boolean;
  isLoadingMore?: boolean;
  onUpdate: (id: string, data: Partial<Transaction>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  hasMore?: boolean;
  onLoadMore?: () => void;
  displayedCount?: number;
  totalCount?: number;
}

export const sourceText: Record<string, string> = {
  orders: 'commandes',
  inventory: 'Inventaire',
};

export function TransactionList({
  transactions,
  isLoading,
  isLoadingMore = false,
  onUpdate,
  onDelete,
  hasMore = false,
  onLoadMore,
  displayedCount = 0,
  totalCount = 0,
}: TransactionListProps) {
  const { t, i18n } = useTranslation();
  const lng = i18n.language as Language;
  const { settings } = useSettings();

  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    transactionId?: string;
  }>({ isOpen: false });

  if (isLoading && transactions.length === 0) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-16 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg"
          />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b dark:border-gray-700 text-left">
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                  {t('comptability:date')}
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                  {t('comptability:source')}
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                  {t('comptability:description')}
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                  {t('comptability:reference')}
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase text-right">
                  {t('comptability:flow')} (HT)
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase text-right">
                  {t('comptability:credit')} (HT)
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              <AnimatePresence mode="wait" initial={false}>
                {transactions.map((transaction, index) => (
                  <motion.tr
                    key={transaction.id}
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
                      {formatDate(transaction.date, false, lng)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {sourceText[transaction.source] || transaction.source}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {transaction.description}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      {transaction.reference ||
                        `#${transaction.id}`.slice(0, 6)}
                    </td>
                    <td className="px-6 py-4 text-sm text-right">
                      {transaction.debit > 0 && (
                        <span className="text-red-600 dark:text-red-400">
                          {formatCurrency(
                            transaction.debit,
                            settings?.currency
                          )}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-right">
                      {transaction.credit > 0 && (
                        <span className="text-green-600 dark:text-green-400">
                          {formatCurrency(
                            transaction.credit,
                            settings?.currency
                          )}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingTransaction(transaction)}
                          className="text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setDeleteConfirmation({
                              isOpen: true,
                              transactionId: transaction.id,
                            })
                          }
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>

              {transactions.length === 0 && !isLoading && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    {t('comptability:no-transaction-found')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {(hasMore || isLoadingMore) && (
          <div className="px-6 py-4 border-t dark:border-gray-700">
            <Button
              variant="outline"
              onClick={onLoadMore}
              disabled={isLoading || isLoadingMore}
              className="w-full flex items-center justify-center gap-2"
            >
              {isLoadingMore ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
              <span>
                {isLoadingMore ? t('common:loading') : t('common:load-more')}
                {displayedCount > 0 && totalCount > 0 && (
                  <span className="ml-1 text-gray-500">
                    ({displayedCount}/{totalCount})
                  </span>
                )}
              </span>
            </Button>
          </div>
        )}
      </div>

      {editingTransaction && (
        <TransactionForm
          transaction={editingTransaction}
          onSave={async data => {
            await onUpdate(editingTransaction.id, data);
            setEditingTransaction(null);
          }}
          onCancel={() => setEditingTransaction(null)}
        />
      )}

      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false })}
        onConfirm={async () => {
          if (deleteConfirmation.transactionId) {
            await onDelete(deleteConfirmation.transactionId);
            setDeleteConfirmation({ isOpen: false });
          }
        }}
        title={t('comptability:delete-transaction')}
        message={t('comptability:delete-transaction-confirmation')}
      />
    </>
  );
}
