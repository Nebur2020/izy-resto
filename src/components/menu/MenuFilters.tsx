import { useState, useRef, useEffect } from 'react';
import { useCategories } from '../../hooks/useCategories';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../../hooks';

interface IMenuFiltersProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  menuFilterDefaultStyle?: string;
  palette?: {
    primary: string;
    secondary: string;
  };
  isDarkMode: boolean;
}

export function MenuFilters(props: IMenuFiltersProps) {
  const {
    activeCategory,
    onCategoryChange,
    palette = {
      primary: '#2563EB',
      secondary: '#4D48E5',
    },
  } = props;

  const { allCategories, isLoading } = useCategories();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(false);

  const settings = useSettings();
  const primaryColor = settings?.settings?.palette.primary;

  const { t } = useTranslation('menu');

  // Create gradient style using the palette
  const activeGradientStyle = {
    background: `linear-gradient(to right, ${palette.primary}, ${palette.secondary})`,
    color: 'white',
    boxShadow:
      '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  };

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
      <div className="w-full h-12 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-full" />
    );
  }

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-3xl flex items-center gap-2 px-4">
        <AnimatePresence>
          {showLeftScroll && (
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              onClick={() => scroll('left')}
              className="flex-none p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg
                       border border-gray-200 dark:border-gray-700 hover:bg-gray-50 
                       dark:hover:bg-gray-700/50 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </motion.button>
          )}
        </AnimatePresence>

        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="flex-1 flex items-center justify-start gap-2 overflow-x-auto scroll-smooth
                   [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="flex items-center gap-2 px-4 mx-auto">
            <motion.button
              onClick={() => onCategoryChange('all')}
              className={`flex-none px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 hover:scale-105 ${
                activeCategory !== 'all'
                  ? 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  : 'text-white'
              }`}
              style={{
                backgroundColor: activeCategory === 'all' ? primaryColor : '',
                color: activeCategory === 'all' ? 'white' : '',
              }}
              whileHover={{
                y: activeCategory === 'all' ? 0 : -2,
                scale: activeCategory === 'all' ? 1 : 1.05,
              }}
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
                    activeCategory !== category.id
                      ? 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      : ''
                  }
                `}
                style={{
                  backgroundColor:
                    activeCategory === category.id ? primaryColor : '',
                  color: activeCategory === category.id ? 'white' : '',
                }}
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
              className="flex-none p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg
                       border border-gray-200 dark:border-gray-700 hover:bg-gray-50 
                       dark:hover:bg-gray-700/50 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
