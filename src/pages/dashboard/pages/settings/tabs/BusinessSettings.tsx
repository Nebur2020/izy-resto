import { useEffect } from 'react';
import { Calendar, Clock, Globe, Truck } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { timezones } from '../../../../../constants/timezones';
import { useTranslation } from 'react-i18next';

const ErrorAlert = ({ message }: { message: string }) => (
  <div
    className="border border-red-400 text-red-700 px-4 py-3 rounded relative"
    role="alert"
  >
    <span className="block sm:inline">{message}</span>
  </div>
);

export function BusinessSettings() {
  const { t } = useTranslation();
  const {
    register,
    watch,
    formState: { errors },
    setError,
    clearErrors,
  } = useFormContext();

  const canDeliver = watch('canDeliver');
  const canDineIn = watch('canDineIn');
  const hasOpeningHours = watch('hasOpeningHours');

  useEffect(() => {
    if (!canDeliver && !canDineIn) {
      setError('serviceOptions', {
        type: 'custom',
        message: 'Au moins une option de service doit être activée',
      });
    } else {
      clearErrors('serviceOptions');
    }
  }, [canDeliver, canDineIn, setError, clearErrors]);

  const days = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ];

  const dayNames = {
    monday: t('common:days.monday'),
    tuesday: t('common:days.tuesday'),
    wednesday: t('common:days.wednesday'),
    thursday: t('common:days.thursday'),
    friday: t('common:days.friday'),
    saturday: t('common:days.saturday'),
    sunday: t('common:days.sunday'),
  };

  return (
    <div className="space-y-8">
      {errors.serviceOptions && (
        <ErrorAlert message={errors.serviceOptions.message} />
      )}

      {/* Contact Information */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-xl font-semibold">
            {t('settingBusiness:contact-information')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">
              {t('common:address')}
            </label>
            <input
              type="text"
              {...register('address', { required: true })}
              className="w-full rounded-lg border dark:border-gray-600 p-2 dark:bg-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {t('common:phone')}
            </label>
            <input
              type="tel"
              {...register('phone', { required: true })}
              className="w-full rounded-lg border dark:border-gray-600 p-2 dark:bg-gray-700"
            />
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-xl font-semibold">
            {t('settingBusiness:business-hours')}
          </h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register('holidayClosure.enabled')}
              className="rounded border-gray-300 dark:border-gray-600"
            />
            <label className="text-sm font-medium">
              {t('settingBusiness:enable-holiday-closure')}
            </label>
          </div>

          {watch('holidayClosure.enabled') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t('settingBusiness:start-date')}
                </label>
                <input
                  type="date"
                  {...register('holidayClosure.startDate')}
                  className="w-full rounded-lg border dark:border-gray-600 p-2 dark:bg-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  {t('settingBusiness:end-date')}
                </label>
                <input
                  type="date"
                  {...register('holidayClosure.endDate')}
                  className="w-full rounded-lg border dark:border-gray-600 p-2 dark:bg-gray-700"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  {t('settingBusiness:reason')}
                </label>
                <input
                  type="text"
                  {...register('holidayClosure.reason')}
                  placeholder={t('settingBusiness:reason-placeholder')}
                  className="w-full rounded-lg border dark:border-gray-600 p-2 dark:bg-gray-700"
                />
              </div>
            </div>
          )}
        </div>
      </section>

      <section>
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">
            {t('settingBusiness:time-zone')}{' '}
            <span className="text-red-500">*</span>
          </label>
          <select
            {...register('openingHours.timezone', {
              required: t('settingBusiness:time-zone-required'),
            })}
            className="w-full rounded-lg border dark:border-gray-600 p-2 dark:bg-gray-700"
          >
            <option value="">{t('settingBusiness:select-time-zone')}</option>
            {timezones.map(tz => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-sm text-gray-500">
            {t('settingBusiness:time-zone-description')}
          </p>
        </div>
      </section>
      <section className="space-y-6">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold">
              {t('settingBusiness:opening-hours')}
            </h2>
          </div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              {...register('hasOpeningHours')}
              className="rounded border-gray-300 dark:border-gray-600"
            />
            <span>
              {hasOpeningHours
                ? `(${t('common:Actif')})`
                : `(${t('common:Inactif')})`}
            </span>
          </label>
        </div>

        {hasOpeningHours && (
          <>
            <div className="space-y-4">
              {days.map(day => (
                <div key={day} className="flex items-center space-x-4">
                  <span className="w-32">{dayNames[day]}</span>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      {...register(`openingHours.${day}.closed`)}
                      className="rounded border-gray-300 dark:border-gray-600"
                    />
                    <span>{t('settingBusiness:closed')} </span>
                  </label>
                  {!watch(`openingHours.${day}.closed`) && (
                    <>
                      <input
                        type="time"
                        {...register(`openingHours.${day}.open`)}
                        className="rounded-lg border dark:border-gray-600 p-2 dark:bg-gray-700"
                      />
                      <span>{t('settingBusiness:to')} </span>
                      <input
                        type="time"
                        {...register(`openingHours.${day}.close`)}
                        className="rounded-lg border dark:border-gray-600 p-2 dark:bg-gray-700"
                      />
                    </>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </section>
      <div className="space-y-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
        <h3 className="font-medium text-lg">
          {t('settingBusiness:service-options')}
        </h3>

        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <Truck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                {...register('canDeliver')}
                className="rounded border-gray-300 dark:border-gray-600"
              />
              <span>
                {t('common:delivery')}{' '}
                {canDeliver
                  ? `(${t('common:Actif')})`
                  : `(${t('common:Inactif')})`}
              </span>
            </label>
          </div>

          <div className="flex items-center gap-3">
            <Truck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                {...register('canDineIn')}
                className="rounded border-gray-300 dark:border-gray-600"
              />
              <span>
                {t('common:on-site')}{' '}
                {canDineIn
                  ? `(${t('common:Actif')})`
                  : `(${t('common:Inactif')})`}
              </span>
            </label>
          </div>

          {canDineIn && (
            <div className="flex items-center gap-3 ml-8">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  {...register('paymentOnDineInActivated')}
                  className="rounded border-gray-300 dark:border-gray-600"
                />
                <span>{t('settingBusiness:payment-on-dine-in')} </span>
              </label>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default BusinessSettings;
