import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMenu } from '../../hooks/useMenu';
import { MenuItem } from './MenuItem';
import { MenuFilters } from './MenuFilters';
import { SearchBar } from './SearchBar';
import { Pagination } from '../ui/Pagination';
import { useTranslation } from 'react-i18next';

const ITEMS_PER_PAGE = 9;

export function MenuSection() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { items: menuItems, isLoading } = useMenu();

  const items = useMemo(() => {
    return menuItems.map(item => ({
      ...item,
      variantPrices: [
        ...(item.variantPrices || []),
        ...(item?.defaultVariantPrices || []),
      ],
    }));
  }, [menuItems]);

  console.log('items', items);

  const filteredItems = items.filter(item => {
    const matchesCategory =
      activeCategory === 'all' || item.categoryId === activeCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const { t } = useTranslation('menu');

  return (
    <div className="space-y-8">
      <SearchBar onSearch={setSearchTerm} />

      <MenuFilters
        activeCategory={activeCategory}
        onCategoryChange={category => {
          setActiveCategory(category);
          setCurrentPage(1);
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
              {paginatedItems.map((item, index) => (
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

      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mt-12"
        >
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </motion.div>
      )}
    </div>
  );
}
