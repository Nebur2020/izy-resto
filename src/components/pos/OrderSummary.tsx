import { Receipt } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';
import { useSettings } from '../../hooks/useSettings';
import { useServerCart } from '../../context/ServerCartContext';
import { formatTaxRate } from '../../utils/tax';
import { useTranslation } from 'react-i18next';

export function OrderSummary() {
  const { t } = useTranslation();
  const { settings } = useSettings();

  const { subtotal, taxes, tip, total, setTipPercentage, cart } =
    useServerCart();

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Receipt className="w-5 h-5 text-gray-500" />
        <h3 className="font-medium">{t('common:cart-summary')}</h3>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            {totalItems}{' '}
            {totalItems > 1 ? t('common:cart-items') : t('common:cart-item')}
          </span>
          <span className="font-medium">
            {formatCurrency(total, settings?.currency)}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>
            {t('cart:sub-total')}
          </span>
          <span>{formatCurrency(subtotal, settings?.currency)}</span>
        </div>

        {taxes.map(tax => (
          <div
            key={tax.id}
            className="flex justify-between text-sm text-gray-600 dark:text-gray-400"
          >
            <span>
              {tax.name} ({formatTaxRate(tax.rate)})
            </span>
            <span>{formatCurrency(tax.amount, settings?.currency)}</span>
          </div>
        ))}

        {settings?.tips.enabled && (
          <div className="pt-2 border-t dark:border-gray-700">
            <span className="mb-2 block">{settings.tips.label}</span>
            <div className="flex flex-wrap gap-2 mb-2">
              {settings?.tips?.defaultPercentages
                .map(Number)
                ?.map(percentage => (
                  <button
                    key={percentage}
                    onClick={() => setTipPercentage(percentage)}
                    className={`
                                    px-3 py-1 text-sm rounded-full transition-colors
                                    ${
                                      tip?.percentage === percentage
                                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                    }
                                  `}
                  >
                    {percentage}%
                  </button>
                ))}
              <button
                onClick={() => setTipPercentage(null)}
                className="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
              >
                {t('common:no-tip')}
              </button>
            </div>

            {tip && (
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>
                  {t('common:total')} {settings.tips.label} ({tip.percentage}%)
                </span>
                <span>{formatCurrency(tip.amount, settings?.currency)}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
