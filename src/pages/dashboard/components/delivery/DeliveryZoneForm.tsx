import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Currency, DeliveryZone } from '../../../../types';
import { Button } from '../../../../components/ui';
import { useTranslation } from 'react-i18next';

interface IDeliveryZoneFormProps {
  zone?: DeliveryZone | null;
  onSave: (data: Omit<DeliveryZone, 'id'>) => void;
  onCancel: () => void;
  currency?: Currency;
}

export function DeliveryZoneForm(props: IDeliveryZoneFormProps) {
  const { zone, onSave, onCancel, currency } = props;
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Omit<DeliveryZone, 'id'>>({
    defaultValues: zone || {
      name: '',
      description: '',
      price: 0,
      active: true,
    },
  });

  const onSubmit = (data: Omit<DeliveryZone, 'id'>) => {
    onSave(data);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold">
            {zone ? t("settingDelivery:update-zone") : t('settingDelivery:add-new-zone')}
          </h2>
          <button onClick={onCancel}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
             {t('settingDelivery:zone-name')}
            </label>
            <input
              type="text"
              {...register('name', { required: t("common:name-required") })}
              className="w-full rounded-lg border dark:border-gray-600 p-2 dark:bg-gray-700"
              placeholder={t('settingDelivery:zone-name-placeholder')}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {t('common:description')}
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full rounded-lg border dark:border-gray-600 p-2 dark:bg-gray-700"
              placeholder={t('settingDelivery:zone-description-placeholder')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
             {t('settingDelivery:delivery-price')}
            </label>
            <div className="relative">
              <input
                type="number"
                step={currency === 'XOF' ? '1' : '0.01'}
                {...register('price', {
                  required: t("common:price-required"),
                  min: { value: 0, message: t("common:price-min") },
                })}
                className="w-full rounded-lg border dark:border-gray-600 p-2 dark:bg-gray-700"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                {currency}
              </span>
            </div>
            {errors.price && (
              <p className="mt-1 text-sm text-red-500">
                {errors.price.message}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="secondary" onClick={onCancel}>
              {t('common:cancel')}
            </Button>
            <Button type="button" onClick={handleSubmit(onSubmit)} className='!text-gray-900'>
              {zone ? t("common:update") : t('common:add')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
