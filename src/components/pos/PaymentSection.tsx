import { Calculator } from 'lucide-react';
import { useSettings } from '../../hooks/useSettings';
import { formatCurrency, getCurrencyStep } from '../../utils/currency';
import { useTranslation } from 'react-i18next';

interface PaymentSectionProps {
  total: number;
  amountPaid: number;
  onAmountPaidChange: (amount: number) => void;
  onQuickAmount: (amount: number) => void;
}

export function PaymentSection({
  total,
  amountPaid,
  onAmountPaidChange,
}: PaymentSectionProps) {
  const { t } = useTranslation('common');
  const { settings } = useSettings();
  const change = amountPaid - total;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Calculator className="w-5 h-5 text-gray-500" />
        <h3 className="font-medium">{t('cart-details')}</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            {t('amount-received')}
          </label>
          <input
            type="number"
            onChange={e => onAmountPaidChange(parseFloat(e.target.value) || 0)}
            className="w-full rounded-lg border dark:border-gray-700 p-2"
            min={0}
            step={getCurrencyStep(settings?.currency)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            {t('amount-due')}
          </label>
          <div
            className={`w-full rounded-lg p-2 font-mono text-lg ${
              change >= 0 ? '!text-green-600' : '!text-red-600'
            }`}
          >
            <span
              className={`${change >= 0 ? 'text-green-600' : 'text-red-600'}`}
            >
              {formatCurrency(change < 0 ? 0 : change, settings?.currency)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
