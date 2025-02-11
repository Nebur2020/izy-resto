import { OrderStatus } from '../../types';
import { Button } from '../ui/Button';
import { Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface IOrderFiltersProps {
  currentFilter: OrderStatus | 'all';
  onFilterChange: (filter: OrderStatus | 'all') => void;
  dateRange: { from?: Date; to?: Date };
  onDateRangeChange: (range: { from?: Date; to?: Date }) => void;
}

export function OrderFilters(props: IOrderFiltersProps) {
  const { currentFilter, onFilterChange, dateRange, onDateRangeChange } = props;
  const { t } = useTranslation('order');
  const filters: Array<{ value: OrderStatus | 'all'; label: string }> = [
    { value: 'all', label: t('common:all-orders') },
    { value: 'pending', label: t('common:pending') },
    { value: 'preparing', label: t('common:in-cooking') },
    { value: 'delivered', label: t('common:delivered') },
    { value: 'cancelled', label: t('common:canceled') },
  ];

  const presets = [
    { label: t('dashboard:this-day'), days: 0 },
    { label: t('common:last-week'), days: 7 },
    { label: t('common:last-month'), days: 30 },
  ];

  const handleDatePreset = (days: number) => {
    const to = new Date();
    const from = new Date();
    if (days > 0) {
      from.setDate(from.getDate() - days);
    } else {
      from.setHours(0, 0, 0, 0);
    }
    onDateRangeChange({ from, to });
  };

  const clearDateRange = () => {
    onDateRangeChange({});
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {filters.map(filter => (
          <Button
            key={filter.value}
            variant={currentFilter === filter.value ? 'primary' : 'secondary'}
            onClick={() => onFilterChange(filter.value)}
            size="sm"
          >
            {filter.label}
          </Button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Calendar className="w-5 h-5 text-gray-500" />
        {presets.map(preset => (
          <Button
            key={preset.label}
            variant="secondary"
            size="sm"
            onClick={() => handleDatePreset(preset.days)}
          >
            {preset.label}
          </Button>
        ))}
        {(dateRange.from || dateRange.to) && (
          <Button variant="secondary" size="sm" onClick={clearDateRange}>
            {t('common:reset-filter')}
          </Button>
        )}
      </div>
    </div>
  );
}
