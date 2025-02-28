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
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <section>
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
            setCurrentPage(1);
          }}
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
              .slice((currentPage - 1) * 6, currentPage * 6)
              .map(item => (
                <ItemCard
                  title={item.name}
                  imageUrl={item.image}
                  shortDescription={item.description}
                  price={item.price}
                  size={'small'}
                />
              ))}
        </div>
      </div>
    </section>
  );
}
