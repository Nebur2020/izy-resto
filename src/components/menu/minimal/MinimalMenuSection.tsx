import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMenu } from '../../../hooks/useMenu';
import { MinimalMenuItem } from './MinimalMenuItem';
import { MinimalMenuCategories } from './MinimalMenuCategories';
import { SearchBar } from '../SearchBar';
import { useTranslation } from 'react-i18next';
import { RefreshCw } from 'lucide-react';
import { useSettings } from '../../../hooks';
import { useTheme } from '../../../context/ThemeContext';
import { hexToRgb } from '../../../lib/firebase/utils/functions';

const INITIAL_ITEMS_COUNT = 8;
const LOAD_MORE_COUNT = 8;

type MinimalMenuSectionProps = {
  palette?: {
    primary: string;
    secondary: string;
  };
  isDarkMode?: boolean;
};

export function MinimalMenuSection({
  palette = {
    primary: '#2563EB',
    secondary: '#4D48E5',
  },
  isDarkMode = false,
}: MinimalMenuSectionProps) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleItemsCount, setVisibleItemsCount] =
    useState(INITIAL_ITEMS_COUNT);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const { items } = useMenu(
    activeCategory !== 'all' ? activeCategory : undefined
  );

  const { t } = useTranslation('menu');
  const { settings } = useSettings();

  // Move the useEffect after all hook calls
  useEffect(() => {
    setVisibleItemsCount(INITIAL_ITEMS_COUNT);
  }, [activeCategory, searchTerm]);

  // Early return but after all hooks are called
  if (!settings) {
    return null;
  }

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

  const buttonBgColor = isDarkMode
    ? `rgba(${hexToRgb(palette.primary)}, 0.2)`
    : `rgba(${hexToRgb(palette.primary)}, 0.1)`;

  const buttonHoverBgColor = isDarkMode
    ? `rgba(${hexToRgb(palette.primary)}, 0.3)`
    : `rgba(${hexToRgb(palette.primary)}, 0.2)`;

  const buttonTextColor = isDarkMode ? '#d1d5db' : palette.primary;

  const handleLoadMore = () => {
    setIsLoadingMore(true);

    setTimeout(() => {
      setVisibleItemsCount(prevCount => prevCount + LOAD_MORE_COUNT);
      setIsLoadingMore(false);
    }, 500);
  };

  return (
    <div className="space-y-12">
      <SearchBar
        palette={settings.palette}
        isDarkMode={isDarkMode}
        onSearch={setSearchTerm}
      />

      <MinimalMenuCategories
        activeCategory={activeCategory}
        onCategoryChange={category => {
          setActiveCategory(category);
        }}
        primaryColor={settings.palette.primary}
      />

      <motion.div layout className="grid grid-cols-1 gap-8 max-w-3xl mx-auto">
        {visibleItems.map(item => (
          <MinimalMenuItem
            palette={settings.palette}
            isDarkMode={isDarkMode}
            key={item.id}
            item={item}
          />
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
                className="flex items-center gap-2 px-6 py-2 rounded-lg transition-colors font-medium"
                style={{
                  backgroundColor: buttonBgColor,
                  color: buttonTextColor,
                  ':hover': {
                    backgroundColor: buttonHoverBgColor,
                  },
                }}
              >
                <RefreshCw
                  className="w-4 h-4"
                  style={{ color: buttonTextColor }}
                />
                {t('common:load-more')}
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );
}
