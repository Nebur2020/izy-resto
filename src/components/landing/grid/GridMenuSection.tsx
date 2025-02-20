import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useMenu } from '../../../hooks/useMenu';
import { GridMenuItem } from './GridMenuItem';
import { GridMenuCategories } from './GridMenuCategories';
import { SearchBar } from '../../menu/SearchBar';
import { useTranslation } from 'react-i18next';
import { RefreshCw } from 'lucide-react';

export function GridMenuSection() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleItems, setVisibleItems] = useState(9);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const { t } = useTranslation('menu');

  const ITEMS_PER_PAGE = 12;

  const { items } = useMenu(
    activeCategory !== 'all' ? activeCategory : undefined
  );

  const filteredItems = items.filter(item => {
    const matchesCategory =
      activeCategory === 'all' || item.categoryId === activeCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Get currently visible items
  const currentItems = filteredItems.slice(0, visibleItems);

  // Check if there are more items to load
  const hasMore = visibleItems < filteredItems.length;

  const handleLoadMore = () => {
    setIsLoadingMore(true);

    // Simulate loading delay for better UX
    setTimeout(() => {
      setVisibleItems(prev => prev + ITEMS_PER_PAGE);
      setIsLoadingMore(false);
    }, 600);
  };

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setVisibleItems(ITEMS_PER_PAGE);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setVisibleItems(ITEMS_PER_PAGE);
  };

  return (
    <div className="space-y-12">
      <SearchBar onSearch={handleSearch} />

      <GridMenuCategories
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />

      <motion.div
        layout
        className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6"
      >
        <AnimatePresence mode="popLayout">
          {currentItems.map((item, index) => (
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
              <GridMenuItem item={item} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            {t('no-items-founds')}
          </p>
        </div>
      ) : (
        hasMore && (
          <motion.div
            className="flex justify-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <button
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="flex items-center gap-2 px-6 py-3 bg-blue-50 hover:bg-blue-100 
                        dark:bg-blue-900/20 dark:hover:bg-blue-800/30
                        text-blue-600 dark:text-blue-400 rounded-lg 
                        transition-all font-medium disabled:opacity-50
                        hover:shadow-md"
            >
              {isLoadingMore ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  {t('loading')}
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  {t('common:load-more')}
                </>
              )}
            </button>
          </motion.div>
        )
      )}
    </div>
  );
}
