import { Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface MenuSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  palette?: {
    primary: string;
    secondary: string;
  };
}

export function MenuSearchBar({
  value,
  onChange,
  onClear,
  palette = {
    primary: '#2563EB',
    secondary: '#4D48E5',
  },
}: MenuSearchBarProps) {
  const { t } = useTranslation();

  const handleClear = () => {
    onChange('');
    if (onClear) {
      onClear();
    }
  };

  return (
    <div className="relative">
      <input
        type="text"
        placeholder={t('search')}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full pl-10 pr-10 py-2 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none"
        style={
          {
            '--tw-ring-color': palette.primary,
            boxShadow: value ? `0 0 0 2px ${palette.primary}30` : '',
          } as React.CSSProperties
        }
        onFocus={e =>
          (e.target.style.boxShadow = `0 0 0 2px ${palette.primary}30`)
        }
        onBlur={e =>
        (e.target.style.boxShadow = value
          ? `0 0 0 2px ${palette.primary}30`
          : '')
        }
      />
      <Search
        className="absolute left-3 top-2.5 h-5 w-5"
        style={{ color: value ? palette.primary : '#9ca3af' }}
      />
      {value && (
        <X
          className="absolute right-3 top-2.5 h-5 w-5 cursor-pointer hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          style={{ color: '#9ca3af' }}
          onClick={handleClear}
          aria-label="Clear search"
        />
      )}
    </div>
  );
}
