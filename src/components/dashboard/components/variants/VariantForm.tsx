import { useForm } from 'react-hook-form';
import {
  X,
  Plus,
  Minus,
  Type,
  Layers,
  List,
  Package,
  ChevronDown,
  ArrowUpDown,
  Trash2,
} from 'lucide-react';
import { Button } from '../../../ui/Button';
import { Category } from '../../../../types';
import { useTranslation } from 'react-i18next';
import { useInventory } from '../../../../hooks/useInventory';
import { useState, useEffect } from 'react';

interface InventoryConnection {
  itemId: string;
  ratio: number;
}

interface Variant {
  id?: string;
  name: string;
  type: string;
  categoryIds: string[];
  isRequired: boolean;
  values: string[];
  prices: number[];
  inventory: InventoryConnection[][];
}

interface RuntimeVariant {
  id?: string;
  name: string;
  type: string;
  categoryIds: string[];
  isRequired: boolean;
  values: string[];
  prices: number[];
  inventory: InventoryConnection[][];
}

interface IVariantFormProps {
  variant?: Variant | null;
  categories: Category[];
  onSave: (data: Omit<Variant, 'id'>) => Promise<void>;
  onCancel: () => void;
  loadMoreCategories?: () => Promise<void>;
  hasMoreCategories?: boolean;
}

export function VariantForm(props: IVariantFormProps) {
  const { t } = useTranslation();
  const {
    variant,
    categories,
    onSave,
    onCancel,
    loadMoreCategories,
    hasMoreCategories = false,
  } = props;
  const { items: inventory } = useInventory();
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [activeValueTab, setActiveValueTab] = useState(0);

  const transformInventory = (
    variant: Variant | null | undefined
  ): RuntimeVariant | null => {
    if (!variant) return null;

    try {
      const parsedInventory = variant.inventory
        ? JSON.parse(variant.inventory as any)
        : variant.values.map(() => [{ itemId: '', ratio: 1 }]);

      const initializedInventory = parsedInventory.map(
        (connections: InventoryConnection[] | InventoryConnection) =>
          Array.isArray(connections) ? connections : [connections]
      );

      return {
        ...variant,
        inventory: initializedInventory,
      };
    } catch (error) {
      console.error('Error parsing inventory:', error);
      return {
        ...variant,
        inventory: variant.values.map(() => [{ itemId: '', ratio: 1 }]),
      };
    }
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<RuntimeVariant>({
    defaultValues: transformInventory(variant) || {
      name: '',
      type: '',
      values: [''],
      prices: [0],
      inventory: [[{ itemId: '', ratio: 1 }]],
      categoryIds: [],
      isRequired: false,
    },
  });

  const values = watch('values');
  const prices = watch('prices');
  const inventoryConnections = watch('inventory');
  const categoryIds = watch('categoryIds');

  useEffect(() => {
    // If we delete all values, we should set activeValueTab to 0
    if (values.length === 0) {
      setActiveValueTab(0);
    }
    // If the activeValueTab is out of range, set it to the last value
    else if (activeValueTab >= values.length) {
      setActiveValueTab(values.length - 1);
    }
  }, [values.length, activeValueTab]);

  const addValue = () => {
    setValue('values', [...values, ''], { shouldDirty: true });
    setValue('prices', [...prices, 0], { shouldDirty: true });
    setValue(
      'inventory',
      [...inventoryConnections, [{ itemId: '', ratio: 1 }]],
      { shouldDirty: true }
    );
    // Set active tab to the new value
    setActiveValueTab(values.length);
  };

  const removeValue = (index: number) => {
    setValue(
      'values',
      values.filter((_, i) => i !== index),
      { shouldDirty: true }
    );
    setValue(
      'prices',
      prices.filter((_, i) => i !== index),
      { shouldDirty: true }
    );
    setValue(
      'inventory',
      inventoryConnections.filter((_, i) => i !== index),
      { shouldDirty: true }
    );
  };

  const addInventoryConnection = (valueIndex: number) => {
    const newInventoryConnections = [...(inventoryConnections || [])];
    const currentConnections = newInventoryConnections[valueIndex] || [];
    newInventoryConnections[valueIndex] = [
      ...currentConnections,
      { itemId: '', ratio: 1 },
    ];
    setValue('inventory', newInventoryConnections, { shouldDirty: true });
  };

  const removeInventoryConnection = (
    valueIndex: number,
    connectionIndex: number
  ) => {
    const newInventoryConnections = [...(inventoryConnections || [])];
    if (newInventoryConnections[valueIndex]) {
      newInventoryConnections[valueIndex] = newInventoryConnections[
        valueIndex
      ].filter((_, i) => i !== connectionIndex);
      setValue('inventory', newInventoryConnections, { shouldDirty: true });
    }
  };

  const handleLoadMoreCategories = async () => {
    if (loadMoreCategories && !categoriesLoading) {
      setCategoriesLoading(true);
      try {
        await loadMoreCategories();
      } finally {
        setCategoriesLoading(false);
      }
    }
  };

  const onSubmitWrapper = (data: RuntimeVariant) => {
    const firestoreVariant: Omit<Variant, 'id'> = {
      ...data,
      inventory: JSON.stringify(data.inventory) as any,
    };
    onSave(firestoreVariant);
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="relative border-b dark:border-gray-700">
          <div className="px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-500" />
              {variant ? t('variant:update-variant') : t('variant:new-variant')}
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {variant
                ? t('variant:update-variant-option')
                : t('variant:add-new-variant')}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="absolute right-4 top-4 p-2 rounded-full text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form
          onSubmit={handleSubmit(onSubmitWrapper)}
          className="overflow-y-auto max-h-[calc(90vh-80px)]"
        >
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Type className="w-4 h-4" />
                {t('variant:variant-name')}
              </label>
              <input
                type="text"
                {...register('name', { required: 'Le nom est requis' })}
                className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow"
                placeholder="ex: Taille, Couleur, Options..."
              />
              {errors.name && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-red-500" />
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  {...register('isRequired')}
                  className="rounded border-gray-300 dark:border-gray-600"
                />
                <span>{t('variant:variant-required')}</span>
              </label>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <List className="w-4 h-4" />
                {t('variant:variant-category-applicable')}
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1 border rounded-lg dark:border-gray-700">
                {categories.map(category => (
                  <label
                    key={category.id}
                    className={`
                      group flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200
                      ${
                        categoryIds?.includes(category.id)
                          ? 'bg-blue-50 border-blue-500 dark:bg-blue-900/20 dark:border-blue-400'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                      }
                    `}
                  >
                    <input
                      type="checkbox"
                      value={category.id}
                      {...register('categoryIds', {
                        required: 'Sélectionnez au moins une catégorie',
                      })}
                      className="rounded-md border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                      {category.name}
                    </span>
                  </label>
                ))}
              </div>

              {hasMoreCategories && (
                <div className="flex justify-center">
                  <Button
                    type="button"
                    onClick={handleLoadMoreCategories}
                    disabled={categoriesLoading}
                    className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 flex items-center gap-2"
                  >
                    {categoriesLoading ? (
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                    {t('common:load-more')}
                  </Button>
                </div>
              )}

              {errors.categoryIds && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-red-500" />
                  {errors.categoryIds.message}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Layers className="w-4 h-4" />
                  {t('variant:variant-and-value')}
                </label>
                <Button
                  type="button"
                  onClick={addValue}
                  className="px-3 py-1.5 text-sm bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 dark:text-blue-400"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  {t('common:add')}
                </Button>
              </div>

              {/* Improved Variant Values UI */}
              <div className="border rounded-lg dark:border-gray-700 overflow-hidden">
                {/* Tabs */}
                {values.length > 0 && (
                  <div className="flex overflow-x-auto bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
                    {values.map((value, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setActiveValueTab(index)}
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm whitespace-nowrap ${
                          activeValueTab === index
                            ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 border-b-2 border-blue-500'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                        }`}
                      >
                        <span className="truncate max-w-32">
                          {value || `Option ${index + 1}`}
                        </span>
                        {values.length > 1 && (
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              removeValue(index);
                            }}
                            className="p-1 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* Active Tab Content */}
                {values.length > 0 && (
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                          {t('common:value-name')}
                        </label>
                        <input
                          {...register(`values.${activeValueTab}`, {
                            required: 'La valeur est requise',
                          })}
                          className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow"
                          placeholder={`Option ${activeValueTab + 1}`}
                        />
                        {errors.values?.[activeValueTab] && (
                          <p className="text-sm text-red-500 mt-1">
                            {errors.values[activeValueTab]?.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                          {t('common:price-adjustment')}
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                            +
                          </span>
                          <input
                            type="number"
                            {...register(`prices.${activeValueTab}`, {
                              valueAsNumber: true,
                            })}
                            className="w-full pl-8 pr-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow"
                            placeholder="0.00"
                            step="0.01"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 mt-6">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          {t('variant:inventory-connections')}
                        </h4>
                        <Button
                          type="button"
                          onClick={() => addInventoryConnection(activeValueTab)}
                          className="px-3 py-1.5 text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 dark:text-blue-400"
                        >
                          <Plus className="w-3.5 h-3.5 mr-1" />
                          {t('common:add-article')}
                        </Button>
                      </div>

                      {(inventoryConnections?.[activeValueTab] || []).length ===
                      0 ? (
                        <div className="flex flex-col items-center justify-center py-8 px-4 border border-dashed rounded-lg dark:border-gray-700">
                          <Package className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-2" />
                          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                            {t('variant:no-inventory-connections')}
                          </p>
                          <Button
                            type="button"
                            onClick={() =>
                              addInventoryConnection(activeValueTab)
                            }
                            className="mt-3 px-3 py-1.5 text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 dark:text-blue-400"
                          >
                            <Plus className="w-3.5 h-3.5 mr-1" />
                            {t('common:add-article')}
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3 border rounded-lg p-3 dark:border-gray-700">
                          {(inventoryConnections?.[activeValueTab] || []).map(
                            (_, connectionIndex) => (
                              <div
                                key={connectionIndex}
                                className="flex gap-2 items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                              >
                                <div className="flex-1 grid grid-cols-12 gap-2 items-center">
                                  <div className="col-span-7">
                                    <select
                                      value={watch(
                                        `inventory.${activeValueTab}.${connectionIndex}.itemId`
                                      )}
                                      {...register(
                                        `inventory.${activeValueTab}.${connectionIndex}.itemId`
                                      )}
                                      className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow text-sm"
                                    >
                                      <option value="">
                                        {t('common:select-items')}
                                      </option>
                                      {inventory.map(item => (
                                        <option key={item.id} value={item.id}>
                                          {item.name} ({item.quantity}{' '}
                                          {item.unit})
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                  <div className="col-span-4">
                                    <div className="relative">
                                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                                        ×
                                      </span>
                                      <input
                                        type="number"
                                        {...register(
                                          `inventory.${activeValueTab}.${connectionIndex}.ratio`,
                                          {
                                            valueAsNumber: true,
                                            min: 0.01,
                                          }
                                        )}
                                        className="w-full pl-7 pr-2 py-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow text-sm"
                                        placeholder="1.00"
                                        step="0.01"
                                      />
                                    </div>
                                  </div>
                                  <div className="col-span-1 flex justify-end">
                                    {inventoryConnections[activeValueTab]
                                      .length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          removeInventoryConnection(
                                            activeValueTab,
                                            connectionIndex
                                          )
                                        }
                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Empty state */}
                {values.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 px-4">
                    <ArrowUpDown className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                    <h3 className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('variant:no-values-yet')}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
                      {t('variant:add-values-description')}
                    </p>
                    <Button
                      type="button"
                      onClick={addValue}
                      className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-900/30 dark:hover:bg-blue-900/40 dark:text-blue-300"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {t('variant:add-first-value')}
                    </Button>
                  </div>
                )}
              </div>
              {errors.values && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-red-500" />
                  {t('variant:variant-value-required')}
                </p>
              )}
            </div>
          </div>
          <div className="border-t dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {t('common:cancel')}
              </Button>
              <Button
                type="submit"
                disabled={!isDirty}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-sm disabled:opacity-50"
              >
                {variant ? t('common:update') : t('common:add')}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
