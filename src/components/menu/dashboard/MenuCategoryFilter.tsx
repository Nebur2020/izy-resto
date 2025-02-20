import { useTranslation } from 'react-i18next';
import { useCategories } from '../../../hooks/useCategories';

interface IMenuCategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export function MenuCategoryFilter(props: IMenuCategoryFilterProps) {
  const { selectedCategory, onCategoryChange } = props;
  const { t } = useTranslation();
  const { categories } = useCategories();

  return (
    <div className="relative w-48">
      <label htmlFor="category-select" className="sr-only">
        {t('Select Category')}
      </label>
      <select
        id="category-select"
        value={selectedCategory}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="block appearance-none w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 ease-in-out"
      >
        <option value="all">
          {t('common:product')}
        </option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-200">
        <svg
          className="fill-current h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
        >
          <path d="M5.516 7.548a.75.75 0 011.06.02L10 11.292l3.424-3.724a.75.75 0 111.08 1.04l-4 4.344a.75.75 0 01-1.08 0l-4-4.344a.75.75 0 01.02-1.06z" />
        </svg>
      </div>
    </div>
  );
}
