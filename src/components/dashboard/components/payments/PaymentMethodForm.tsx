import { X } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { useState, useEffect, useMemo } from 'react';
import { Button } from '../../../ui/Button';
import { LogoUploader } from '../../../settings/LogoUploader';
import { paymentService } from '../../../../services/payments/payment.service';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

type PaymentMethodType =
  | 'Wave'
  | 'PayTech'
  | 'Stripe'
  | 'Paiement à la livraison'
  | 'CinetPay'
  | 'Money Fusion'
  | 'Autres';

interface PaymentMethodFormData {
  name: string;
  qrCode: string;
  url: string;
  isDefault: boolean;
  apiKey?: string;
  apiSecret?: string;
  instruction?: string;
}

interface PaymentMethodFormProps {
  method?: PaymentMethodFormData | null;
  onSave: (data: PaymentMethodFormData) => Promise<void>;
  onCancel: () => void;
}

const PAYMENT_TYPES: Record<string, PaymentMethodType> = {
  Wave: 'Wave',
  PayTech: 'PayTech',
  Stripe: 'Stripe',
  CinetPay: 'CinetPay',
  'Money Fusion': 'Money Fusion',
  'Paiement à la livraison': 'Paiement à la livraison',
};

const PaymentTypeSelect = ({
  value,
  onChange,
  disabled,
  t,
}: {
  value: PaymentMethodType;
  onChange: (value: PaymentMethodType) => void;
  disabled?: boolean;
  t: (key: string) => string;
}) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium">
      {t('payment:payment-type')}
    </label>
    <select
      value={value}
      onChange={e => onChange(e.target.value as PaymentMethodType)}
      disabled={disabled}
      className="w-full rounded-lg border dark:border-gray-600 p-2 dark:bg-gray-700"
    >
      {[
        'Paiement à la livraison',
        'CinetPay',
        'PayTech',
        'Stripe',
        'Wave',
        'Money Fusion',
        'Paiement à la caisse',
        'Autres',
      ].map((type, index) => (
        <option key={index} value={type}>
          {t(`order:payment-method-names.${type}`)}
        </option>
      ))}
    </select>
  </div>
);

export function PaymentMethodForm({
  method,
  onSave,
  onCancel,
}: PaymentMethodFormProps) {
  const { t } = useTranslation();

  const [methodType, setMethodType] = useState<PaymentMethodType>(
    PAYMENT_TYPES[`${method?.name}`] ?? 'Autres'
  );

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PaymentMethodFormData>({
    defaultValues: method || {
      name: '',
      qrCode: '',
      url: '',
      isDefault: false,
      apiKey: '',
      apiSecret: '',
      instruction: '',
    },
  });

  const isEditing = useMemo(() => !!method?.name, [method?.name]);

  useEffect(() => {
    if (methodType !== 'Autres' && PAYMENT_TYPES[methodType]) {
      setValue('name', methodType);
    } else if (methodType === 'Autres' && !isEditing) {
      setValue('name', '');
    }
  }, [methodType, setValue, isEditing]);

  const handleFormSubmit = async (data: PaymentMethodFormData) => {
    try {
      const methods = await paymentService.getActivePaymentMethods();
      const nameExists = methods.some(
        m =>
          m.name.toLowerCase() === data.name.toLowerCase() &&
          m.id !== method?.id
      );

      if (nameExists) {
        toast.error(t('payment:payment-methode-with-same-name-already-exist'));
        return;
      }

      await onSave(data);
    } catch (error: any) {
      if (error.code === 'payment/duplicate-name') {
        toast.error(t('payment:methode-with-same-name-already-exist'));
      } else {
        toast.error(t('payment:an-error-occur'));
      }
    }
  };

  const renderPaymentFields = () => {
    switch (methodType) {
      case 'Money Fusion':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">API URL</label>
              <input
                type="url"
                {...register('url', {
                  required: "L'URL de l'API est requise",
                })}
                className="w-full rounded-lg border dark:border-gray-600 p-2 dark:bg-gray-700"
                placeholder="https://api.moneyfusion.com/v1"
              />
              {errors.url && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.url.message}
                </p>
              )}
            </div>
          </div>
        );

      case 'Wave':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('payment:wave-payment-link')}
              </label>
              <input
                type="url"
                {...register('url', {
                  required: t('payment:wave-link-required'),
                })}
                className="w-full rounded-lg border dark:border-gray-600 p-2 dark:bg-gray-700"
                placeholder="https://pay.wave.com/m/xxxxxxxxxxxxxx/c/sn/"
              />
              {errors.url && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.url.message}
                </p>
              )}
              <small className="text-red-800 dark:text-red-400">
                {t('payment:past-merchand-wavepayment-link')}
              </small>
            </div>
          </div>
        );

      case 'PayTech':
      case 'Stripe':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                {methodType === 'Stripe' ? 'PUBLIC KEY' : 'API KEY'}
              </label>
              <input
                type="text"
                {...register('apiKey', {
                  required: 'API key obligatoire',
                })}
                className="w-full rounded-lg border dark:border-gray-600 p-2 dark:bg-gray-700"
                placeholder={
                  methodType === 'Stripe'
                    ? 'pk_live_VePHdqKTYQjKNInc7u56JBrQ'
                    : '1afac858d4fa5ec74e3e3734c3829793eb6bd5f4602c84ac4a5069369812915e'
                }
              />
              {errors.apiKey && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.apiKey.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                {methodType === 'Stripe' ? 'SECRET KEY' : 'API SECRET'}
              </label>
              <input
                type="text"
                {...register('apiSecret', {
                  required: t('common:filed-is-required'),
                })}
                className="w-full rounded-lg border dark:border-gray-600 p-2 dark:bg-gray-700"
                placeholder={
                  methodType === 'Stripe'
                    ? 'sk_live_VePHdqKTYQjKNInc7u56JBrQ'
                    : '96bc36c11560f2151c4b43eee310cefabc2e9e9000f7e315c3ca3d279e3f98ac'
                }
              />
              {errors.apiSecret && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.apiSecret.message}
                </p>
              )}
            </div>
          </div>
        );

      case 'CinetPay':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('payment:site-id')}
              </label>
              <input
                type="text"
                {...register('apiSecret', {
                  required: t('common:filed-is-required'),
                })}
                className="w-full rounded-lg border dark:border-gray-600 p-2 dark:bg-gray-700"
                placeholder="96bc36c11560f2151c4b43eee310cefabc2e9e9000f7e315c3ca3d279e3f98ac"
              />
              {errors.apiSecret && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.apiSecret.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('payment:api-key')}
              </label>
              <input
                type="text"
                {...register('apiKey', {
                  required: t('common:api-key-is-required'),
                })}
                className="w-full rounded-lg border dark:border-gray-600 p-2 dark:bg-gray-700"
                placeholder="1afac858d4fa5ec74e3e3734c3829793eb6bd5f4602c84ac4a5069369812915e"
              />
              {errors.apiKey && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.apiKey.message}
                </p>
              )}
            </div>
          </div>
        );

      case 'Autres':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('payment:methode-name')}
              </label>
              <input
                type="text"
                {...register('name', {
                  required: t('payment:name-is-required'),
                })}
                className="w-full rounded-lg border dark:border-gray-600 p-2 dark:bg-gray-700"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.name.message}
                </p>
              )}
            </div>
            <Controller
              name="qrCode"
              control={control}
              render={({ field }) => (
                <LogoUploader
                  value={field.value}
                  onChange={field.onChange}
                  label={t('payment:payment-qr-code-title')}
                  description={t('payment:recommended-format')}
                />
              )}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-[90vw] max-w-2xl h-[75vh] flex flex-col">
        <div className="flex justify-between items-center p-4 md:p-6 border-b dark:border-gray-700">
          <h2 className="text-lg md:text-xl font-semibold">
            {method
              ? t('payment:update-payment-method')
              : t('payment:new-payment-method')}
          </h2>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
            <PaymentTypeSelect
              value={methodType}
              onChange={setMethodType}
              disabled={isEditing}
              t={t}
            />
            {renderPaymentFields()}
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('payment:instruction-to-user')}
              </label>
              <textarea
                {...register('instruction')}
                rows={2}
                className="w-full rounded-lg border dark:border-gray-600 p-2 dark:bg-gray-700"
                placeholder={t('payment:instruction-placeholder')}
              />
            </div>
          </div>

          <div className="p-4 md:p-6 border-t dark:border-gray-700 mt-auto">
            <div className="flex justify-end gap-4">
              <Button type="button" variant="secondary" onClick={onCancel}>
                {t('common:cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? t('common:saving')
                  : method
                  ? t('common:update')
                  : t('common:add')}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
