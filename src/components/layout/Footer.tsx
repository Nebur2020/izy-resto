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
import { Container } from '../ui/Container';
import { useSettings } from '../../hooks/useSettings';
import { SocialMediaProfile } from '../../types/settings';
import packageJson from '../../../package.json';
import { Link } from 'react-router-dom';
import Whatsapp from '../svg/whatsapp';
import Tiktok from '../svg/Tiktok';
import { useTranslation } from 'react-i18next';

interface SocialMediaIconProps {
  profile: SocialMediaProfile;
  color?: string;
}

function SocialMediaIcon({ profile, color = '#fff' }: SocialMediaIconProps) {
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
      className="text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
      aria-label={`${t('visit-us')} ${profile.platform}`}
    >
      <Icon color={color} className="w-7 h-7" />
    </a>
  );
}

type FooterProps = {
  palette?: {
    primary: string;
    secondary: string;
  };
};

export function Footer({
  palette = {
    primary: '#2563EB',
    secondary: '#4D48E5',
  },
}: FooterProps) {
  const { settings } = useSettings();
  const { t } = useTranslation('footer');

  const activeSocialProfiles =
    settings?.socialMedia?.filter(
      profile => profile.active && profile.url.trim()
    ) || [];

  return (
    <footer>
      <div className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 py-8">
        <Container>
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8">
            <div className="text-center md:text-left">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                {t(settings?.name || 'restaurant-name')}
              </h3>

              {activeSocialProfiles.length > 0 && (
                <div className="flex justify-center md:justify-start gap-4 mb-4">
                  {activeSocialProfiles.map(profile => (
                    <SocialMediaIcon
                      color={palette.primary}
                      key={profile.platform}
                      profile={profile}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="text-center md:text-right">
              {settings?.address && (
                <p className="flex items-center justify-center md:justify-end gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span>{t(settings.address)}</span>
                </p>
              )}
              {settings?.phone && (
                <p className="flex items-center justify-center md:justify-end gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <span>{t(settings.phone)}</span>
                </p>
              )}
              {settings?.email && (
                <p className="flex items-center justify-center md:justify-end gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span>{t(settings?.email)}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-end gap-4 mt-4 text-sm">
            <Link
              to={settings?.termsOfService ? '/terms' : '#'}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 flex items-center gap-1"
            >
              <LinkIcon className="w-3 h-3" />
              {t('cgu')}
            </Link>
          </div>
        </Container>
        <Container>
          <div className="flex justify-between items-center md:flex-row flex-col gap-2 mt-4">
            <small>
              {t('all-rights-reserved')} © {new Date().getFullYear()} - AF
            </small>
            <small className="text-center block">v{packageJson.version}</small>
          </div>
        </Container>
      </div>
    </footer>
  );
}
