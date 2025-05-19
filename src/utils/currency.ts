import { Currency } from '../types';

export const formatNumberByLanguage = (number: number, lang: 'fr-FR') => {
  return new Intl.NumberFormat(lang)
    .format(Number(number))
    .replace(/\u202F/g, ' ');
};

export function formatCurrency(
  amount: number | string | null | undefined,
  currency?: Currency
): string {
  if (amount === null || amount === undefined) {
    return '0';
  }

  let numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numericAmount)) {
    console.error('Invalid amount provided to formatCurrency:', amount);
    return '0';
  }

  // Apply reasonable limits to currency values
  if (numericAmount > 1000000) {
    console.warn('Very large currency value detected:', numericAmount);
    numericAmount = Math.min(numericAmount, 1000000);
  } else if (numericAmount < -1000000) {
    console.warn('Very small currency value detected:', numericAmount);
    numericAmount = Math.max(numericAmount, -1000000);
  }

  const formattedNumber = formatNumberByLanguage(
    Number(numericAmount.toFixed(2)),
    'fr-FR'
  );

  switch (currency) {
    case 'EUR':
      return numericAmount < 0
        ? `-€${formattedNumber.replace('-', '')}`
        : `€${formattedNumber}`;
    case 'CAD':
    case 'USD':
      return numericAmount < 0
        ? `-$${formattedNumber.replace('-', '')}`
        : `$${formattedNumber}`;
    case 'XOF':
    case 'XAF':
      return `${formattedNumber} FCFA`;
    case 'MAD':
      return `${formattedNumber} DH`;
    case 'UM':
      return `${formattedNumber} MRU`;
    default:
      return currency ? `${formattedNumber} ${currency}` : formattedNumber;
  }
}

export function getCurrencyStep(currency?: Currency): string {
  return currency === 'XOF' ? '1' : '0.01';
}

export function getQuickAmounts(currency?: Currency): number[] {
  switch (currency) {
    case 'XOF':
      return [5000, 10000, 20000, 30000];
    case 'EUR':
      return [10, 20, 50, 100];
    default:
      return [10, 20, 50, 100];
  }
}
