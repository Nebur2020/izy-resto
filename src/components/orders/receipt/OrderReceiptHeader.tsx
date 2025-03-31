import { CheckCircle, XCircle } from 'lucide-react';
import { OrderStatus } from '../../../types';
import { useTranslation } from 'react-i18next';

interface OrderReceiptHeaderProps {
  status: OrderStatus;
}

export function OrderReceiptHeader({ status }: OrderReceiptHeaderProps) {
  const isCancelled = status === 'cancelled';
  const { t } = useTranslation('order');

  return (
    <div
      className={`p-6 sm:p-8 text-white rounded-t-lg ${
        isCancelled
          ? 'bg-red-600'
          : 'bg-gradient-to-r from-emerald-500 to-green-600'
      }`}
    >
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div
          className={`p-3 sm:p-4 rounded-full ${
            isCancelled ? 'bg-red-800' : 'bg-white/30'
          }`}
        >
          {isCancelled ? (
            <XCircle className="w-8 h-8 sm:w-10 sm:h-10" />
          ) : (
            <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10" />
          )}
        </div>
        <div>
          <h1 className="text-xl sm:text-3xl font-bold mb-2">
            {isCancelled ? t('order-cancel') : t('order-confirm')} shdb
          </h1>
          <p className="text-white/80">
            {isCancelled
              ? t('this-order-is-cancelled')
              : t('this-order-is-confirmed')} szdhbx
          </p>
        </div>
      </div>
    </div>
  );
}
