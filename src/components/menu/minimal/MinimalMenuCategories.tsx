import { AnimatePresence, motion } from 'framer-motion';
import { useCategories } from '../../../hooks/useCategories';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useSettings } from '../../../hooks';

interface IMinimalMenuCategoriesProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  menuFilterDefaultStyle?: string;
  activeCategoryStyles?: string;
  primaryColor?: string;
}

export function MinimalMenuCategories(props: IMinimalMenuCategoriesProps) {
  const {
    activeCategory,
    onCategoryChange,
    menuFilterDefaultStyle,
    activeCategoryStyles,
    primaryColor,
  } = props;

  const { allCategories, isLoading } = useCategories();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(false);
  const { t } = useTranslation('menu');
  const { settings } = useSettings();

  // Use provided primary color or fall back to theme context
  const themeColor = primaryColor || '#fcb302';
  const isDarkMode = settings?.defaultTheme === 'dark';

  // Get the background color from theme config for inactive buttons
  const backgroundColor = '#fff';
  // Generate the styles based on theme colors
  const defaultButtonStyle =
    menuFilterDefaultStyle || isDarkMode
      ? 'bg-gray-800 text-gray-300 border border-gray-700'
      : 'bg-white text-gray-700 border border-gray-200';

  const activeButtonStyle =
    activeCategoryStyles || 'text-white shadow-md border border-transparent';

  const scrollButtonStyle = isDarkMode
    ? 'bg-gray-800 border-gray-700 hover:bg-gray-700/50'
    : 'bg-white border-gray-200 hover:bg-gray-50';

  const scrollIconStyle = isDarkMode ? 'text-gray-400' : 'text-gray-600';

  const loadingStyle = isDarkMode ? 'bg-gray-800' : 'bg-gray-100';

  const checkScroll = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setShowLeftScroll(container.scrollLeft > 0);
      setShowRightScroll(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 1
      );
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [allCategories]);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return (
      <div
        className={`w-full h-12 ${loadingStyle} animate-pulse rounded-full`}
      />
    );
  }

  return (
    <div className={`w-full flex justify-center`}>
      <div className="w-full max-w-3xl flex items-center gap-2 px-4">
        <AnimatePresence>
          {showLeftScroll && (
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              onClick={() => scroll('left')}
              className={`flex-none p-2 rounded-full shadow-lg
                       border transition-colors ${scrollButtonStyle}`}
            >
              <ChevronLeft className={`w-5 h-5 ${scrollIconStyle}`} />
            </motion.button>
          )}
        </AnimatePresence>

        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="flex-1 flex items-center justify-start gap-2 overflow-x-auto scroll-smooth
                   [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden rounded-full"
        >
          <div className="flex items-center gap-2 px-4 mx-auto">
            <motion.button
              onClick={() => onCategoryChange('all')}
              className={`
                flex-none px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap
                transition-all duration-200 hover:scale-105
                ${
                  activeCategory === 'all'
                    ? activeButtonStyle
                    : defaultButtonStyle
                }
              `}
              style={
                activeCategory === 'all'
                  ? { backgroundColor: themeColor }
                  : isDarkMode
                  ? undefined
                  : { backgroundColor: backgroundColor }
              }
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              {t('principal-menu')}
            </motion.button>

            {allCategories.map(category => (
              <motion.button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={`
                  flex-none px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap
                  transition-all duration-200 hover:scale-105
                  ${
                    activeCategory === category.id
                      ? activeButtonStyle
                      : defaultButtonStyle
                  }
                `}
                style={
                  activeCategory === category.id
                    ? { backgroundColor: themeColor }
                    : isDarkMode
                    ? undefined
                    : { backgroundColor: backgroundColor }
                }
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                {t(category.name)}
              </motion.button>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {showRightScroll && (
            <motion.button
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onClick={() => scroll('right')}
              className={`flex-none p-2 rounded-full shadow-lg
                       border transition-colors ${scrollButtonStyle}`}
            >
              <ChevronRight className={`w-5 h-5 ${scrollIconStyle}`} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
