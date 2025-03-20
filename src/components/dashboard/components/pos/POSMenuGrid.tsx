import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { MenuItem } from '../../../../types';
import { Button } from '../../../ui/Button';
import { useSettings } from '../../../../hooks/useSettings';
import { formatCurrency } from '../../../../utils/currency';
import { ProductDetailsModal } from '../../../menu/ProductDetailsModal';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../../context/ThemeContext';

interface POSMenuGridProps {
  items: MenuItem[];
  onAddToCart: (item: MenuItem & { quantity: number }) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onToggleCart: () => void;
  isItemOrderFromOrder?: boolean;
}

export function POSMenuGrid(props: POSMenuGridProps) {
  const { t } = useTranslation('common');
  const {
    items,
    onAddToCart,
    searchTerm,
    onSearchChange,
    onToggleCart,
    isItemOrderFromOrder,
  } = props;
  const { settings } = useSettings();
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const { theme } = useTheme();

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {!isItemOrderFromOrder && (
        <div className="p-4 flex items-center gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder={t('search-items')}
              value={searchTerm}
              onChange={e => onSearchChange(e.target.value)}
              className="w-full pl-4 pr-4 py-2 rounded-lg border dark:border-gray-700"
            />
          </div>
          <Button
            variant="secondary"
            className="lg:hidden"
            onClick={onToggleCart}
          >
            <ShoppingBag className="w-5 h-5" />
          </Button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {items.length > 0 ? (
              items.map(item => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => setSelectedItem(item)}
                  className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="aspect-video mb-3 rounded-lg overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-medium mb-1">{item.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">
                    {item.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(item.price, settings?.currency)}
                    </span>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full flex items-center justify-center py-12 text-gray-500 dark:text-gray-400"
              >
                <p className="text-lg">{t('common:no-items-found')}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Product Details Modal */}
      {selectedItem && (
        <ProductDetailsModal
          primaryColor={settings?.palette.primary}
          isDarkMode={theme === 'dark'}
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onAddToCart={onAddToCart}
        />
      )}
    </div>
  );
}
