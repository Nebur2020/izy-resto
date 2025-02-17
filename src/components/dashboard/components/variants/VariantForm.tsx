import { useForm } from 'react-hook-form';
import { X, Plus, Minus, Type, Layers, List, Package } from 'lucide-react';
import { Button } from '../../../ui/Button';
import { Category } from '../../../../types';
import { useTranslation } from 'react-i18next';
import { useInventory } from '../../../../hooks/useInventory';

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
  inventory: InventoryConnection[][]; // Array of inventory connections for each value
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
}

export function VariantForm(props: IVariantFormProps) {
  const { t } = useTranslation();
  const { variant, categories, onSave, onCancel } = props;
  const { items: inventory } = useInventory();

  // Transform old inventory format to new format
  const transformInventory = (
    variant: Variant | null | undefined
  ): RuntimeVariant | null => {
    if (!variant) return null;

    try {
      // Parse the stringified inventory or create a default structure
      const parsedInventory = variant.inventory
        ? JSON.parse(variant.inventory as any)
        : variant.values.map(() => [{ itemId: '', ratio: 1 }]);

      // Ensure each value has an inventory array
      const initializedInventory = parsedInventory.map(
        (connections: InventoryConnection[] | InventoryConnection) =>
          Array.isArray(connections) ? connections : [connections]
      );

      return {
        ...variant,
        inventory: initializedInventory,
      };
    } catch (error) {
      // If parsing fails, return default structure
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

  const addValue = () => {
    setValue('values', [...values, ''], { shouldDirty: true });
    setValue('prices', [...prices, 0], { shouldDirty: true });
    setValue(
      'inventory',
      [...inventoryConnections, [{ itemId: '', ratio: 1 }]],
      { shouldDirty: true }
    );
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

  const onSubmitWrapper = (data: RuntimeVariant) => {
    // Convert the runtime variant with inventory array to Firestore variant with stringified inventory
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
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {categories.map(category => (
                  <label
                    key={category.id}
                    className={`
                      group flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200
                      ${
                        watch('categoryIds')?.includes(category.id)
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
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {category.name}
                    </span>
                  </label>
                ))}
              </div>
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

              <div className="space-y-4">
                {values.map((_, valueIndex) => (
                  <div
                    key={valueIndex}
                    className="space-y-2 p-4 border rounded-lg dark:border-gray-700"
                  >
                    <div className="flex gap-2">
                      <input
                        {...register(`values.${valueIndex}`, {
                          required: 'La valeur est requise',
                        })}
                        className="flex-1 px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow"
                        placeholder={`Option ${valueIndex + 1}`}
                      />
                      <input
                        type="number"
                        {...register(`prices.${valueIndex}`, {
                          valueAsNumber: true,
                        })}
                        className="w-32 px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow"
                        placeholder="Prix"
                      />
                      {values.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeValue(valueIndex)}
                          className="px-2.5 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    {/* Multiple Inventory Connections */}
                    <div className="space-y-2 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                      {(inventoryConnections?.[valueIndex] || []).map(
                        (_, connectionIndex) => (
                          <div
                            key={connectionIndex}
                            className="flex gap-2 items-center"
                          >
                            <Package className="w-4 h-4 text-gray-400" />
                            <select
                              value={watch(
                                `inventory.${valueIndex}.${connectionIndex}.itemId`
                              )}
                              {...register(
                                `inventory.${valueIndex}.${connectionIndex}.itemId`
                              )}
                              className="flex-1 px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow"
                            >
                              <option value="">Sélectionner un article</option>
                              {inventory.map(item => (
                                <option key={item.id} value={item.id}>
                                  {item.name} ({item.quantity} {item.unit})
                                </option>
                              ))}
                            </select>
                            <input
                              type="number"
                              {...register(
                                `inventory.${valueIndex}.${connectionIndex}.ratio`,
                                {
                                  valueAsNumber: true,
                                  min: 0.01,
                                }
                              )}
                              className="w-32 px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow"
                              placeholder="Ratio"
                              step="0.01"
                            />
                            {inventoryConnections[valueIndex].length > 1 && (
                              <Button
                                type="button"
                                onClick={() =>
                                  removeInventoryConnection(
                                    valueIndex,
                                    connectionIndex
                                  )
                                }
                                className="px-2.5 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        )
                      )}
                      <Button
                        type="button"
                        onClick={() => addInventoryConnection(valueIndex)}
                        className="mt-2 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Ajouter un article
                      </Button>
                    </div>
                  </div>
                ))}
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
