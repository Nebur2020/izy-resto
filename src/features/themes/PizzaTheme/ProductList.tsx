import { useState } from 'react';
import { MinimalMenuCategories } from '../../../components/menu/minimal/MinimalMenuCategories';
import { useMenu } from '../../../hooks';
import ItemCard from './ItemCard';
import { useTranslation } from 'react-i18next';

export default function ProductList() {
  const { t } = useTranslation('pizzatheme');
  const [activeCategory, setActiveCategory] = useState('all');
  const { items } = useMenu(
    activeCategory !== 'all' ? activeCategory : undefined
  );
  const filteredItems = items.filter(item => {
    const matchesCategory =
      activeCategory === 'all' || item.categoryId === activeCategory;
    return matchesCategory;
  });
  const [itemsToShow, setItemsToShow] = useState(6);

  const loadMore = () => {
    setItemsToShow(prevItemsToShow => prevItemsToShow + 6);
  };

  console.table(items);

  return (
    <section id="product-list">
      <div className="flex flex-col items-center my-20 text-center">
        <span className="text-red-600 font-bold text-sm sm:text-base">
          {t('product-list-title')}
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold max-w-[90%] sm:max-w-[70%] lg:max-w-[50%]">
          {t('product-list-subtitle')}
        </h1>
      </div>
      <div>
        <MinimalMenuCategories
          activeCategory={activeCategory}
          onCategoryChange={category => {
            setActiveCategory(category);
            setItemsToShow(6);
          }}
          menuFilterDefaultStyle="bg-[#fcb302] text-white"
          activeCategoryStyles="bg-[#fcb302] text-white"
        />
        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              {t('common:product-list-no-items')}
            </p>
          </div>
        )}
        <div className="flex flex-wrap justify-center mt-20">
          {filteredItems.length > 0 &&
            filteredItems
              .slice(0, itemsToShow)
              .map(item => <ItemCard item={item} />)}
        </div>
        {itemsToShow < filteredItems.length && (
          <div className="text-center mt-8">
            <button
              onClick={loadMore}
              className="bg-[#fcb302] text-white px-6 py-2 rounded-full hover:bg-[#e0a000] transition-colors"
            >
              {t('common:load-more')}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
