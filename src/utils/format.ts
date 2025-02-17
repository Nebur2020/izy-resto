import { Language } from '../types';

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

type LocaleLanguage = 'en-US' | 'fr-FR';

export const localeDateMatch: Record<Language, LocaleLanguage> = {
  en: 'en-US',
  fr: 'fr-FR',
};

export function formatDate(
  date: string,
  local: LocaleLanguage = 'fr-FR'
): string {
  return new Date(date).toLocaleDateString(local, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
