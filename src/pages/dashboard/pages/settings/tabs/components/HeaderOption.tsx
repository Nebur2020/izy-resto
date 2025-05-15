import React from 'react';
import { LucideIcon } from 'lucide-react';
import { UseFormRegister } from 'react-hook-form';
import { RestaurantSettings } from '../../../../../../types/settings';
import { useSettings } from '../../../../../../hooks/useSettings';

interface HeaderOptionProps {
  icon: LucideIcon;
  title: string;
  description: string;
  value: string;
  selected: boolean;
  onChange: (value: string) => void;
  register: UseFormRegister<RestaurantSettings>;
}

export function HeaderOption({
  icon: Icon,
  title,
  description,
  value,
  selected,
  onChange,
  register,
}: HeaderOptionProps) {
  const { settings } = useSettings();
  const primaryColor = settings?.palette?.primary || '#0ea5e9';

  // Create styles using primary color with opacity for different states
  const selectedBorderStyle = { borderColor: primaryColor };
  const selectedBgStyle = { backgroundColor: `${primaryColor}10` }; // 10% opacity

  return (
    <div
      className={`
        relative rounded-lg border-2 p-4 cursor-pointer transition-all
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
        {...register('activeHeader')}
        value={value}
        className="sr-only"
      />
      <div className="aspect-video mb-4 rounded-md bg-gray-100 dark:bg-gray-700 p-8 flex items-center justify-center">
        <Icon className="w-24 h-24" style={{ color: primaryColor }} />
      </div>
      <h3 className="font-medium mb-1">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
    </div>
  );
}
