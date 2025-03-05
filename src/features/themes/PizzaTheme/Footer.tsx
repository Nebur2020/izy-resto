import React from 'react';
import { useSettings } from '../../../hooks/useSettings';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();
  const { settings } = useSettings();

  const openingHours = React.useMemo(() => {
    if (!settings?.openingHours) return [];

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
  }, [settings?.openingHours]);

  return (
    <section className="bg-[#1a1a1a] py-20 relative">
      <div className="absolute top-[250px] right-0 w-[100px] h-[120px] bg-[url('https://radiustheme.com/demo/wordpress/themes/panpie/wp-content/themes/panpie/assets/element/footer_shape03.png')] bg-no-repeat bg-cover hidden sm:block"></div>
      <div className="absolute top-[310px] left-[-50px] w-[170px] h-[150px] bg-[url('https://radiustheme.com/demo/wordpress/themes/panpie/wp-content/themes/panpie/assets/element/footer_shape01.png')] bg-no-repeat bg-cover hidden sm:block"></div>
      <div className="flex flex-wrap items-start justify-center sm:justify-around text-center sm:text-start px-6 sm:px-12 lg:px-20 gap-10 sm:gap-20 relative">
        <div className="absolute top-0 right-[30%] w-[170px] h-[150px] bg-[url('https://radiustheme.com/demo/wordpress/themes/panpie/wp-content/themes/panpie/assets/element/footer_shape02.png')] bg-no-repeat bg-cover hidden sm:block"></div>
        <div className="w-full sm:w-auto">
          <img
            src={
              (settings && settings.logo) ||
              'https://radiustheme.com/demo/wordpress/themes/panpie/wp-content/uploads/2021/03/logo.png'
            }
            alt="Pample Logo"
            className="mb-4 mx-auto sm:mx-0"
            width={250}
            height={100}
          />
          <p className="text-white mb-4 max-w-xs">
            {settings && settings.address}
          </p>
        </div>
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
                  key={day}
                  className={`text-white py-2 ${
                    hours.closed ? 'text-red-500 dark:text-red-400' : ''
                  }`}
                >
                  {hours.closed ? 'Fermé' : `${hours.open} - ${hours.close}`}
                </li>
              </span>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-10 text-center text-white px-4">
        <p className="text-white">
          &copy; {new Date().getFullYear()} {settings && settings.name}.{' '}
          {t('pizzatheme:all-right-reserved')}
        </p>
      </div>
    </section>
  );
}
