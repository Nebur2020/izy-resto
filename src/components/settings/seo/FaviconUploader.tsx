import { LogoUploader } from '../../settings/LogoUploader';
import { useTranslation } from 'react-i18next';

interface FaviconUploaderProps {
  value?: string;
  onChange: (url: string) => void;
}

export function FaviconUploader({ value, onChange }: FaviconUploaderProps) {
  const { t } = useTranslation();
  return (
    <LogoUploader
      value={value}
      onChange={onChange}
      label="Favicon"
      description={t('settingSeo:favicon-description')}
    />
  );
}