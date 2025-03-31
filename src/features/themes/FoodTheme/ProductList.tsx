import { SetStateAction, useEffect, useState } from 'react';
import { MinimalMenuCategories } from '../../../components/menu/minimal/MinimalMenuCategories';
import { useMenu } from '../../../hooks';
import ItemCard from './ItemCard';
import { useTranslation } from 'react-i18next';
import { SearchBar } from '../../../components/menu/SearchBar';
import { useSettings } from '../../../hooks';
import { motion, AnimatePresence } from 'framer-motion';
import LoadMoreButton from '../../../components/ui/LoadMoreButton';


interface ProductListProps {
  tagline?: string;
  title?: string;
  primaryColor?: string;
  secondaryColor?: string;
  isDarkMode?: boolean;
}

const INITIAL_ITEMS_COUNT = 8;

export default function ProductList({
  primaryColor,
  isDarkMode,
}: ProductListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleItemsCount, setVisibleItemsCount] =
    useState(INITIAL_ITEMS_COUNT);
  const { settings } = useSettings();
  const { t } = useTranslation('pizzatheme');
  const [activeCategory, setActiveCategory] = useState('all');
  const { items } = useMenu(
    activeCategory !== 'all' ? activeCategory : undefined
  );
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
  const [itemsToShow, setItemsToShow] = useState(8);
  const [isSearching, setIsSearching] = useState(false);

  const isDarkModeActive = isDarkMode;

  const loadMore = () => {
    setItemsToShow(prevItemsToShow => prevItemsToShow + 6);
  };

  const buttonColor = primaryColor;

  useEffect(() => {
    if (searchTerm) {
      setIsSearching(true);
    } else {
      const timer = setTimeout(() => {
        setIsSearching(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [searchTerm]);

  useEffect(() => {
    setVisibleItemsCount(INITIAL_ITEMS_COUNT);
  }, [activeCategory, searchTerm]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 12,
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.2,
      },
    },
  };

  const handleSearch = (term: SetStateAction<string>) => {
    setSearchTerm(term);
    setItemsToShow(8);
  };

  return (
    <section
      id="product-list"
      className={`${isDarkModeActive ? 'bg-[#171717]' : ''} py-20`}
    >
      <div className="container mx-auto">
        <div>
          <div className="mb-20">
            <SearchBar
              palette={settings?.palette}
              isDarkMode={isDarkMode}
              onSearch={handleSearch}
            />
          </div>
          <MinimalMenuCategories
            primaryColor={primaryColor}
            activeCategory={activeCategory}
            onCategoryChange={category => {
              setActiveCategory(category);
              setItemsToShow(6);
            }}
            menuFilterDefaultStyle={
              isDarkModeActive
                ? 'bg-gray-800 text-gray-200'
                : `bg-[${primaryColor}] text-black`
            }
            activeCategoryStyles={`bg-[${buttonColor}] text-white`}
          />
          <AnimatePresence mode="wait">
            {filteredItems.length === 0 ? (
              <motion.div
                key="no-results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12"
              >
                <p
                  className={
                    isDarkModeActive ? 'text-gray-400' : 'text-gray-500'
                  }
                >
                  {t('common:product-list-no-items')}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 mt-20 gap-4 px-0 lg:px-20"
              >
                <AnimatePresence>
                  {filteredItems.slice(0, itemsToShow).map(item => (
                    <motion.div
                      key={item.id}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="flex justify-center"
                      layout
                    >
                      <ItemCard
                        item={item}
                        primaryColor={buttonColor}
                        isDarkMode={isDarkModeActive}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
          {itemsToShow < filteredItems.length && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mt-8"
            >
              <LoadMoreButton handleLoadMore={loadMore} isLoading={false} />

            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
