import { Facebook, Twitter, Instagram } from 'lucide-react';
import { useFoodTheme } from './context/FoodThemeContext';
import { useSettings } from '../../../hooks/useSettings';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import packageJson from '../../../../package.json';

interface FooterProps {
  siteName?: string;
  primaryColor?: string;
  secondaryColor?: string;
  isDarkMode?: boolean;
  logo: string;
  showOpeningHours?: boolean;
  location?: string;
  copyrightText?: string;
}

export default function Footer(props: FooterProps) {
  const {
    siteName,
    primaryColor,
    isDarkMode,
    logo,
    showOpeningHours,
    location,
  } = props;
  const { settings } = useSettings();
  const siteLogo = logo;
  const isDarkModeActive = isDarkMode;
  const footerBgColor = isDarkModeActive ? '#121212' : '#1a1a1a';
  const themeConfig = useFoodTheme();
  const footerShowHours =
    showOpeningHours !== undefined
      ? showOpeningHours
      : themeConfig.footer.showOpeningHours;

  const { t } = useTranslation();

  const truncateText = (text: string, maxLength: number) => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + '...';
    }
    return text;
  };
  const maxLength = 30;

  const openingHours = useMemo(() => {
    if (!settings?.openingHours || !footerShowHours) return [];

    return Object.entries(settings.openingHours)
      .filter(
        ([_, hours]) =>
          typeof hours === 'object' && hours && (hours.open || hours.closed)
      )
      .sort((a, b) => {
        const days = [
          'monday',
          'tuesday',
          'wednesday',
          'thursday',
          'friday',
          'saturday',
          'sunday',
        ];
        return days.indexOf(a[0]) - days.indexOf(b[0]);
      });
  }, [settings?.openingHours, footerShowHours]);

  const socialIcons = [
    {
      Icon: Facebook,
      link:
        settings?.socialMedia?.find(s => s.platform === 'facebook')?.url || '#',
    },
    {
      Icon: Twitter,
      link:
        settings?.socialMedia?.find(s => s.platform === 'twitter')?.url || '#',
    },
    {
      Icon: Instagram,
      link:
        settings?.socialMedia?.find(s => s.platform === 'instagram')?.url ||
        '#',
    },
  ];

  return (
    <footer
      className="text-white py-16 relative"
      style={{ backgroundColor: footerBgColor }}
    >
      <div className="absolute inset-x-0 top-0 h-20 bg-wave-pattern bg-cover bg-center"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row justify-between text-center md:text-left">
          <div className="mb-8 md:mb-0">
            <h2
              className="text-2xl font-bold mb-4"
              style={{ color: primaryColor }}
            >
              {t('common:opening-time')}
            </h2>
            <div className="space-y-2">
              {openingHours.length > 0 && (
                <div className="w-full sm:w-auto">
                  <h2 className="text-xl font-bold mb-2 text-white">
                    {t('pizzatheme:opening-hours')}
                  </h2>
                  <ul className="text-gray-600 w-[200px] mx-auto sm:mx-0">
                    {openingHours.map(([day, hours]) => (
                      <span
                        className="flex items-center justify-between"
                        key={day}
                      >
                        <span className="font-medium text-white">
                          {t(`common:days.${day}`)}
                        </span>
                        <li
                          className={`text-white py-2 ${
                            typeof hours === 'object' && hours.closed
                              ? 'text-red-500 dark:text-red-400'
                              : ''
                          }`}
                        >
                          {typeof hours === 'object' && hours.closed
                            ? t('common:closed')
                            : typeof hours === 'object'
                            ? `${hours.open} - ${hours.close}`
                            : ''}
                        </li>
                      </span>
                    ))}
                  </ul>
                </div>
              )}
              <p style={{ color: primaryColor }}>Booking Time: 24/7 Hours</p>
            </div>
          </div>

          <div className="flex flex-col items-center mb-8 md:mb-0">
            <div className="mb-4">
              <img
                src={siteLogo}
                alt={`${siteName} Logo`}
                className="w-[200px]"
              />
            </div>
            <h1 className="text-3xl font-bold">{siteName}</h1>
            <p className="text-gray-400 mt-2">
              {settings && truncateText(settings.description, maxLength)}
            </p>
          </div>

          <div>
            <h2
              className="text-2xl font-bold mb-4"
              style={{ color: primaryColor }}
            >
              {t('common:contact-us')}
            </h2>
            <div className="space-y-2">
              <p className="text-white">
                {t('common:address')}: {location}
              </p>
              <p className="text-white">
                {t('common:phone-number')}: {settings?.phone}
              </p>

              <div className="flex justify-center md:justify-start space-x-4 mt-4">
                {socialIcons.map(({ Icon, link }, index) => (
                  <a
                    key={index}
                    href={link}
                    className="bg-gray-700 rounded-full p-2 hover:bg-opacity-75 transition-colors"
                    style={{
                      backgroundColor: isDarkMode
                        ? 'rgba(255,255,255,0.1)'
                        : 'rgba(0,0,0,0.1)',
                      color: primaryColor,
                    }}
                  >
                    <Icon className="w-6 h-6" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-white mt-12 border-t border-gray-700 pt-4">
          <p>{` © Copyright ${new Date().getFullYear()} - AF | ${t(
            'footer:all-rights-reserved'
          )}`}</p>
          <p className="mt-2">v{packageJson.version}</p>
        </div>
      </div>
    </footer>
  );
}
