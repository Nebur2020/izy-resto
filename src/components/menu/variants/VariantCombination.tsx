import React from 'react';
import { X } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Variant } from '../../../types/variant';
import { LogoUploader } from '../../settings/LogoUploader';
import { useSettings } from '../../../hooks/useSettings';
import { useTranslation } from 'react-i18next';

interface IVariantCombinationProps {
  variants: Variant[];
  combination: string[];
  price: number;
  image?: string;
  onCombinationChange: (combination: string[]) => void;
  onPriceChange: (price: number) => void;
  onImageChange: (url: string) => void;
  onRemove: (e?: React.MouseEvent) => void;
}

export function VariantCombination(props: IVariantCombinationProps) {
  const { t } = useTranslation();
  const {
    variants,
    combination,
    price,
    image,
    onCombinationChange,
    onPriceChange,
    onImageChange,
    onRemove,
  } = props;
  const { settings } = useSettings();

  const handleImageChange = (url: string) => {
    onImageChange(url);
  };

  // Improved function to get variant value - more reliable string matching
  const getVariantValue = (variant: Variant, combination: string[]) => {
    const currCombination = combination
      .filter(Boolean)
      .find(comb => comb.startsWith(`${variant.name}:`));
    if (!currCombination) return '';
    return currCombination.split(': ')[1] || '';
  };

  // Find the existing index of a variant's combination in the array
  const findVariantIndex = (variantName: string, combinations: string[]) => {
    return combinations.findIndex(
      comb => comb && comb.startsWith(`${variantName}:`)
    );
  };

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg space-y-4">
      <div className="flex justify-between items-start">
        <div className="flex-1 space-y-4">
          <div className="grid gap-4">
            {variants.map((variant, idx) => (
              <div
                key={`${variant.id}-${idx}`}
                className="grid grid-cols-2 gap-4"
              >
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {variant.name}
                  </label>
                  <select
                    className="w-full rounded-lg border dark:border-gray-600 p-2 dark:bg-gray-700"
                    value={getVariantValue(variant, combination)}
                    onChange={e => {
                      const newCombination = [...combination];

                      // Find if this variant already exists in the combination
                      const existingIndex = findVariantIndex(
                        variant.name,
                        newCombination
                      );

                      // If the value is null or empty, remove it from the combination
                      if (e.target.value === 'null' || e.target.value === '') {
                        if (existingIndex !== -1) {
                          newCombination.splice(existingIndex, 1);
                        }
                      } else {
                        // Either update at existing index or add new entry
                        const newEntry = `${variant.name}: ${e.target.value}`;
                        if (existingIndex !== -1) {
                          newCombination[existingIndex] = newEntry;
                        } else {
                          newCombination.push(newEntry);
                        }
                      }
                      onCombinationChange(newCombination);
                    }}
                  >
                    <option value="">
                      {t('variant:select-variant-value')}
                    </option>
                    {variant.values.map(value => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {t('common:price')}
            </label>
            <input
              type="number"
              step={settings?.currency === 'XOF' ? '1' : '0.01'}
              className="w-full rounded-lg border dark:border-gray-600 p-2 dark:bg-gray-700"
              value={price}
              onChange={e => onPriceChange(parseFloat(e.target.value))}
            />
          </div>

          <div onClick={e => e.stopPropagation()}>
            <LogoUploader
              value={image || ''}
              onChange={handleImageChange}
              label={t('variant:variant-image')}
              description={t('variant:variant-image-description')}
            />
          </div>
        </div>

        <Button
          type="button"
          variant="danger"
          size="sm"
          onClick={e => onRemove(e)}
          className="ml-4"
        >
          <X className="w-4 h-4 text-white" />
        </Button>
      </div>
    </div>
  );
}
