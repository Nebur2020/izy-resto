import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMenu } from '../../../hooks/useMenu';
import { MinimalMenuItem } from './MinimalMenuItem';
import { MinimalMenuCategories } from './MinimalMenuCategories';
import { SearchBar } from '../SearchBar';
import { useTranslation } from 'react-i18next';
import { RefreshCw } from 'lucide-react';

const INITIAL_ITEMS_COUNT = 8;
const LOAD_MORE_COUNT = 8;

export function MinimalMenuSection() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleItemsCount, setVisibleItemsCount] =
    useState(INITIAL_ITEMS_COUNT);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const { items } = useMenu(
    activeCategory !== 'all' ? activeCategory : undefined
  );

  const { t } = useTranslation('menu');

  useEffect(() => {
    setVisibleItemsCount(INITIAL_ITEMS_COUNT);
  }, [activeCategory, searchTerm]);

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

  const visibleItems = filteredItems.slice(0, visibleItemsCount);

  const hasMoreItems = visibleItemsCount < filteredItems.length;

  const handleLoadMore = () => {
    setIsLoadingMore(true);

    setTimeout(() => {
      setVisibleItemsCount(prevCount => prevCount + LOAD_MORE_COUNT);
      setIsLoadingMore(false);
    }, 500);
  };

  return (
    <div className="space-y-12">
      <SearchBar onSearch={setSearchTerm} />

      <MinimalMenuCategories
        activeCategory={activeCategory}
        onCategoryChange={category => {
          setActiveCategory(category);
        }}
      />

      <motion.div layout className="grid grid-cols-1 gap-8 max-w-3xl mx-auto">
        {visibleItems.map(item => (
          <MinimalMenuItem key={item.id} item={item} />
        ))}
      </motion.div>

      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            {t('no-items-founds')}
          </p>
        </div>
      ) : (
        hasMoreItems && (
          <div className="flex justify-center mt-12">
            <div className="flex justify-center mt-6">
              <button
                disabled={isLoadingMore}
                onClick={handleLoadMore}
                className="flex items-center gap-2 px-6 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-800/30
                      text-blue-600 dark:text-blue-400 rounded-lg transition-colors font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                {t('common:load-more')}
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );
}
