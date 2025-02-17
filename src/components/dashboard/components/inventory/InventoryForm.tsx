import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { Button } from '../../../ui/Button';
import { InventoryItem } from '../../../../types/inventory';
import { useSettings } from '../../../../hooks/useSettings';
import { getCurrencyObject } from '../../../../constants/defaultSettings';
import { useTranslation } from 'react-i18next';

interface IInventoryFormProps {
  item?: InventoryItem | null;
  onSave: (data: Omit<InventoryItem, 'id'>) => void;
  onCancel: () => void;
}

export function InventoryForm(props: IInventoryFormProps) {
  const { item, onSave, onCancel } = props;
  const { t } = useTranslation();
  const { settings } = useSettings();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Omit<InventoryItem, 'id'>>({
    defaultValues: item
      ? {
          name: item.name,
          description: item.description || '',
          quantity: item.quantity,
          unit: item.unit,
          minQuantity: item.minQuantity,
          category: item.category,
          price: item.price,
          supplier: item.supplier || '',
          expiryDate: item.expiryDate || '',
        }
      : {
          name: '',
          description: '',
          quantity: 0,
          unit: 'unités',
          minQuantity: 0,
          category: 'ingredients',
          price: 0,
          supplier: '',
          expiryDate: '',
        },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="flex flex-col w-full max-w-2xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-xl shadow-xl">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold">
            {item ? t('inventory:update-product') : t('inventory:new-product')}
          </h2>
          <button
            onClick={onCancel}
            className="hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit(onSave)} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t('common:name')}
                </label>
                <input
                  type="text"
                  {...register('name', { required: t('common:name-required') })}
                  className="w-full rounded-lg border dark:border-gray-600 p-2 dark:bg-gray-700"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  {t('inventory:category')}
                </label>
                <select
                  {...register('category')}
                  className="w-full rounded-lg border dark:border-gray-600 p-2 dark:bg-gray-700"
                >
                  <option value="ingredients">{t('common:ingredients')}</option>
                  <option value="boissons">{t('common:beverages')}</option>
                  <option value="fournitures">{t('common:supplies')}</option>
                  <option value="emballages">{t('common:packaging')}</option>
                  <option value="nettoyage">
                    {t('common:maintenant-product')}
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  {t('inventory:qte')}
                </label>
                <input
                  type="number"
                  {...register('quantity', {
                    required: t('inventory:qte-required'),
                    min: {
                      value: 0,
                      message: t('inventory:positive-qte-required'),
                    },
                  })}
                  className="w-full rounded-lg border dark:border-gray-600 p-2 dark:bg-gray-700"
                />
                {errors.quantity && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.quantity.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  {t('inventory:unit')}
                </label>
                <select
                  {...register('unit')}
                  className="w-full rounded-lg border dark:border-gray-600 p-2 dark:bg-gray-700"
                >
                  <option value="unités">{t('inventory:units')}</option>
                  <option value="kg">{t('inventory:kg')}</option>
                  <option value="g">{t('inventory:gramme')}</option>
                  <option value="l">{t('inventory:litres')}</option>
                  <option value="ml">{t('inventory:millilitres')}</option>
                  <option value="cartons">{t('inventory:cartons')}</option>
                  <option value="packs">{t('inventory:packs')}</option>
                  <option value="lb">{t('inventory:lb')}</option>
                  <option value="oz">{t('inventory:oz')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  {t('inventory:qte-minmale')}
                </label>
                <input
                  type="number"
                  {...register('minQuantity', {
                    required: t('inventory:qty-min-required'),
                    min: {
                      value: 0,
                      message: t('inventory:qty-min-positive'),
                    },
                  })}
                  className="w-full rounded-lg border dark:border-gray-600 p-2 dark:bg-gray-700"
                />
                {errors.minQuantity && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.minQuantity.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  {t('inventory:unit-price')}
                  {settings?.currency
                    ? ` (${getCurrencyObject(settings?.currency)?.display})`
                    : ''}
                </label>
                <input
                  type="number"
                  step={settings?.currency === 'XOF' ? '1' : '0.01'}
                  {...register('price', {
                    required: t('inventory:price-required'),
                    min: {
                      value: 0,
                      message: t('inventory:price-must-be-positive'),
                    },
                  })}
                  className="w-full rounded-lg border dark:border-gray-600 p-2 dark:bg-gray-700"
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.price.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  {t('inventory:supplier')}
                </label>
                <input
                  type="text"
                  {...register('supplier')}
                  className="w-full rounded-lg border dark:border-gray-600 p-2 dark:bg-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  {t('inventory:expiry-date')}
                </label>
                <input
                  lang="fr"
                  type="date"
                  {...register('expiryDate')}
                  className="w-full rounded-lg border dark:border-gray-600 p-2 dark:bg-gray-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {t('common:description')}
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="w-full rounded-lg border dark:border-gray-600 p-2 dark:bg-gray-700"
              />
            </div>
          </form>
        </div>
        <div className="p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex justify-end gap-4">
            <Button type="button" variant="secondary" onClick={onCancel}>
              {t('common:cancel')}
            </Button>
            <Button onClick={handleSubmit(onSave)} disabled={isSubmitting}>
              {isSubmitting
                ? t('common:saving')
                : item
                ? t('common:update')
                : t('common:add')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
