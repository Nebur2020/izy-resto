import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../../../hooks/useSettings';
import { usePizzaTheme } from './context/PizzaThemeContext';

interface FooterProps {
  logo?: string;
  siteName?: string;
  location?: string;
  copyrightText?: string;
  showOpeningHours?: boolean;
  backgroundImage?: string;
  isDarkMode?: boolean;
}

export default function Footer({
  logo,
  siteName,
  location,
  copyrightText,
  showOpeningHours,
  backgroundImage,
  isDarkMode,
}: FooterProps) {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const themeConfig = usePizzaTheme();

  // Default to theme context isDarkMode if not provided as prop
  const isDarkModeActive = isDarkMode;

  // Use props if provided, otherwise fall back to theme context values
  const footerLogo = logo || themeConfig.general.logo;
  const footerSiteName = siteName || themeConfig.general.siteName;
  const footerLocation = location || themeConfig.footer.location;
  const footerCopyright = copyrightText || themeConfig.footer.copyrightText;
  const footerShowHours =
    showOpeningHours !== undefined
      ? showOpeningHours
      : themeConfig.footer.showOpeningHours;
  const footerBgImage = backgroundImage || themeConfig.footer.backgroundImage;

  // Keep the footer dark in both light and dark mode since it's already a dark component
  const footerBgColor = isDarkModeActive ? '#121212' : '#1a1a1a';

  const openingHours = useMemo(() => {
    if (!settings?.openingHours || !footerShowHours) return [];

    return Object.entries(settings.openingHours)
      .filter(([_, hours]) => hours && (hours.open || hours.closed))
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

  return (
    <section
      className="py-20 relative"
      style={{ backgroundColor: footerBgColor }}
    >
      {/* Background image for the footer */}
      <div
        className="absolute top-[250px] right-0 w-[100px] h-[120px] bg-no-repeat bg-cover hidden sm:block"
        style={{ backgroundImage: `url(${footerBgImage})` }}
      ></div>
      <div className="absolute top-[310px] left-[-50px] w-[170px] h-[150px] bg-[url('https://radiustheme.com/demo/wordpress/themes/panpie/wp-content/themes/panpie/assets/element/footer_shape01.png')] bg-no-repeat bg-cover hidden sm:block"></div>
      <div className="flex flex-wrap items-start justify-center sm:justify-around text-center sm:text-start px-6 sm:px-12 lg:px-20 gap-10 sm:gap-20 relative">
        <div className="absolute top-0 right-[30%] w-[170px] h-[150px] bg-[url('https://radiustheme.com/demo/wordpress/themes/panpie/wp-content/themes/panpie/assets/element/footer_shape02.png')] bg-no-repeat bg-cover hidden sm:block"></div>
        <div className="w-full sm:w-auto">
          <img
            src={footerLogo}
            alt={`${footerSiteName} Logo`}
            className="mb-4 mx-auto sm:mx-0 w-[100px]"
            width={250}
            height={100}
          />
          <p className="text-white mb-4 max-w-xs">{footerLocation}</p>
        </div>

        {openingHours.length > 0 && (
          <div className="w-full sm:w-auto">
            <h2 className="text-xl font-bold mb-2 text-white">
              {t('pizzatheme:opening-hours')}
            </h2>
            <ul className="text-gray-600 w-[200px] mx-auto sm:mx-0">
              {openingHours.map(([day, hours]) => (
                <span className="flex items-center justify-between" key={day}>
                  <span className="font-medium text-white">
                    {t(`common:days.${day}`)}
                  </span>
                  <li
                    className={`text-white py-2 ${
                      hours.closed ? 'text-red-500 dark:text-red-400' : ''
                    }`}
                  >
                    {hours.closed
                      ? t('common:closed')
                      : `${hours.open} - ${hours.close}`}
                  </li>
                </span>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="mt-10 text-center text-white px-4">
        <p className="text-white">
          {footerCopyright.replace(
            '{year}',
            new Date().getFullYear().toString()
          )}
        </p>
      </div>
    </section>
  );
}
