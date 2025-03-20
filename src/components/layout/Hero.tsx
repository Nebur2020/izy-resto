import React from 'react';
import { MapPin, Phone, ArrowDown } from 'lucide-react';
import { useSettings } from '../../hooks/useSettings';
import { Button } from '../ui/Button';
import { OpeningHoursButton } from './OpeningHoursButton';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';

interface InfoCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  onClick?: () => void;
  isButton?: boolean;
  palette?: {
    primary: string;
    secondary: string;
  };
  isDarkMode: boolean;
}

function InfoCard({
  icon: Icon,
  title,
  description,
  onClick,
  isButton,
  palette = {
    primary: '#2563EB',
    secondary: '#4D48E5',
  },
  isDarkMode,
}: InfoCardProps) {
  const Component = isButton ? 'button' : 'div';
  const baseClassName =
    'flex items-center gap-3 rounded-xl bg-white/90 p-3 shadow-lg backdrop-blur-sm transition-all dark:bg-white/10 dark:shadow-white/5 w-full';
  const className = isButton
    ? `${baseClassName} hover:bg-white/95 dark:hover:bg-white/15 active:scale-[0.98]`
    : baseClassName;

  // Generate dynamic color styles based on the palette
  const iconColor = isDarkMode ? palette.secondary : palette.primary;
  const titleColor = isDarkMode ? 'text-white' : 'text-gray-900';
  const descriptionColor = isDarkMode ? 'text-gray-300' : 'text-gray-700';

  return (
    <Component onClick={onClick} className={className}>
      <div className="flex-shrink-0">
        <Icon className={`h-5 w-5`} style={{ color: iconColor }} />
      </div>
      <div className="min-w-0 flex-1 text-left">
        <h3 className={`text-sm font-medium ${titleColor}`}>{title}</h3>
        <p className={`text-sm ${descriptionColor} truncate`}>{description}</p>
      </div>
    </Component>
  );
}

export function Hero({
  palette = {
    primary: '#2563EB',
    secondary: '#4D48E5',
  },
  isDarkMode,
}: {
  palette?: { primary: string; secondary: string };
  isDarkMode: boolean;
}) {
  const { settings } = useSettings();

  const scrollToMenu = () => {
    document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
  };

  const { t } = useTranslation('hero');
  return (
    <div className="relative h-[550px] w-full overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={
            settings?.coverImage ||
            'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80'
          }
          alt={t('cover-img-alt-title')}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/60" />
      </div>

      <div className="relative h-full">
        <div className="mx-auto h-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-full flex-col justify-between py-8 sm:py-12">
            <div className="flex flex-1 flex-col items-center justify-center text-center px-4 md:mt-8 mt-0">
              <h1 className="max-w-xl mx-auto mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl lg:max-w-2xl mt-10 md:mt-0">
                {t(settings?.name || 'restaurant-name')}
              </h1>
              <p className="mb-4 max-w-md mx-auto text-base text-gray-300/90 sm:text-lg">
                {t(settings?.description || 'restaurant-description')}
              </p>
              <Button
                onClick={scrollToMenu}
                className="group relative rounded-full px-8 py-3 text-base font-medium transition-all hover:shadow-lg hover:opacity-90 sm:text-lg
    bg-gradient-to-r from-gray-200 to-white hover:bg-gradient-to-r hover:from-gray-200 hover:to-gray-300
    dark:bg-gradient-to-r dark:hover:from-blue-600 dark:hover:to-blue-500"
                style={{
                  color: isDarkMode ? '#FFFFFF' : palette.primary,
                  background: isDarkMode
                    ? `linear-gradient(to right, ${palette.primary}, ${palette.secondary})`
                    : undefined,
                }}
                spanStyle={{
                  color: isDarkMode ? '#FFFFFF' : palette.primary,
                }}
              >
                {t('view-menu')}
                <ArrowDown className="ml-2 inline-block h-4 w-4 transition-transform group-hover:translate-y-1 group-hover:animate-bounce" />
              </Button>
            </div>

            <div className="space-y-2 px-4 sm:flex sm:space-y-0 sm:space-x-4 sm:px-6 max-w-4xl mx-auto w-full">
              <div className="sm:flex-1">
                <OpeningHoursButton />
              </div>
              <div className="sm:flex-1">
                <InfoCard
                  icon={MapPin}
                  isButton
                  title={t('restaurant-address-title')}
                  description={t(
                    settings?.address || 'restaurant-default-address'
                  )}
                  onClick={() => {
                    settings?.address &&
                      window.open(
                        `https://www.google.com/maps/search/${settings?.address}`,
                        '_blank'
                      );
                  }}
                  palette={
                    settings?.palette ||
                    palette || {
                      primary: '#3B82F6',
                      secondary: '#60A5FA',
                    }
                  }
                  isDarkMode={isDarkMode}
                />
              </div>
              <div className="sm:flex-1">
                <InfoCard
                  icon={Phone}
                  title={t('restaurant-contact-title')}
                  description={t(
                    settings?.phone || 'restaurant-call-to-action'
                  )}
                  isButton
                  onClick={() => {
                    if (settings?.phone) {
                      window.location.href = `tel:${settings.phone}`;
                    }
                  }}
                  palette={
                    settings?.palette ||
                    palette || {
                      primary: '#3B82F6',
                      secondary: '#60A5FA',
                    }
                  }
                  isDarkMode={isDarkMode}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
