import React from 'react';
import { LucideIcon } from 'lucide-react';
import { UseFormRegister } from 'react-hook-form';
import { RestaurantSettings } from '../../../../../../types/settings';
import { useSettings } from '../../../../../../hooks/useSettings';

interface ThemeOptionProps {
  icon: LucideIcon;
  title: string;
  description: string;
  value: 'light' | 'dark';
  selected: boolean;
  onChange: (value: 'light' | 'dark') => void;
  register: UseFormRegister<RestaurantSettings>;
}

export function ThemeOption({
  icon: Icon,
  title,
  description,
  value,
  selected,
  onChange,
  register,
}: ThemeOptionProps) {
  const { settings } = useSettings();
  const primaryColor = settings?.palette?.primary || '#0ea5e9';

  // Create styles using primary color with opacity for different states
  const selectedBorderStyle = { borderColor: primaryColor };
  const selectedBgStyle = { backgroundColor: `${primaryColor}10` }; // 10% opacity

  return (
    <div
      className={`
        relative rounded-lg border-2 p-6 cursor-pointer transition-all
        ${
          selected
            ? 'dark:bg-opacity-10'
            : 'border-gray-200 dark:border-gray-700 hover:border-opacity-60'
        }
      `}
      style={selected ? { ...selectedBorderStyle, ...selectedBgStyle } : {}}
      onMouseOver={e =>
        !selected && (e.currentTarget.style.borderColor = `${primaryColor}80`)
      }
      onMouseOut={e => !selected && (e.currentTarget.style.borderColor = '')}
      onClick={() => onChange(value)}
    >
      <input
        type="radio"
        {...register('defaultTheme')}
        value={value}
        className="sr-only"
      />
      <div className="flex items-center gap-4">
        <div
          className={`p-3 ${
            value === 'light' ? 'bg-white' : 'bg-gray-900'
          } rounded-lg shadow-md`}
        >
          <Icon
            className={`w-8 h-8`}
            style={{ color: value === 'light' ? '#f59e0b' : primaryColor }}
          />
        </div>
        <div>
          <h3 className="font-medium text-lg mb-1">{title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
