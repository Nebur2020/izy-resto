import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { MenuItem, MenuItemWithVariants } from '../../../types';
import { useSettings } from '../../../hooks/useSettings';
import { ProductDetailsModal } from '../ProductDetailsModal';
import { formatCurrency } from '../../../utils/currency';
import { useIsMobile } from '../../../hooks/useIsMobile';
import { useTranslation } from 'react-i18next';

interface MinimalMenuItemProps {
  item: MenuItem;
  palette?: {
    primary: string;
    secondary: string;
  };
  isDarkMode?: boolean;
}

export function MinimalMenuItem({
  item,
  palette = {
    primary: '#2563EB',
    secondary: '#4D48E5',
  },
  isDarkMode = false,
}: MinimalMenuItemProps) {
  const { settings } = useSettings();
  const [showModal, setShowModal] = useState(false);
  const itemWithVariants = item as MenuItemWithVariants;
  const hasVariants = itemWithVariants.variantPrices?.length > 0;

  const isMobile = useIsMobile();

  const priceRange = useMemo(() => {
    if (!itemWithVariants.variantPrices?.length) {
      return { min: item.price, max: item.price };
    }

    const prices = [
      item.price,
      ...itemWithVariants.variantPrices.map(vp => vp.price),
    ];

    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }, [item, itemWithVariants.variantPrices]);

  const { t } = useTranslation('menu');

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex items-center gap-6 p-4 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => setShowModal(true)}
      >
        <img
          src={item.image}
          alt={item.name}
          className="w-24 h-24 object-cover rounded-lg"
        />
        <div className="flex-1">
          <h3 className="text-lg font-medium mb-1">{t(item.name)}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
            {t(item.description)}
          </p>
          <div className="flex items-center justify-between">
            <span className="font-bold" style={{ color: palette.primary }}>
              {isMobile && formatCurrency(item.price, settings?.currency)}
              {!isMobile &&
                (hasVariants ? (
                  <>
                    {formatCurrency(priceRange.min, settings?.currency)}
                    {priceRange.max > priceRange.min && (
                      <>
                        {' '}
                        - {formatCurrency(priceRange.max, settings?.currency)}
                      </>
                    )}
                  </>
                ) : (
                  formatCurrency(item.price, settings?.currency)
                ))}
            </span>
            {item.variants && item.variants.length > 0 && (
              <div className="flex gap-2">
                {item.variants.slice(0, 2).map((variant, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs font-medium text-gray-600 dark:text-gray-300"
                  >
                    {t(variant.value)}
                  </span>
                ))}
                {item.variants.length > 2 && (
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs font-medium text-gray-600 dark:text-gray-300">
                    +{item.variants.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {showModal && (
        <ProductDetailsModal
          item={item}
          onClose={() => setShowModal(false)}
          primaryColor={palette.primary}
          isDarkMode={isDarkMode}
        />
      )}
    </>
  );
}
