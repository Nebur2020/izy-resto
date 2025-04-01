import { useEffect, useState } from 'react';
import { MinimalMenuCategories } from '../../../components/menu/minimal/MinimalMenuCategories';
import { useMenu } from '../../../hooks';
import ItemCard from './ItemCard';
import { useTranslation } from 'react-i18next';
import { usePizzaTheme } from './context/PizzaThemeContext';
import { SearchBar } from '../../../components/menu/SearchBar';
import { useSettings } from '../../../hooks';
import { motion, AnimatePresence } from 'framer-motion'; // Importez framer-motion
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
  tagline,
  title,
  primaryColor,
  isDarkMode,
}: ProductListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleItemsCount, setVisibleItemsCount] =
    useState(INITIAL_ITEMS_COUNT);
  const { settings } = useSettings();
  const { t } = useTranslation('pizzatheme');
  const themeConfig = usePizzaTheme();
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

  const sectionTagline = tagline || themeConfig.menuSection.tagline;
  const sectionTitle = title || themeConfig.menuSection.title;
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

  const handleSearch = term => {
    setSearchTerm(term);
    setItemsToShow(8);
  };

  return (
    <section
      id="product-list"
      className={`${isDarkModeActive ? 'bg-[#171717]' : ''} py-20`}
    >
      <div className="container mx-auto">
        <div className="flex flex-col items-center pb-20 text-center">
          {sectionTagline && (
            <span
              className="font-bold text-sm sm:text-base mb-3"
              style={{ color: primaryColor }}
            >
              {sectionTagline}
            </span>
          )}
          {sectionTitle && (
            <h1
              className={`text-3xl sm:text-4xl lg:text-5xl font-bold max-w-[90%] sm:max-w-[70%] lg:max-w-[50%] ${
                isDarkModeActive ? 'text-white' : ''
              }`}
            >
              {sectionTitle}
            </h1>
          )}
        </div>
        <div>
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
          <div className="mt-20">
            <SearchBar
              palette={settings?.palette}
              isDarkMode={isDarkMode}
              onSearch={handleSearch}
            />
          </div>
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
