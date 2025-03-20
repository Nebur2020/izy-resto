import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { MenuItem, MenuItemWithVariants } from '../../../types';
import { useSettings } from '../../../hooks/useSettings';
import { formatCurrency } from '../../../utils/currency';
import { ProductDetailsModal } from '../../../components/menu/ProductDetailsModal';
import { useIsMobile } from '../../../hooks/useIsMobile';
import { useTranslation } from 'react-i18next';

interface GridMenuItemProps {
  item: MenuItem;
  palette?: {
    primary: string;
    secondary: string;
  };
  isDarkMode: boolean;
}

export function GridMenuItem({
  item,
  palette = {
    primary: '#2563EB',
    secondary: '#4D48E5',
  },
}: GridMenuItemProps) {
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
        onClick={() => setShowModal(true)}
        className="group relative aspect-square bg-gray-900 rounded-2xl overflow-hidden cursor-pointer"
      >
        <img
          src={item.image}
          alt={t(item.name)}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute inset-x-0 bottom-0 p-6">
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-white">{item.name}</h3>
              <p className="text-sm text-gray-300 line-clamp-2">
                {t(item.description)}
              </p>

              <div className="flex items-center justify-between pt-2">
                <span className="text-lg font-bold text-white">
                  {isMobile && formatCurrency(item.price, settings?.currency)}

                  {!isMobile &&
                    (hasVariants ? (
                      <>
                        {formatCurrency(priceRange.min, settings?.currency)}
                        {priceRange.max > priceRange.min && (
                          <>
                            {' '}
                            -{' '}
                            {formatCurrency(priceRange.max, settings?.currency)}
                          </>
                        )}
                      </>
                    ) : (
                      formatCurrency(item.price, settings?.currency)
                    ))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {showModal && (
        <ProductDetailsModal
          primaryColor={palette.primary}
          item={item}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
