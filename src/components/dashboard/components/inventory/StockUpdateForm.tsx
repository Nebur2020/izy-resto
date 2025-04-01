import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Package, Search, Loader2 } from 'lucide-react';
import { Button } from '../../../ui/Button';
import { InventoryItem } from '../../../../types/inventory';
import { useSettings } from '../../../../hooks/useSettings';
import { formatCurrency } from '../../../../utils/currency';
import { useTranslation } from 'react-i18next';

interface IStockUpdateFormProps {
  items: InventoryItem[];
  onSubmit: (data: StockUpdate[]) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export interface StockUpdate {
  itemId: string;
  quantity: number;
  reason: string;
}

export function StockUpdateForm(props: IStockUpdateFormProps) {
  const { items, onSubmit, onCancel, isSubmitting } = props;
  const { t } = useTranslation();
  const { settings } = useSettings();
  const primaryColor = settings?.palette.primary;
  const [searchTerm, setSearchTerm] = useState('');
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<{
    updates: StockUpdate[];
  }>({
    defaultValues: {
      updates: items.map(item => ({
        itemId: item.id,
        quantity: 0,
        reason: '',
      })),
    },
  });

  const updates = watch('updates');

  const filteredItems = items.filter(
    item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFormSubmit = (data: { updates: StockUpdate[] }) => {
    const validUpdates = data.updates.filter(update => update.quantity > 0);
    if (validUpdates.length === 0) return;
    onSubmit(validUpdates);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-6 border-b dark:border-gray-700 gap-4 sm:gap-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between sm:justify-start gap-2">
              <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2 truncate">
                <Package className="w-5 h-5 flex-shrink-0" style={{color: primaryColor}} />
                <span className="truncate">{t('inventory:update-stock')}</span>
              </h2>
              <button
                onClick={onCancel}
                disabled={isSubmitting}
                className="sm:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
              {t('inventory:save-today-used-product')}
            </p>
          </div>
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="hidden sm:block p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 sm:p-6 border-b dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder={t('common:search-product')}
              className="w-full pl-10 pr-4 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700"
            />
          </div>
        </div>
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="flex flex-col flex-1 min-h-0"
        >
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="space-y-4 sm:space-y-6">
              {filteredItems.map(item => {
                const itemIndex = items.findIndex(i => i.id === item.id);
                if (itemIndex === -1) return null;

                return (
                  <div
                    key={item.id}
                    className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 space-y-4"
                  >
                    <div className="flex justify-between items-start">
                      <div className="min-w-0">
                        <h3 className="font-medium truncate">{item.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t('common:current-stock', {
                            quantity: item.quantity,
                          })}{' '}
                          {t(`common:units-name.${item.unit}`)}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t('common:unit-price', {
                            unitPrice: formatCurrency(
                              item.price,
                              settings?.currency
                            ),
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          {t('inventory:used-qte')}
                        </label>
                        <input
                          type="number"
                          {...register(
                            `updates.${itemIndex}.quantity` as const,
                            {
                              min: {
                                value: 0,
                                message: t('inventory:positive-qte-required'),
                              },
                              max: {
                                value: item.quantity,
                                message: t('inventory:qte-greater-than-stock'),
                              },
                            }
                          )}
                          className="w-full rounded-lg border dark:border-gray-600 p-2 dark:bg-gray-700"
                          disabled={isSubmitting}
                        />
                        {errors.updates?.[itemIndex]?.quantity && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.updates[itemIndex].quantity?.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          {t('common:reason')}
                        </label>
                        <input
                          type="text"
                          {...register(`updates.${itemIndex}.reason` as const, {
                            validate: value => {
                              const quantity = updates[itemIndex].quantity;
                              if (quantity > 0 && !value) {
                                return t('inventory:reason-is-required');
                              }
                              return true;
                            },
                          })}
                          placeholder="Ex: Service du soir"
                          className="w-full rounded-lg border dark:border-gray-600 p-2 dark:bg-gray-700"
                          disabled={isSubmitting}
                        />
                        {errors.updates?.[itemIndex]?.reason && (
                          <p className="mt-1 text-sm text-red-500">
                            {errors.updates[itemIndex].reason?.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredItems.length === 0 && (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-500">
                    {t('inventory:no-product-found')}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="border-t dark:border-gray-700 p-4 sm:p-6 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={onCancel}
                disabled={isSubmitting}
                className="w-full sm:w-auto order-2 sm:order-1"
              >
                {t('common:cancel')}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !updates.some(u => u.quantity > 0)}
                className="w-full sm:w-auto min-w-0 sm:min-w-[200px] relative order-1 sm:order-2"
                style={{
                  backgroundColor: primaryColor
                }}
                spanClassName='text-white'
                variant='custom'
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span className="truncate">
                      {t('common:update-in-progress')}
                    </span>
                  </>
                ) : (
                  t('inventory:update-stock-quantity')
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
