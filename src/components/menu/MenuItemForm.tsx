import React, { useState, useEffect } from 'react';
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

const tabs = [
  { id: 'product', label: 'Produit' },
  { id: 'variants', label: 'Combinaisons de variantes' },
  { id: 'inventory', label: "Connexions à l'inventaire" },
];

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

interface InventoryConnectionsTabProps {
  register: UseFormReturn<FormInputs>['register'];
  watch: UseFormReturn<FormInputs>['watch'];
  setValue: UseFormReturn<FormInputs>['setValue'];
  inventory: Array<{
    id: string;
    name: string;
    [key: string]: any;
  }>;
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

const ProductTab: React.FC<ProductTabProps> = ({
  register,
  errors,
  watch,
  setValue,
  settings,
  categories,
  selectedCategory,
  handleCategoryChange,
}) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      <div>
        <label className="block text-sm font-medium mb-1">Nom</label>
        <input
          type="text"
          {...register('name', { required: 'Le nom est requis' })}
          className="w-full rounded-lg border p-2.5 dark:bg-gray-700"
          placeholder="Nom du produit"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Catégorie</label>
        <select
          {...register('categoryId', { required: 'La catégorie est requise' })}
          value={selectedCategory}
          onChange={handleCategoryChange}
          className="w-full rounded-lg border p-2.5 dark:bg-gray-700"
        >
          <option value="">Sélectionner une catégorie</option>
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
        <label className="block text-sm font-medium mb-1">Prix</label>
        <div className="relative">
          <input
            type="number"
            step={settings?.currency === 'XOF' ? '1' : '0.01'}
            {...register('price', {
              required: 'Le prix est requis',
              min: { value: 0, message: 'Le prix doit être positif' },
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
        <label className="block text-sm font-medium mb-1">Stock</label>
        <input
          type="number"
          {...register('stockQuantity', {
            required: 'Le stock est requis',
            min: { value: 0, message: 'Le stock doit être positif' },
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
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          {...register('description', {
            required: 'La description est requise',
          })}
          rows={3}
          className="w-full rounded-lg border p-2.5 dark:bg-gray-700"
          placeholder="Description du produit"
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
          label="Image du produit"
          description="Format recommandé: JPG ou PNG en haute résolution (1920x1080px minimum)"
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
}) => {
  const ProductSelect = ({ index }: { index: number }) => (
    <div
      key={index}
      className="grid grid-cols-[1fr,1fr,auto] gap-4 items-start"
    >
      <div className="flex flex-col">
        <label className="block text-sm font-medium mb-2">
          Produit d'inventaire
        </label>
        <select
          {...register(`inventoryConnections.${index}.itemId`)}
          className="w-full rounded-lg border p-2.5 dark:bg-gray-700"
        >
          <option value="">Sélectionner un produit</option>
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
          Le ratio est une règle de proportion simple entre le produit
          d'inventaire et le produit du menu
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
        Ajouter une connexion
      </Button>
    </div>
  );
};

const VariantsTab: React.FC<VariantsTabProps> = ({
  selectedCategory,
  variants,
  variantPrices,
  setVariantPrices,
  onVariantChange,
}) => (
  <div>
    {selectedCategory && variants.length > 0 ? (
      <VariantManager
        variants={variants}
        value={variantPrices}
        onChange={newPrices => {
          setVariantPrices(newPrices);
          onVariantChange();
        }}
      />
    ) : (
      <div className="text-center py-8 text-gray-500">
        Sélectionnez une catégorie pour gérer les variantes
      </div>
    )}
  </div>
);

export function MenuItemForm({ item, onSave, onCancel }: MenuItemFormProps) {
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

  console.log(item);

  // Track if variant prices have changed
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
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = methods;

  // Track the initial variant prices for comparison
  const [initialVariantPrices] = useState(
    JSON.stringify((item as MenuItemWithVariants)?.variantPrices || [])
  );

  // Check if variant prices have changed whenever they're updated
  useEffect(() => {
    const currentVariantPrices = JSON.stringify(variantPrices);
    setIsVariantPricesDirty(currentVariantPrices !== initialVariantPrices);
  }, [variantPrices, initialVariantPrices]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedCategory(value);
    setValue('categoryId', value, { shouldDirty: true });
    if (value !== item?.categoryId) {
      setVariantPrices([]);
      setIsVariantPricesDirty(true);
    }
  };

  const onSubmitHandler = (data: FormInputs) => {
    const finalData = {
      ...data,
      variantPrices,
    };
    onSave(finalData as MenuItemWithVariants);
  };

  const handleVariantChange = () => {
    setIsVariantPricesDirty(true);
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
          />
        );
      case 'inventory':
        return (
          <InventoryConnectionsTab
            register={register}
            watch={watch}
            setValue={setValue}
            inventory={inventory}
          />
        );
      case 'variants':
        return (
          <VariantsTab
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
            {item ? 'Modifier le produit' : 'Nouveau produit'}
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
            onSubmit={handleSubmit(onSubmitHandler)}
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
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={!isDirty && !isVariantPricesDirty}
                  className={`
                    px-6 py-2 rounded-lg font-medium text-white
                    transition-all duration-200
                    ${
                      isDirty || isVariantPricesDirty
                        ? 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl'
                        : 'bg-gray-400 cursor-not-allowed'
                    }
                  `}
                >
                  {item ? 'Mettre à jour' : 'Ajouter'}
                </Button>
              </div>
            </div>
          </form>
        </FormProvider>
      </motion.div>
    </div>
  );
}
