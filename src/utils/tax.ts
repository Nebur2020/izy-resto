import { TaxRate } from '../types/settings';

/**
 * Calculate tax amount for a single tax rate
 */
export function calculateTaxAmount(subtotal: number, rate: number): number {
  return (subtotal * (rate / 100) * 100) / 100;
}

/**
 * Calculate all applicable taxes for an order
 */
export function calculateTaxes(
  subtotal: number,
  taxRates: TaxRate[],
  categoryIds?: string[]
): {
  taxes: { id: string; name: string; rate: number; amount: number }[];
  total: number;
} {
  const applicableTaxes = taxRates
    .filter(
      tax =>
        tax.enabled &&
        (tax.appliesTo === 'all' ||
          (categoryIds && categoryIds.includes(tax.appliesTo)))
    )
    .sort((a, b) => a.order - b.order);

  let runningTotal = subtotal;
  const taxes = [];

  for (const tax of applicableTaxes) {
    const amount = calculateTaxAmount(runningTotal, tax.rate);
    taxes.push({
      id: tax.id,
      name: tax.name,
      rate: tax.rate,
      amount,
    });
    // Some taxes might be calculated on top of previous taxes
    runningTotal += amount;
  }

  const totalTax = taxes.reduce((sum, tax) => sum + tax.amount, 0);

  return {
    taxes,
    total: totalTax,
  };
}

/**
 * Calculate price without tax (when tax is included in price)
 */
export function calculatePriceWithoutTaxes(
  priceWithTax: number,
  taxRates: TaxRate[],
  categoryIds?: string[]
): number {
  const applicableTaxes = taxRates
    .filter(
      tax =>
        tax.enabled &&
        (tax.appliesTo === 'all' ||
          (categoryIds && categoryIds.includes(tax.appliesTo)))
    )
    .sort((a, b) => a.order - b.order);

  let totalRate = applicableTaxes.reduce((sum, tax) => sum + tax.rate, 0);
  return Math.round((priceWithTax / (1 + totalRate / 100)) * 100) / 100;
}

/**
 * Format tax rate with percentage
 */
export function formatTaxRate(rate: number): string {
  return `${Number(rate).toFixed(3)}%`;
}

/**
 * Calculate tip amount based on subtotal and percentage
 */
export function calculateTip(subtotal: number, percentage: number): number {
  return Math.round(subtotal * (percentage / 100) * 100) / 100;
}

/**
 * Calculate total with taxes and tip
 */
export function calculateTotal(
  subtotal: number,
  taxTotal: number,
  tip: number = 0
): number {
  return Math.round((subtotal + taxTotal + tip) * 100) / 100;
}
