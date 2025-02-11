import { Timestamp } from 'firebase/firestore';
import { formatDistanceToNow, format } from 'date-fns';
import { enUS, fr } from 'date-fns/locale';
import { Language } from '../types';

export function formatFirestoreTimestamp(
  timestamp: any,
  lang: Language = 'fr'
): string {
  if (!timestamp)
    return lang === 'fr' ? 'Date non disponible' : 'Date not available';

  try {
    let date: Date;

    if (timestamp instanceof Timestamp) {
      date = timestamp.toDate();
    } else if (typeof timestamp === 'string') {
      date = new Date(timestamp);
    } else if (timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else {
      throw new Error('Invalid timestamp format');
    }

    const locale = lang === 'fr' ? fr : enUS;
    return formatDistanceToNow(date, { addSuffix: true, locale });
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return lang === 'fr' ? 'Date non disponible' : 'Date not available';
  }
}

export function formatDate(
  date: any,
  withHours: boolean = false,
  lang: SupportedLocales = 'fr'
): string {
  if (!date)
    return lang === 'fr' ? 'Date non disponible' : 'Date not available';

  try {
    let dateObj: Date;

    if (date instanceof Timestamp) {
      dateObj = date.toDate();
    } else if (typeof date === 'string') {
      dateObj = new Date(date);
    } else if (date.seconds) {
      dateObj = new Date(date.seconds * 1000);
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      throw new Error('Invalid date format');
    }

    const locale = lang === 'fr' ? fr : enUS;

    const formatString = withHours
      ? lang === 'fr'
        ? "dd MMMM yyyy 'à' HH:mm:ss"
        : "dd MMMM yyyy 'at' HH:mm:ss"
      : 'dd MMMM yyyy';

    return format(dateObj, formatString, { locale });
  } catch (error) {
    console.error('Error formatting date:', error);
    return lang === 'fr' ? 'Date non disponible' : 'Date not available';
  }
}
