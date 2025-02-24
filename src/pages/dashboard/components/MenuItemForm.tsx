import React from 'react';
import { Plus, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Button } from '../../../components/ui/Button';
import { MenuItem, MenuItemWithVariants } from '../../../types';
import { useCategories } from '../../../hooks/useCategories';
import { useVariants } from '../../../hooks/useVariants';
import { useSettings } from '../../../hooks/useSettings';
import { LogoUploader } from '../../../components/settings/LogoUploader';
import { useInventory } from '../../../hooks/useInventory';

interface MenuItemFormProps {
  item?: MenuItem | null;
  onSave: (data: MenuItemWithVariants) => void;
  onCancel: () => void;
}

export function MenuItemForm({ item, onSave, onCancel }: MenuItemFormProps) {
  const { categories } = useCategories();
  const { settings } = useSettings();
  const { items: inventory } = useInventory();

  const [selectedCategory, setSelectedCategory] = React.useState(
    item?.categoryId || ''
  );

  const { variants } = useVariants(selectedCategory);
  const [variantPrices, setVariantPrices] = React.useState(
    (item as MenuItemWithVariants)?.variantPrices || []
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
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

  // Helper function to get price modifier for a specific variant value
  const getVariantPriceModifier = (
    variantName: string,
    value: string
  ): number => {
    const variant = variants.find(v => v.name === variantName);
    if (!variant) return 0;

    const variantValue = variant.values.find(v => v === value);
    const priceModifier =
      variant.prices?.[variant.values.indexOf(variantValue)] || 0;
    return priceModifier;
  };

  // Calculate total price modifier for a combination
  const calculatePriceModifiers = (combination: string[]): number => {
    return combination.reduce((total, variantStr) => {
      const [variantName, value] = variantStr.split(': ');
      return total + getVariantPriceModifier(variantName, value);
    }, 0);
  };

  const getVariantCombinations = () => {
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
  };

  const handleFormSubmit = (formData: any) => {
    const allCombinations = getVariantCombinations();
    const basePrice = Number(formData.price);

    // Create defaultVariantPrices for combinations not in variantPrices
    const defaultVariantPrices = allCombinations
      .filter(
        combination =>
          !variantPrices.some(
            vp =>
              JSON.stringify(vp.variantCombination) ===
              JSON.stringify(combination)
          )
      )
      .map(combination => {
        // Calculate total price modifiers for this combination
        const priceModifier = calculatePriceModifiers(combination);

        return {
          variantCombination: combination,
          price: basePrice + priceModifier, // Add the modifier to base price
          image: formData.image, // Use the main product image as default
        };
      });

    console.log(defaultVariantPrices);

    const menuItem: MenuItemWithVariants = {
      ...formData,
      price: Number(formData.price),
      stockQuantity: Number(formData.stockQuantity),
      variantPrices: variantPrices.map(vp => ({
        ...vp,
        price: Number(vp.price),
      })),
      defaultVariantPrices,
      inventoryConnections: formData.inventoryConnections
        .filter((conn: any) => conn.itemId && conn.ratio)
        .map((conn: any) => ({
          ...conn,
          ratio: Number(conn.ratio),
        })),
    };
    onSave(menuItem);
  };

  const handleVariantChange = (
    combination: string[],
    field: 'price' | 'image',
    value: string | number
  ) => {
    setVariantPrices(prev => {
      const existing = prev.findIndex(
        p =>
          JSON.stringify(p.variantCombination) === JSON.stringify(combination)
      );

      if (existing >= 0) {
        return prev.map((p, i) =>
          i === existing ? { ...p, [field]: value } : p
        );
      }

      // For new variants, calculate the default price including modifiers
      const basePrice = watch('price');
      const priceModifier = calculatePriceModifiers(combination);

      return [
        ...prev,
        {
          variantCombination: combination,
          price:
            field === 'price' ? (value as number) : basePrice + priceModifier,
          image: field === 'image' ? (value as string) : undefined,
        },
      ];
    });
  };

  // Also update the UI to show the calculated price with modifiers
  const getDefaultPriceForCombination = (combination: string[]): number => {
    const basePrice = watch('price');
    const priceModifier = calculatePriceModifiers(combination);
    return basePrice + priceModifier;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold">
            {item ? 'Modifier le produit' : 'Nouveau produit'}
          </h2>
          <button onClick={onCancel}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="p-6 space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Nom</label>
              <input
                type="text"
                {...register('name', { required: 'Le nom est requis' })}
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
                Catégorie
              </label>
              <select
                {...register('categoryId', {
                  required: 'La catégorie est requise',
                })}
                onChange={e => {
                  setSelectedCategory(e.target.value);
                  // Ensure the form value is updated
                  setValue('categoryId', e.target.value, { shouldDirty: true });
                }}
                // Add this line to ensure the correct category is selected
                value={selectedCategory}
                className="w-full rounded-lg border dark:border-gray-600 p-2 dark:bg-gray-700"
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
              <input
                type="number"
                step={settings?.currency === 'XOF' ? '1' : '0.01'}
                {...register('price', {
                  required: 'Le prix est requis',
                  min: { value: 0, message: 'Le prix doit être positif' },
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
              <label className="block text-sm font-medium mb-1">Stock</label>
              <input
                type="number"
                {...register('stockQuantity', {
                  required: 'Le stock est requis',
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
                Description
              </label>
              <textarea
                {...register('description', {
                  required: 'La description est requise',
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
                value={watch('image')}
                onChange={url => setValue('image', url, { shouldDirty: true })}
                label="Image du produit"
                description="Format recommandé: JPG ou PNG en haute résolution (1920x1080px minimum)"
              />
            </div>
          </div>

          <div className="border-t dark:border-gray-700 pt-6">
            <h3 className="text-lg font-medium mb-4">
              Connexions à l'inventaire
            </h3>
            <div className="space-y-4">
              {watch('inventoryConnections')?.map(
                (connection: any, index: number) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-1">
                        Produit d'inventaire
                      </label>
                      <select
                        {...register(`inventoryConnections.${index}.itemId`)}
                        className="w-full rounded-lg border dark:border-gray-600 p-2 dark:bg-gray-700"
                      >
                        <option value="">Sélectionner un produit</option>
                        {inventory.map(item => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-1">
                        Ratio (1:
                        {watch(`inventoryConnections.${index}.ratio`) || '0'})
                      </label>
                      <span className="text-sm">
                        Le ratio est une règle de proportion simple entre le
                        produit d'inventaire et le produit du menu
                      </span>
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
                      onClick={() => {
                        const connections = watch('inventoryConnections');
                        setValue(
                          'inventoryConnections',
                          connections.filter(
                            (_: any, i: number) => i !== index
                          ),
                          { shouldDirty: true }
                        );
                      }}
                      className="mt-6"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )
              )}

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
          </div>

          {/* Variants Section */}
          {selectedCategory && variants.length > 0 && (
            <div className="border-t dark:border-gray-700 pt-6">
              <h3 className="text-lg font-medium mb-4">Variantes</h3>
              <div className="space-y-6">
                {getVariantCombinations().map((combination, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg space-y-4"
                  >
                    <div className="flex flex-wrap gap-2">
                      {combination.map((value, vIndex) => (
                        <span
                          key={vIndex}
                          className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                        >
                          {value}
                        </span>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Prix
                        </label>
                        <input
                          type="number"
                          step={settings?.currency === 'XOF' ? '1' : '0.01'}
                          value={
                            variantPrices.find(
                              p =>
                                JSON.stringify(p.variantCombination) ===
                                JSON.stringify(combination)
                            )?.price ||
                            getDefaultPriceForCombination(combination)
                          }
                          onChange={e =>
                            handleVariantChange(
                              combination,
                              'price',
                              parseFloat(e.target.value)
                            )
                          }
                          className="w-full rounded-lg border dark:border-gray-600 p-2 dark:bg-gray-700"
                        />
                        <span className="text-sm text-gray-500">
                          Prix calculé avec les modificateurs
                        </span>
                      </div>

                      <div>
                        <LogoUploader
                          value={
                            variantPrices.find(
                              p =>
                                JSON.stringify(p.variantCombination) ===
                                JSON.stringify(combination)
                            )?.image
                          }
                          onChange={url =>
                            handleVariantChange(combination, 'image', url)
                          }
                          label="Image de la variante (Optionnel)"
                          description="Image spécifique pour cette variante"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-4">
            <Button type="button" variant="secondary" onClick={onCancel}>
              Annuler
            </Button>
            <Button type="submit">{item ? 'Mettre à jour' : 'Ajouter'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
