import { Search, SortAsc, SortDesc } from 'lucide-react';
import { Button } from '../../ui/Button';
import { useTranslation } from 'react-i18next';

interface ICustomerFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  sortOrder: 'asc' | 'desc';
  onSortChange: (order: 'asc' | 'desc') => void;
  sortBy: 'spent' | 'orders';
  onSortByChange: (value: 'spent' | 'orders') => void;
}

export function CustomerFilters(props: ICustomerFiltersProps) {
  const { t } = useTranslation();
  const { searchTerm, onSearchChange, sortOrder, onSortChange, sortBy, onSortByChange } = props;
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t('client:search-customer')}
          className="w-full pl-10 pr-4 py-2 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-800"
        />
      </div>
      
      <div className="flex gap-2">
        <select
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value as 'spent' | 'orders')}
          className="rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2"
        >
          <option value="spent">
            {t('client:sort-by-expenses')}
          </option>
          <option value="orders">
            {t('client:sort-by-orders')}
          </option>
        </select>
        
        <Button
          variant="secondary"
          onClick={() => onSortChange(sortOrder === 'asc' ? 'desc' : 'asc')}
        >
          {sortOrder === 'asc' ? (
            <SortAsc className="w-5 h-5" />
          ) : (
            <SortDesc className="w-5 h-5" />
          )}
        </Button>
      </div>
    </div>
  );
}