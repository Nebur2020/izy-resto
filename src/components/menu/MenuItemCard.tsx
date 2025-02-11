import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Edit2, Trash2, Package, Plus } from 'lucide-react';
import { MenuItem, MenuItemWithVariants } from '../../types';
import { Button } from '../ui/Button';
import { formatCurrency, Currency } from '../../utils/currency';
import { useTranslation } from 'react-i18next';

interface MenuItemCardProps {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: string) => void;
  currency?: Currency;
}

const MenuItemCard = forwardRef<HTMLDivElement, MenuItemCardProps>(
  ({ item, onEdit, onDelete, currency }, ref) => {
    const isOutOfStock = item.stockQuantity === 0;
    const itemWithVariants = item as MenuItemWithVariants;
    const { t } = useTranslation();

    const priceRange = React.useMemo(() => {
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

    const hasVariants = itemWithVariants.variantPrices?.length > 0;

    return (
      <motion.div
        ref={ref}
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="group relative flex flex-col overflow-hidden rounded-xl bg-white shadow-md transition-all duration-300 hover:translate-y-[-4px] hover:shadow-xl dark:bg-gray-800"
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={item.image}
            alt={item.name}
            className="h-full w-full object-cover transition-transform duration-500 will-change-transform group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          {isOutOfStock ? (
            <div className="absolute left-4 top-4 rounded-full bg-red-500/90 px-3 py-1.5 text-sm font-medium text-white shadow-lg">
              Rupture de stock
            </div>
          ) : (
            item.stockQuantity <= 5 && (
              <div className="absolute left-4 top-4 rounded-full bg-amber-500/90 px-3 py-1.5 text-sm font-medium text-white shadow-lg">
                Stock faible: {item.stockQuantity}
              </div>
            )
          )}
          <div className="absolute right-4 top-4 rounded-full bg-white/95 px-4 py-2 text-sm font-bold text-gray-900 shadow-lg backdrop-blur-sm dark:bg-gray-900/95 dark:text-white">
            {hasVariants ? (
              <>
                {formatCurrency(priceRange.min, currency)}
                {priceRange.max > priceRange.min && (
                  <> - {formatCurrency(priceRange.max, currency)}</>
                )}
              </>
            ) : (
              formatCurrency(item.price, currency)
            )}
          </div>
        </div>
        <div className="flex flex-1 flex-col p-5">
          <div className="mb-4 flex-1">
            <h3 className="mb-2 text-lg font-semibold text-gray-900 transition-colors dark:text-white">
              {item.name}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2 dark:text-gray-300">
              {item.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex flex-1 flex-wrap items-center gap-3">
              <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                {item.category}
              </span>
              <span className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                <Package className="h-4 w-4" />
                {item.stockQuantity} {t('menu:product-in-stock')}
              </span>
            </div>
            {hasVariants && (
              <div className="flex flex-wrap gap-1">
                {itemWithVariants.variantPrices
                  .slice(0, 2)
                  .filter(vp => vp?.variantCombination?.length > 0)
                  .map((vp, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs
                             bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                    >
                      {vp.variantCombination[0].split(': ')[1]}
                    </span>
                  ))}
                {itemWithVariants.variantPrices.length > 2 && (
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs
                                 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    {itemWithVariants.variantPrices.length - 2}
                  </span>
                )}
              </div>
            )}
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(item)}
                className="h-9 w-9 rounded-full p-0 text-gray-500 hover:bg-blue-50 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-blue-900/50 dark:hover:text-blue-400"
              >
                <Edit2 className="h-4 w-4" />
                <span className="sr-only">Modifier</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(item.id)}
                className="h-9 w-9 rounded-full p-0 text-gray-500 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/50 dark:hover:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Supprimer</span>
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }
);

MenuItemCard.displayName = 'MenuItemCard';

export { MenuItemCard };
