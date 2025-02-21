import React, { useState, useCallback, memo, useMemo } from 'react';
import { Plus, X } from 'lucide-react';
import { FormProvider, useForm, UseFormReturn } from 'react-hook-form';
import { Button } from '../../components/ui/Button';
import {
  InventoryConnection,
  MenuItem,
  MenuItemWithVariants,
  RestaurantSettings,
} from '../../types';
import { useCategories } from '../../hooks/useCategories';
import { useVariants } from '../../hooks/useVariants';
import { useSettings } from '../../hooks/useSettings';
import { LogoUploader } from '../../components/settings/LogoUploader';
import { useInventory } from '../../hooks/useInventory';
import { Tabs } from '../../components/ui/Tabs';
import { motion } from 'framer-motion';
import { VariantManager } from './variants/VariantManager';
import { useTranslation } from 'react-i18next';

interface MenuItemFormProps {
  item?: MenuItem | null;
  onSave: (data: MenuItemWithVariants) => void;
  onCancel: () => void;
}

interface FormInputs {
  name: string;
  description: string;
  price: number;
  image: string;
  categoryId: string;
  stockQuantity: number;
  inventoryConnections: Array<{
    itemId: string;
    ratio: number;
  }>;
}

interface ProductTabProps {
  register: UseFormReturn<FormInputs>['register'];
  errors: UseFormReturn<FormInputs>['formState']['errors'];
  watch: UseFormReturn<FormInputs>['watch'];
  setValue: UseFormReturn<FormInputs>['setValue'];
  settings: RestaurantSettings;
  categories: Array<{
    id: string;
    name: string;
    [key: string]: any;
  }>;
  selectedCategory: string;
  handleCategoryChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

interface VariantsTabProps {
  selectedCategory: string;
  variants: Array<{
    id: string;
    name: string;
    values: string[];
    prices?: number[];
  }>;
  variantPrices: Array<{
    variantCombination: string[];
    price: number;
    image: string;
  }>;
  setVariantPrices: React.Dispatch<
    React.SetStateAction<
      Array<{
        variantCombination: string[];
        price: number;
        image: string;
      }>
    >
  >;
  onVariantChange: () => void;
}

// Memoize the VariantsTab component to prevent unnecessary re-renders
const MemoizedVariantsTab = memo(
  ({
    selectedCategory,
    variants,
    variantPrices,
    setVariantPrices,
    onVariantChange,
  }: VariantsTabProps) => {
    const { t } = useTranslation();

    // Memoize the onChange callback to maintain stable reference
    const handlePriceChange = useCallback(
      newPrices => {
        setVariantPrices(newPrices);
        onVariantChange();
      },
      [setVariantPrices, onVariantChange]
    );

    return (
      <div>
        {selectedCategory && variants.length > 0 ? (
          <VariantManager
            variants={variants}
            value={variantPrices}
            onChange={handlePriceChange}
          />
        ) : (
          <div className="text-center py-8 text-gray-500">
            {t('inventory:select-category-to-add-variants')}
          </div>
        )}
      </div>
    );
  }
);

export const InventoryTab: React.FC<any> = ({
  register,
  watch,
  setValue,
  inventory,
}) => {
  const { t } = useTranslation();
  const [connections, setConnections] = useState<InventoryConnection[]>(
    watch('inventoryConnections') || []
  );

  // Watch for changes to inventoryConnections
  React.useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name?.startsWith('inventoryConnections')) {
        setConnections(value.inventoryConnections || []);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const handleRemoveConnection = useCallback(
    (index: number) => {
      const currentConnections = [...connections];
      currentConnections.splice(index, 1);
      setValue('inventoryConnections', currentConnections, {
        shouldDirty: true,
      });
    },
    [connections, setValue]
  );

  const handleAddConnection = useCallback(() => {
    const newConnection = { itemId: '', ratio: 1 };
    setValue('inventoryConnections', [...connections, newConnection], {
      shouldDirty: true,
      shouldTouch: true,
    });
  }, [connections, setValue]);

  return (
    <div className="space-y-4">
      {connections.map((connection: InventoryConnection, index: number) => (
        <div key={`connection-${index}`} className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">
              {t('variant:product')}
            </label>
            <select
              {...register(`inventoryConnections.${index}.itemId`)}
              className="w-full rounded-lg border dark:border-gray-600 p-2 dark:bg-gray-700"
            >
              <option value="">{t('variant:select-inventory-product')}</option>
              {inventory.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">
              Ratio (1:{watch(`inventoryConnections.${index}.ratio`) || '0'})
            </label>
            <span className="text-sm">{t('variant:ratio-description')}</span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              {...register(`inventoryConnections.${index}.ratio`)}
              className="w-full rounded-lg border dark:border-gray-600 p-2 dark:bg-gray-700"
              placeholder="Ex: 3 pour 1:3"
            />
          </div>

          <Button
            type="button"
            variant="ghost"
            onClick={() => handleRemoveConnection(index)}
            className="mt-6"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ))}

      <Button
        type="button"
        variant="secondary"
        onClick={handleAddConnection}
        className="mt-4"
      >
        <Plus className="w-4 h-4 mr-2" />
        {t('variant:add-inventory-connection')}
      </Button>
    </div>
  );
};

// Memoize the BasicInfoTab component
const BasicInfoTab = ({
  register,
  errors,
  watch,
  setValue,
  settings,
  categories,
  selectedCategory,
  handleCategoryChange,
}: ProductTabProps) => {
  const { t } = useTranslation();

  const [image, setImage] = useState<string>(watch('image'));

  // Watch for changes to inventoryConnections
  React.useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name?.startsWith('image')) {
        setImage(value.image || '');
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1">
            {t('common:name')}
          </label>
          <input
            type="text"
            {...register('name', { required: t('common:name-is-required') })}
            className="w-full rounded-lg border dark:border-gray-600 p-2 dark:bg-gray-700"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            {t('common:category')}
          </label>
          <select
            {...register('categoryId', {
              required: t('common:category-is-required'),
            })}
            onChange={handleCategoryChange}
            value={selectedCategory}
            className="w-full rounded-lg border dark:border-gray-600 p-2 dark:bg-gray-700"
          >
            <option value="">{t('common:select-category')}</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="mt-1 text-sm text-red-500">
              {errors.categoryId.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            {t('common:price')}
          </label>
          <input
            type="number"
            step={settings?.currency === 'XOF' ? '1' : '0.01'}
            {...register('price', {
              required: t('common:price-is-required'),
              min: { value: 0, message: t('common:price-must-be-positive') },
            })}
            className="w-full rounded-lg border dark:border-gray-600 p-2 dark:bg-gray-700"
          />
          {errors.price && (
            <p className="mt-1 text-sm text-red-500">{errors.price.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            {t('common:stock-quantity')}
          </label>
          <input
            type="number"
            {...register('stockQuantity', {
              required: t('common:stock-quantity-is-required'),
              min: { value: 0, message: 'Le stock doit être positif' },
            })}
            className="w-full rounded-lg border dark:border-gray-600 p-2 dark:bg-gray-700"
          />
          {errors.stockQuantity && (
            <p className="mt-1 text-sm text-red-500">
              {errors.stockQuantity.message}
            </p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">
            {t('common:description')}
          </label>
          <textarea
            {...register('description', {
              required: t('common:description-is-required'),
            })}
            rows={3}
            className="w-full rounded-lg border dark:border-gray-600 p-2 dark:bg-gray-700"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-500">
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="md:col-span-2">
          <LogoUploader
            value={image}
            onChange={url => setValue('image', url, { shouldDirty: true })}
            label={t('common:product-image')}
            description={t('common:product-image-description')}
          />
        </div>
      </div>
    </div>
  );
};

export function MenuItemForm({ item, onSave, onCancel }: MenuItemFormProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('product');
  const { categories } = useCategories();
  const { settings } = useSettings();
  const [selectedCategory, setSelectedCategory] = useState(
    item?.categoryId || ''
  );
  const { items: inventory } = useInventory();
  const { variants } = useVariants(selectedCategory);
  const [variantPrices, setVariantPrices] = useState(
    (item as MenuItemWithVariants)?.variantPrices || []
  );

  const [isVariantPricesDirty, setIsVariantPricesDirty] = useState(false);

  const methods = useForm<FormInputs>({
    defaultValues: {
      name: item?.name || '',
      description: item?.description || '',
      price: item?.price || 0,
      image: item?.image || '',
      categoryId: item?.categoryId || '',
      stockQuantity: item?.stockQuantity || 0,
      inventoryConnections: item?.inventoryConnections || [],
    },
    mode: 'onChange', // This will validate on change
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = methods;

  const [initialVariantPrices] = useState(
    JSON.stringify((item as MenuItemWithVariants)?.variantPrices || [])
  );

  // Memoize variant calculations
  const getVariantPriceModifier = useCallback(
    (variantName: string, value: string): number => {
      const variant = variants.find(v => v.name === variantName);
      if (!variant) return 0;

      const variantValue = variant.values.find(v => v === value);
      if (!variantValue) return 0;

      const valueIndex = variant.values.indexOf(variantValue);
      return variant.prices?.[valueIndex] || 0;
    },
    [variants]
  );

  const calculatePriceModifiers = useCallback(
    (combination: string[]): number => {
      return combination.reduce((total, variantStr) => {
        const [variantName, value] = variantStr.split(': ');
        return total + getVariantPriceModifier(variantName, value);
      }, 0);
    },
    [getVariantPriceModifier]
  );

  const getVariantCombinations = useCallback(() => {
    if (!variants.length) return [];

    const combinations: string[][] = [[]];
    variants.forEach(variant => {
      const newCombinations: string[][] = [];
      variant.values.forEach(value => {
        combinations.forEach(combo => {
          newCombinations.push([...combo, `${variant.name}: ${value}`]);
        });
      });
      combinations.length = 0;
      combinations.push(...newCombinations);
    });
    return combinations;
  }, [variants]);

  // Memoize handlers to prevent recreation on each render
  const handleVariantChange = useCallback(() => {
    setIsVariantPricesDirty(true);
  }, []);

  const handleCategoryChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;
      setSelectedCategory(value);
      setValue('categoryId', value, { shouldDirty: true });
      if (value !== item?.categoryId) {
        setVariantPrices([]);
        setIsVariantPricesDirty(true);
      }
    },
    [item?.categoryId, setValue]
  );

  const handleFormSubmit = useCallback(
    (formData: any) => {
      const allCombinations = getVariantCombinations();
      const basePrice = Number(formData.price);

      const menuItem: MenuItemWithVariants = {
        ...formData,
        price: Number(formData.price),
        stockQuantity: Number(formData.stockQuantity),
        variantPrices: variantPrices.map(vp => ({
          ...vp,
          price: Number(vp.price),
        })),
        defaultVariantPrices: [],
        inventoryConnections: formData.inventoryConnections
          .filter((conn: any) => conn.itemId && conn.ratio)
          .map((conn: any) => ({
            ...conn,
            ratio: Number(conn.ratio),
          })),
      };
      onSave(menuItem);
    },
    [variantPrices, calculatePriceModifiers, getVariantCombinations, onSave]
  );

  // Memoize tabs array
  const tabs = useMemo(
    () => [
      { id: 'product', label: t('common:base-information') },
      { id: 'variants', label: t('common:variants') },
      { id: 'inventory', label: t('common:inventory') },
    ],
    [t]
  );

  // Memoize tab content renderer
  const renderTabContent = useCallback(() => {
    switch (activeTab) {
      case 'product':
        return (
          <BasicInfoTab
            register={register}
            errors={errors}
            watch={watch}
            setValue={setValue}
            settings={settings!}
            categories={categories}
            selectedCategory={selectedCategory}
            handleCategoryChange={handleCategoryChange}
          />
        );
      case 'inventory':
        return (
          <InventoryTab
            register={register}
            watch={watch}
            setValue={setValue}
            inventory={inventory}
          />
        );
      case 'variants':
        return (
          <MemoizedVariantsTab
            selectedCategory={selectedCategory}
            variants={variants}
            variantPrices={variantPrices}
            setVariantPrices={setVariantPrices}
            onVariantChange={handleVariantChange}
          />
        );
      default:
        return null;
    }
  }, [
    activeTab,
    register,
    errors,
    watch,
    setValue,
    settings,
    categories,
    selectedCategory,
    handleCategoryChange,
    inventory,
    variants,
    variantPrices,
    handleVariantChange,
  ]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-[90vw] max-w-4xl h-[80vh] flex flex-col"
      >
        <div className="flex justify-between items-center p-4 md:p-6 border-b dark:border-gray-700/80">
          <h2 className="text-lg md:text-xl font-semibold">
            {item ? t('inventory:update-product') : t('inventory:new-product')}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit(handleFormSubmit)}
            className="flex flex-col flex-1 overflow-hidden"
          >
            <div className="flex-1 flex flex-col overflow-hidden p-2">
              <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
              <div className="flex-1 overflow-y-auto p-4 md:p-6">
                {renderTabContent()}
              </div>
            </div>

            <div className="p-4 md:p-6 border-t dark:border-gray-700/80 mt-auto">
              <div className="flex justify-end gap-4">
                <Button type="button" variant="ghost" onClick={onCancel}>
                  {t('common:cancel')}
                </Button>
                <Button
                  type="submit"
                  className={`
                    px-6 py-2 rounded-lg font-medium text-white
                    transition-all duration-200
                    bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl
                  `}
                >
                  {item ? t('common:update') : t('common:add')}
                </Button>
              </div>
            </div>
          </form>
        </FormProvider>
      </motion.div>
    </div>
  );
}
