import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useForm, FormProvider, UseFormReturn } from 'react-hook-form';
import {
  MenuItem,
  MenuItemWithVariants,
  RestaurantSettings,
} from '../../types';
import { LogoUploader } from '../settings/LogoUploader';
import { useCategories } from '../../hooks/useCategories';
import { useVariants } from '../../hooks/useVariants';
import { useSettings } from '../../hooks/useSettings';
import { useInventory } from '../../hooks/useInventory';
import { motion } from 'framer-motion';
import { VariantManager } from './variants/VariantManager';
import { Button } from '../ui';
import { Tabs } from '../ui/Tabs';
import { useTranslation } from 'react-i18next';

interface MenuItemFormProps {
  item?: MenuItem | null;
  onSave: (data: MenuItemWithVariants) => void;
  onCancel: () => void;
}

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
  t: (key: string) => string;
}

interface InventoryConnectionsTabProps {
  register: UseFormReturn<FormInputs>['register'];
  watch: UseFormReturn<FormInputs>['watch'];
  setValue: UseFormReturn<FormInputs>['setValue'];
  inventory: Array<{
    id: string;
    name: string;
    [key: string]: any;
  }>;
  t: (key: string) => string;
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
}

const ProductTab: React.FC<ProductTabProps> = ({
  register,
  errors,
  watch,
  setValue,
  settings,
  categories,
  selectedCategory,
  handleCategoryChange,
  t,
}) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      <div>
        <label className="block text-sm font-medium mb-1">
          {t('common:name')}
        </label>
        <input
          type="text"
          {...register('name', { required: t('common:name-required') })}
          className="w-full rounded-lg border p-2.5 dark:bg-gray-700"
          placeholder={t('common:product-name')}
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
          value={selectedCategory}
          onChange={handleCategoryChange}
          className="w-full rounded-lg border p-2.5 dark:bg-gray-700"
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
        <div className="relative">
          <input
            type="number"
            step={settings?.currency === 'XOF' ? '1' : '0.01'}
            {...register('price', {
              required: t('common:price-required'),
              min: { value: 0, message: t('common:positive-price') },
            })}
            className="w-full rounded-lg border p-2.5 dark:bg-gray-700 pr-12"
            placeholder="0.00"
          />
          <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500 dark:text-gray-400">
            {settings?.currency}
          </div>
        </div>
        {errors.price && (
          <p className="mt-1 text-sm text-red-500">{errors.price.message}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">
          {t('common:stock')}
        </label>
        <input
          type="number"
          {...register('stockQuantity', {
            required: t('common:stock-required'),
            min: { value: 0, message: t('common:positive-stock') },
          })}
          className="w-full rounded-lg border p-2.5 dark:bg-gray-700"
          placeholder="0"
        />
        {errors.stockQuantity && (
          <p className="mt-1 text-sm text-red-500">
            {errors.stockQuantity.message}
          </p>
        )}
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium mb-1">
          {t('common:descritpion')}
        </label>
        <textarea
          {...register('description', {
            required: t('common:description-required'),
          })}
          rows={3}
          className="w-full rounded-lg border p-2.5 dark:bg-gray-700"
          placeholder={t('common:description-title')}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-500">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="md:col-span-2">
        <LogoUploader
          value={watch('image')}
          onChange={url => setValue('image', url, { shouldDirty: true })}
          label={t('common:product-image')}
          description={t('common:product-image-description')}
        />
      </div>
    </div>
  </div>
);

const InventoryConnectionsTab: React.FC<InventoryConnectionsTabProps> = ({
  register,
  watch,
  setValue,
  inventory,
  t,
}) => {
  const ProductSelect = ({ index }: { index: number }) => (
    <div
      key={index}
      className="grid grid-cols-[1fr,1fr,auto] gap-4 items-start"
    >
      <div className="flex flex-col">
        <label className="block text-sm font-medium mb-2">
          {t('common:inventory-product')}
        </label>
        <select
          {...register(`inventoryConnections.${index}.itemId`)}
          className="w-full rounded-lg border p-2.5 dark:bg-gray-700"
        >
          <option value="">{t("common:choose-product")}</option>
          {inventory.map(item => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col">
        <div className="mb-2">
          <label className="block text-sm font-medium">
            Ratio (1:{watch(`inventoryConnections.${index}.ratio`) || '0'})
          </label>
        </div>
        <input
          type="number"
          step="0.1"
          min="0.1"
          {...register(`inventoryConnections.${index}.ratio`, {
            required: 'Le ratio est requis',
            min: { value: 0.1, message: 'Le ratio doit être supérieur à 0' },
          })}
          className="w-full rounded-lg border p-2.5 dark:bg-gray-700"
          placeholder="Ex: 3 pour 1:3"
        />
        <span className="text-xs mt-1 text-gray-500 dark:text-gray-400">
          {t('menu:ratio-condition')}
        </span>
      </div>

      <Button
        type="button"
        variant="ghost"
        onClick={() => {
          const connections = watch('inventoryConnections');
          setValue(
            'inventoryConnections',
            connections.filter((_: any, i: number) => i !== index),
            { shouldDirty: true }
          );
        }}
        className="self-center mb-0.5"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );

  return (
    <div className="space-y-4">
      {watch('inventoryConnections')?.map((_, index) => (
        <ProductSelect key={index} index={index} />
      ))}

      <Button
        type="button"
        variant="secondary"
        onClick={() => {
          const connections = watch('inventoryConnections') || [];
          setValue(
            'inventoryConnections',
            [...connections, { itemId: '', ratio: 1 }],
            { shouldDirty: true }
          );
        }}
      >
        <Plus className="w-4 h-4 mr-2" />
        {t('menu:add-connexion')}
      </Button>
    </div>
  );
};

const VariantsTab: React.FC<VariantsTabProps> = ({
  selectedCategory,
  variants,
  variantPrices,
  setVariantPrices,
}) => (
  <div>
    {selectedCategory && variants.length > 0 ? (
      <VariantManager
        variants={variants}
        value={variantPrices}
        onChange={setVariantPrices}
      />
    ) : (
      <div className="text-center py-8 text-gray-500">
        Sélectionnez une catégorie pour gérer les variantes
      </div>
    )}
  </div>
);

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

  const tabs = [
    { id: 'product', label: t('common:product') },
    { id: 'variants', label: t('menu:variant-combination') },
    { id: 'inventory', label: t('menu:inventory-connexion') },
  ];

  const methods = useForm({
    defaultValues: {
      name: item?.name || '',
      description: item?.description || '',
      price: item?.price || 0,
      image: item?.image || '',
      categoryId: item?.categoryId || '',
      stockQuantity: item?.stockQuantity || 0,
      inventoryConnections: item?.inventoryConnections || [],
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = methods;

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedCategory(value);
    setValue('categoryId', value, { shouldDirty: true });
    if (value !== item?.categoryId) {
      setVariantPrices([]);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'product':
        return (
          <ProductTab
            register={register}
            errors={errors}
            watch={watch}
            setValue={setValue}
            settings={settings!}
            categories={categories}
            selectedCategory={selectedCategory}
            handleCategoryChange={handleCategoryChange}
            t={t}
          />
        );
      case 'inventory':
        return (
          <InventoryConnectionsTab
            register={register}
            watch={watch}
            setValue={setValue}
            inventory={inventory}
            t={t}
          />
        );
      case 'variants':
        return (
          <VariantsTab
            selectedCategory={selectedCategory}
            variants={variants}
            variantPrices={variantPrices}
            setVariantPrices={setVariantPrices}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-[90vw] max-w-4xl h-[80vh] flex flex-col"
      >
        <div className="flex justify-between items-center p-4 md:p-6 border-b dark:border-gray-700/80">
          <h2 className="text-lg md:text-xl font-semibold">
            {item ? t('menu:update-product') : t('menu:create-product')}
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
            onSubmit={handleSubmit(onSave)}
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
                  disabled={!isDirty}
                  className={`
                    px-6 py-2 rounded-lg font-medium text-white
                    transition-all duration-200
                    ${
                      isDirty
                        ? 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl'
                        : 'bg-gray-400 cursor-not-allowed'
                    }
                  `}
                >
                  {item ? t('menu:update') : t('common:add')}
                </Button>
              </div>
            </div>
          </form>
        </FormProvider>
      </motion.div>
    </div>
  );
}
