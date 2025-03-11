import { UseFormRegister } from 'react-hook-form';
import { RestaurantSettings } from '../../../../../../types/settings';
import { useTranslation } from 'react-i18next';
import { LucideIcon } from 'lucide-react';
import { Button } from '../../../../../../components/ui';

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
  return (
    <div
      className={`
        relative rounded-lg border-2 p-4 cursor-pointer transition-all flex flex-col h-full
        ${
          selected
            ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
            : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
        }
      `}
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
          className="mt-4 bg-blue-500 w-full text-white rounded-lg px-4 py-2"
        >
          {t('settingAppearence:customize')}
        </Button>
      )}
    </div>
  );
}
