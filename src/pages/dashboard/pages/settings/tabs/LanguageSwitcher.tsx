import { ChangeEvent, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Language } from '../../../../../types';

type LanguageSwitcherProps = {
  onLanguageChanged?: (language: Language) => void;
  value?: Language;
};

export default function LanguageSwitcher({
  onLanguageChanged,
  value = 'fr',
}: LanguageSwitcherProps) {
  const { t, i18n } = useTranslation();

  const [selectedLanguage, setSelectedLanguage] = useState<Language>(
    (i18n.language as Language) || value
  );

  useEffect(() => {
    i18n.changeLanguage(selectedLanguage);
  }, [selectedLanguage, i18n]);

  const handleChangeLanguage = (event: ChangeEvent<HTMLSelectElement>) => {
    const newLang = event.target.value as Language;
    setSelectedLanguage(newLang);
    i18n.changeLanguage(newLang);
    onLanguageChanged && onLanguageChanged(newLang);
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-1">{t('language')}</label>
      <select
        name="language"
        value={selectedLanguage}
        onChange={handleChangeLanguage}
        className="w-full rounded-lg border p-2 dark:bg-gray-700 dark:border-gray-600"
      >
        <option value="fr">🇫🇷 Français</option>
        <option value="en">🇬🇧 English</option>
      </select>
    </div>
  );
}
