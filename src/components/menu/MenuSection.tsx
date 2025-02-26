import { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMenu } from '../../hooks/useMenu';
import { MenuItem } from './MenuItem';
import { MenuFilters } from './MenuFilters';
import { SearchBar } from './SearchBar';
import { useTranslation } from 'react-i18next';
import { RefreshCw } from 'lucide-react';

const INITIAL_ITEMS_COUNT = 9;
const LOAD_MORE_COUNT = 9;

export function MenuSection() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { items: menuItems, isLoading } = useMenu();
  const [visibleItemsCount, setVisibleItemsCount] =
    useState(INITIAL_ITEMS_COUNT);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const { t } = useTranslation('menu');

  // Reset visible items count when category or search changes
  useEffect(() => {
    setVisibleItemsCount(INITIAL_ITEMS_COUNT);
  }, [activeCategory, searchTerm]);

  const items = useMemo(() => {
    return menuItems.map(item => ({
      ...item,
      variantPrices: [...(item.variantPrices || [])],
    }));
  }, [menuItems]);

  const filteredItems = items.filter(item => {
    const matchesCategory =
      activeCategory === 'all' || item.categoryId === activeCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description?.toLowerCase() || '').includes(
        searchTerm.toLowerCase()
      );
    return matchesCategory && matchesSearch;
  });

  // Get only the visible items based on current count
  const visibleItems = filteredItems.slice(0, visibleItemsCount);

  // Check if there are more items to load
  const hasMoreItems = visibleItemsCount < filteredItems.length;

  const handleLoadMore = () => {
    setIsLoadingMore(true);

    // Simulate loading delay for better UX
    setTimeout(() => {
      setVisibleItemsCount(prevCount => prevCount + LOAD_MORE_COUNT);
      setIsLoadingMore(false);
    }, 500);
  };

  return (
    <div className="space-y-8">
      <SearchBar onSearch={setSearchTerm} />

      <MenuFilters
        activeCategory={activeCategory}
        onCategoryChange={category => {
          setActiveCategory(category);
        }}
      />

      <div className="relative min-h-[50vh]">
        <div className="absolute inset-0 bg-gray-50 dark:bg-gray-900" />

        {isLoading ? (
          <div className="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="aspect-[4/3] animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800"
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial={false}
            className="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence mode="popLayout">
              {visibleItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    transition: {
                      duration: 0.3,
                      delay: index * 0.05,
                    },
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.9,
                    transition: { duration: 0.2 },
                  }}
                  className="relative"
                >
                  <MenuItem item={item} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {!isLoading && filteredItems.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative flex h-[50vh] items-center justify-center"
          >
            <p className="text-lg text-gray-500 dark:text-gray-400">
              {t('no-items-founds')}
            </p>
          </motion.div>
        )}
      </div>

      {/* Load More Button */}
      {!isLoading && hasMoreItems && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mt-12"
        >
          <button
            disabled={isLoadingMore}
            onClick={handleLoadMore}
            className="flex items-center gap-2 px-6 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-800/30
                      text-blue-600 dark:text-blue-400 rounded-lg transition-colors font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            {t('common:load-more')}
          </button>
        </motion.div>
      )}
    </div>
  );
}
