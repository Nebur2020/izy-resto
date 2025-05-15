import { UseFormRegister } from 'react-hook-form';
import { RestaurantSettings } from '../../../../../../types/settings';
import { useTranslation } from 'react-i18next';
import { LucideIcon } from 'lucide-react';
import { Button } from '../../../../../../components/ui';
import { useSettings } from '../../../../../../hooks/useSettings';

interface TemplateOptionProps {
  icon: LucideIcon;
  title: string;
  description: string;
  value: string;
  selected: boolean;
  onChange: (value: string) => void;
  register: UseFormRegister<RestaurantSettings>;
  imageUrl: string;
  setShowModal?: (value: boolean) => void;
  onCustomize?: () => void;
}

export function TemplateOption(props: TemplateOptionProps) {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const primaryColor = settings?.palette?.primary || '#0ea5e9';
  const {
    title,
    description,
    value,
    selected,
    onChange,
    register,
    imageUrl,
    onCustomize,
  } = props;

  // Create styles using primary color with opacity for different states
  const selectedBorderStyle = { borderColor: primaryColor };
  const selectedBgStyle = { backgroundColor: `${primaryColor}10` }; // 10% opacity
  const hoverBorderStyle = { borderColor: `${primaryColor}80` }; // 50% opacity

  return (
    <div
      className={`
        relative rounded-lg border-2 p-4 cursor-pointer transition-all flex flex-col h-full
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
        {...register('activeLanding')}
        value={value}
        className="sr-only"
      />
      <div className="aspect-video mb-4 rounded-md bg-gray-100 dark:bg-gray-700 overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
      <h3 className="font-medium mb-1">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-auto">
        {description}
      </p>
      {onCustomize && selected && (
        <Button
          type="button"
          onClick={onCustomize}
          className="mt-4 w-full text-white rounded-lg px-4 py-2"
          style={{ backgroundColor: primaryColor }}
        >
          {t('settingAppearence:customize')}
        </Button>
      )}
    </div>
  );
}
