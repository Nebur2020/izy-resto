import { Currency } from '../types';

export const formatNumberByLanguage = (number: number, lang: 'fr-FR') => {
  return new Intl.NumberFormat('fr-FR').format(Number(number));
};

export function formatCurrency(
  amount: number | string | null | undefined,
  currency?: Currency
): string {
  // Handle null/undefined
  if (amount === null || amount === undefined) {
    return '0';
  }

  // Convert string to number if needed
  const numericAmount =
    typeof amount === 'string' ? parseFloat(amount) : amount;

  // Validate the amount is a number
  if (isNaN(numericAmount)) {
    console.error('Invalid amount provided to formatCurrency:', amount);
    return '0';
  }

  const formatNumber = formatNumberByLanguage(
    Number(numericAmount.toFixed(2)),
    'fr-FR'
  );

  switch (currency) {
    case 'EUR':
      if (numericAmount < 0) return `-€${formatNumber.replace('-', '')}`;
      return `€${formatNumber}`;
    case 'CAD':
    case 'USD':
      if (numericAmount < 0) return `-$${formatNumber.replace('-', '')}`;
      return `$${formatNumber}`;
    case 'XOF':
    case 'XAF':
      return `${formatNumber} FCFA`;
    case 'MAD':
      return `${formatNumber} DH`;
    case 'UM':
      return `${formatNumber} MRU`;
    default:
      return currency ? `${formatNumber} ${currency}` : `${formatNumber}`;
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

export type { Currency };
