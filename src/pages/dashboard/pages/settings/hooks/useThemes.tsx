import { useTranslation } from 'react-i18next';
import { Sun, LayoutGrid, Rows, Columns, LucideIcon } from 'lucide-react';

export type AppTheme = {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  value: string;
  imageUrl: string;
};

export const useAppThemes = (): {
  premium: AppTheme[];
  default: AppTheme[];
} => {
  const { t } = useTranslation();

  const premium = [
    {
      id: '1',
      imageUrl:
        'https://res.cloudinary.com/dp8d8jxxd/image/upload/v1740908360/izirestau/uc9uptbzyrsuoy4grdes.png',
      title: t('settingAppearence:theme-name'),
      description: t('settingAppearence:theme-description'),
      value: 'pizza',
      icon: Sun,
    },
  ];

  const defaultThemes = [
    {
      id: '1',
      icon: Rows,
      title: t('settingAppearence:modern'),
      description: t('settingAppearence:modern-description'),
      value: 'modern',
      imageUrl:
        'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=500&q=60',
    },
    {
      id: '2',
      icon: Columns,
      title: t('settingAppearence:minimal'),
      description: t('settingAppearence:minimal-description'),
      value: 'minimal',
      imageUrl:
        'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=500&q=60',
    },
    {
      id: '3',
      icon: LayoutGrid,
      title: t('settingAppearence:grid'),
      description: t('settingAppearence:grid-description'),
      value: 'grid',
      imageUrl:
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=500&q=60',
    },
  ];

  return { premium, default: defaultThemes };
};
