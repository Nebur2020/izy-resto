import React from 'react';
import { X } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Variant } from '../../../types/variant';
import { LogoUploader } from '../../settings/LogoUploader';
import { useSettings } from '../../../hooks/useSettings';
import { useTranslation } from 'react-i18next';

interface VariantCombinationProps {
  variants: Variant[];
  combination: string[];
  price: number;
  image?: string;
  onCombinationChange: (combination: string[]) => void;
  onPriceChange: (price: number) => void;
  onImageChange: (url: string) => void;
  onRemove: (e?: React.MouseEvent) => void;
}

export function VariantCombination({
  variants,
  combination,
  price,
  image,
  onCombinationChange,
  onPriceChange,
  onImageChange,
  onRemove,
}: VariantCombinationProps) {
  const { settings } = useSettings();
  const { t } = useTranslation();

  const handleImageChange = (url: string) => {
    onImageChange(url);
  };

  const getVariantValue2 = (variant: Variant, combination: string[]) => {
    const currCombination = combination
      .filter(Boolean)
      .find(comb => comb.includes(variant.name));
    if (!currCombination) return '';
    return currCombination.split(': ')[1] || '';
  };

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg space-y-4">
      <div className="flex justify-between items-start">
        <div className="flex-1 space-y-4">
          <div className="grid gap-4">
            {variants.map((variant, idx) => (
              <div key={variant.id} className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {variant.name}
                  </label>
                  <select
                    className="w-full rounded-lg border dark:border-gray-600 p-2 dark:bg-gray-700"
                    value={getVariantValue2(variant, combination)}
                    onChange={e => {
                      const newCombination = [...combination];
                      newCombination[
                        idx
                      ] = `${variant.name}: ${e.target.value}`;
                      onCombinationChange(newCombination);
                    }}
                  >
                    <option value="null">{t("common:choose-value")}</option>
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
            <label className="block text-sm font-medium mb-1">{t("common:price")}</label>
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
              label={t('common:variant-image')}
              description={t('common:specific-image')}
            />
          </div>
        </div>

        <Button
          type="button" // Add type="button"
          variant="danger"
          size="sm"
          onClick={e => onRemove(e)}
          className="ml-4"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
