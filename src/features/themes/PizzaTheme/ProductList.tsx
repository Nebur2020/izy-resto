import { useState } from 'react';
import { MinimalMenuCategories } from '../../../components/menu/minimal/MinimalMenuCategories';
import { useMenu } from '../../../hooks';
import ItemCard from './ItemCard';
import { useTranslation } from 'react-i18next';
import { usePizzaTheme } from './context/PizzaThemeContext';

interface ProductListProps {
  tagline?: string;
  title?: string;
  primaryColor?: string;
  secondaryColor?: string;
  isDarkMode?: boolean;
}

export default function ProductList({
  tagline,
  title,
  primaryColor,
  isDarkMode,
}: ProductListProps) {
  const { t } = useTranslation('pizzatheme');
  const themeConfig = usePizzaTheme();
  const [activeCategory, setActiveCategory] = useState('all');
  const { items } = useMenu(
    activeCategory !== 'all' ? activeCategory : undefined
  );
  const filteredItems = items.filter(item => {
    const matchesCategory =
      activeCategory === 'all' || item.categoryId === activeCategory;
    return matchesCategory;
  });
  const [itemsToShow, setItemsToShow] = useState(8);

  // Default to theme context isDarkMode if not provided as prop
  const isDarkModeActive = isDarkMode;

  const loadMore = () => {
    setItemsToShow(prevItemsToShow => prevItemsToShow + 6);
  };

  // Use props if provided, otherwise fall back to theme context values
  const sectionTagline = tagline || themeConfig.menuSection.tagline;
  const sectionTitle = title || themeConfig.menuSection.title;
  const buttonColor = primaryColor;

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
          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <p
                className={isDarkModeActive ? 'text-gray-400' : 'text-gray-500'}
              >
                {t('common:product-list-no-items')}
              </p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 mt-20 gap-4 px-0 lg:px-20">
            {filteredItems.length > 0 &&
              filteredItems
                .slice(0, itemsToShow)
                .map(item => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    primaryColor={buttonColor}
                    isDarkMode={isDarkModeActive}
                  />
                ))}
          </div>
          {itemsToShow < filteredItems.length && (
            <div className="text-center mt-8">
              <button
                onClick={loadMore}
                className="text-white px-6 py-2 rounded-full transition-colors"
                style={{
                  backgroundColor: buttonColor,
                  ':hover': { backgroundColor: `${buttonColor}dd` },
                }}
              >
                {t('common:load-more')}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
