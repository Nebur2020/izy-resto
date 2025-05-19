import { OrderStatus } from '../../types';
import { Button } from '../ui/Button';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../../hooks';

interface IOrderFiltersProps {
  currentFilter: OrderStatus | 'all';
  onFilterChange: (filter: OrderStatus | 'all') => void;
}

export function OrderFilters(props: IOrderFiltersProps) {
  const { currentFilter, onFilterChange } = props;
  const { t } = useTranslation('order');
  const filters: Array<{ value: OrderStatus | 'all'; label: string }> = [
    { value: 'all', label: t('common:all-orders') },
    { value: 'pending', label: t('common:pending') },
    { value: 'preparing', label: t('common:in-cooking') },
    { value: 'delivered', label: t('common:delivered') },
    { value: 'cancelled', label: t('common:canceled') },
  ];

  const { settings } = useSettings();
  const primaryColor = settings?.palette.primary;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {filters.map(filter => (
          <Button
            key={filter.value}
            variant="secondary"
            onClick={() => onFilterChange(filter.value)}
            size="sm"
            style={{
              backgroundColor:
                currentFilter === filter.value ? primaryColor : undefined
            }}
            spanClassName={`${currentFilter === filter.value ? "text-white" : "text-black"}`}
          >
            {filter.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
