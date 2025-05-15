import { SocialMediaProfile } from '../../types';
import { Facebook, Instagram, Twitter, Youtube, LinkIcon } from 'lucide-react';
import Whatsapp from '../svg/whatsapp';
import Tiktok from '../svg/Tiktok';
import { useTranslation } from 'react-i18next';
interface SocialMediaIconProps {
  profile: SocialMediaProfile;
  color?: string;
}

export function SocialMediaIcon({
  profile,
  color = 'white',
}: SocialMediaIconProps) {
  const icons = {
    facebook: Facebook,
    instagram: Instagram,
    twitter: Twitter,
    youtube: Youtube,
    tiktok: Tiktok,
    whatsapp: Whatsapp,
    linkedin: LinkIcon,
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
