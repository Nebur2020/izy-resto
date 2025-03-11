import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../../../hooks/useSettings';
import { usePizzaTheme } from './context/PizzaThemeContext';
import {
  Facebook,
  Instagram,
  Twitter,
  MapPin,
  Phone,
  Mail,
  Youtube,
  LinkIcon,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Whatsapp from '../../../components/svg/whatsapp';
import Tiktok from '../../../components/svg/Tiktok';
import packageJson from '../../../../package.json';
import { SocialMediaProfile } from '../../../types/settings';

interface SocialMediaIconProps {
  profile: SocialMediaProfile;
  color?: string;
}

function SocialMediaIcon({ profile, color = 'white' }: SocialMediaIconProps) {
  const icons = {
    facebook: Facebook,
    instagram: Instagram,
    twitter: Twitter,
    youtube: Youtube,
    tiktok: Tiktok,
    whatsapp: Whatsapp,
  };

  const Icon = icons[profile.platform];
  if (!Icon) return null;

  const { t } = useTranslation('footer');

  return (
    <a
      href={
        profile.platform === 'whatsapp'
          ? `https://wa.me/${profile.url}`
              .replace(/\+/g, '')
              .replace(/\s+/g, '')
          : profile.url
      }
      target="_blank"
      rel="noopener noreferrer"
      className={`text-${color} hover:text-yellow-500 transition-colors`}
      aria-label={`${t('visit-us')} ${profile.platform}`}
    >
      <Icon color={color} className="w-7 h-7" />
    </a>
  );
}

interface FooterProps {
  logo?: string;
  siteName?: string;
  location?: string;
  copyrightText?: string;
  showOpeningHours?: boolean;
  backgroundImage?: string;
  isDarkMode?: boolean;
  primaryColor?: string;
}

export default function Footer({
  logo,
  siteName,
  location,
  copyrightText,
  showOpeningHours,
  backgroundImage,
  isDarkMode,
  primaryColor,
}: FooterProps) {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const themeConfig = usePizzaTheme();

  // Default to theme context isDarkMode if not provided as prop
  const isDarkModeActive = isDarkMode;

  // Use props if provided, otherwise fall back to theme context values
  const footerLogo = logo;
  const footerSiteName = siteName || settings?.name || 'Restaurant';
  const footerLocation =
    location || settings?.address || themeConfig.footer.location;
  const footerCopyright = copyrightText || themeConfig.footer.copyrightText;
  const footerShowHours =
    showOpeningHours !== undefined
      ? showOpeningHours
      : themeConfig.footer.showOpeningHours;
  const footerBgImage = backgroundImage || themeConfig.footer.backgroundImage;

  // Keep the footer dark in both light and dark mode since it's already a dark component
  const footerBgColor = isDarkModeActive ? '#121212' : '#1a1a1a';
  const accentColor = primaryColor || '#fcb302';

  // Get active social profiles
  const activeSocialProfiles =
    settings?.socialMedia?.filter(
      profile => profile.active && profile.url.trim()
    ) || [];

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
      className="py-16 relative"
      style={{ backgroundColor: footerBgColor }}
    >
      <div className="container mx-auto">
        <div>
          {/* Background image for the footer */}
          <div
            className="absolute top-[250px] right-0 w-[100px] h-[120px] bg-no-repeat bg-cover hidden sm:block"
            style={{ backgroundImage: `url(${footerBgImage})` }}
          ></div>
          <div className="absolute top-[310px] left-[-50px] w-[170px] h-[150px] bg-[url('https://radiustheme.com/demo/wordpress/themes/panpie/wp-content/themes/panpie/assets/element/footer_shape01.png')] bg-no-repeat bg-cover hidden sm:block"></div>
          <div className="flex flex-wrap items-start justify-center sm:justify-between text-center sm:text-start px-6 sm:px-12 lg:px-20 gap-10 sm:gap-20 relative">
            <div className="absolute top-0 right-[30%] w-[170px] h-[150px] bg-[url('https://radiustheme.com/demo/wordpress/themes/panpie/wp-content/themes/panpie/assets/element/footer_shape02.png')] bg-no-repeat bg-cover hidden sm:block"></div>

            {/* Logo and Address Section */}
            <div className="w-full sm:w-auto max-w-xs">
              <img
                src={footerLogo}
                alt={`${footerSiteName} Logo`}
                className="mb-4 mx-auto sm:mx-0 w-[100px]"
                width={250}
                height={100}
              />
              <h3 className="text-lg font-semibold text-white mb-3">
                {footerSiteName}
              </h3>

              {/* Contact Information */}
              <div className="mb-6">
                {footerLocation && (
                  <p className="flex items-center justify-center sm:justify-start gap-2 text-sm text-white mb-2">
                    <MapPin
                      className="w-4 h-4 flex-shrink-0"
                      style={{ color: accentColor }}
                    />
                    <span className="text-white">{footerLocation}</span>
                  </p>
                )}
                {settings?.phone && (
                  <p className="flex items-center justify-center sm:justify-start gap-2 text-sm text-white mb-2">
                    <Phone
                      className="w-4 h-4 flex-shrink-0"
                      style={{ color: accentColor }}
                    />
                    <span className="text-white">{settings.phone}</span>
                  </p>
                )}
                {settings?.email && (
                  <p className="flex items-center justify-center sm:justify-start gap-2 text-sm text-white dark:text-white">
                    <Mail
                      className="w-4 h-4 flex-shrink-0"
                      style={{ color: accentColor }}
                    />
                    <span>{settings.email}</span>
                  </p>
                )}
              </div>

              {/* Social Media Icons */}
              {activeSocialProfiles.length > 0 && (
                <div className="flex justify-center sm:justify-start gap-4 mb-4">
                  {activeSocialProfiles.map(profile => (
                    <SocialMediaIcon
                      key={profile.platform}
                      profile={profile}
                      color={primaryColor}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Opening Hours Section */}
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

          {/* Terms of Service Link */}
          <div className="flex items-center justify-center gap-4 mt-8 text-sm">
            <Link
              to={settings?.termsOfService ? '/terms' : '#'}
              className="text-white dark:text-white flex items-center gap-1"
            >
              <span className="flex gap-1 items-center ">
                {' '}
                <LinkIcon className="w-3 h-3" />
                {t('footer:cgu')}
              </span>
            </Link>
          </div>

          {/* Copyright Section */}
          <div className="mt-8 text-center text-white px-4">
            <div className="flex justify-center items-center gap-4 mt-4 text-sm text-white">
              <small>
                {footerCopyright
                  ? footerCopyright.replace(
                      '{year}',
                      new Date().getFullYear().toString()
                    )
                  : t('footer:all-rights-reserved')}{' '}
                © {new Date().getFullYear()} - AF
              </small>
              |
              <small className="text-center block">
                v{packageJson.version}
              </small>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
