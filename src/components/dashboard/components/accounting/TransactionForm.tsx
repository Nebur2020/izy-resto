import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { Button } from '../../../ui/Button';
import { Transaction } from '../../../../types/accounting';
import { useSettings } from '../../../../hooks/useSettings';
import { useTranslation } from 'react-i18next';

interface ITransactionFormProps {
  transaction?: Transaction;
  onSave: (data: Omit<Transaction, 'id'>) => Promise<void>;
  onCancel: () => void;
}

export function TransactionForm(props: ITransactionFormProps) {
  const { t } = useTranslation();
  const { transaction, onSave, onCancel } = props;
  const { settings } = useSettings();
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: transaction || {
      date: new Date().toISOString().split('T')[0],
      source: '',
      description: '',
      reference: '',
      debit: 0,
      credit: 0,
    },
  });

  const handleFormSubmit = async (data: any) => {
    try {
      setIsLoading(true);
      const formattedData = {
        ...data,
        debit: parseFloat(data.debit) || 0,
        credit: parseFloat(data.credit) || 0,
      };
      await onSave(formattedData);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold">
            {transaction
              ? t('comptability:update-transaction')
              : t('comptability:add-transaction')}
          </h2>
          <button onClick={onCancel}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="p-6 space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('comptability:date')}
              </label>
              <input
                type="date"
                {...register('date', {
                  required: t('comptability:date-is-required'),
                })}
                className="w-full rounded-lg border dark:border-gray-600 p-2 dark:bg-gray-700"
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.date.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {t('comptability:source')}
              </label>
              <input
                type="text"
                {...register('source', {
                  required: t('comptability:source-is-required'),
                })}
                className="w-full rounded-lg border dark:border-gray-600 p-2 dark:bg-gray-700"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">
                {t('comptability:description')}
              </label>
              <input
                type="text"
                {...register('description', {
                  required: t('comptability:description-is-required'),
                })}
                className="w-full rounded-lg border dark:border-gray-600 p-2 dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {t('comptability:flow')}
              </label>
              <input
                type="number"
                step={settings?.currency === 'XOF' ? '1' : '0.01'}
                {...register('debit', { min: 0 })}
                className="w-full rounded-lg border dark:border-gray-600 p-2 dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {t('comptability:credit')}
              </label>
              <input
                type="number"
                step={settings?.currency === 'XOF' ? '1' : '0.01'}
                {...register('credit', { min: 0 })}
                className="w-full rounded-lg border dark:border-gray-600 p-2 dark:bg-gray-700"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">
                {t('comptability:references')}
              </label>
              <input
                type="text"
                {...register('reference')}
                className="w-full rounded-lg border dark:border-gray-600 p-2 dark:bg-gray-700"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <Button type="button" variant="secondary" onClick={onCancel}>
              {t('common:cancel')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {transaction ? t('common:update') : t('common:add')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
