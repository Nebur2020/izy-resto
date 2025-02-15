import { Building2, Shield } from 'lucide-react';
import { LogoUploader } from '../../../../../components/settings/LogoUploader';
import { useFormContext } from 'react-hook-form';
import { RestaurantSettings } from '../../../../../types';
import { SocialMediaSettings } from './SocialMediaSettings';
import { allCurrencies } from '../../../../../constants/defaultSettings';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';

export function GeneralSettings() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<RestaurantSettings>();

  const handleFieldChange = (
    field: 'logo' | 'coverImage' | 'language',
    value: string
  ) => {
    setValue(field, value, {
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  const currency = watch('currency');
  const currencyObject = allCurrencies.find(cur => cur.value === currency);

  const { t } = useTranslation('common');

  return (
    <div className="space-y-8">
      <section className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-xl font-semibold">Informations Générales</h2>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">
              Nom du Restaurant
            </label>
            <input
              type="text"
              {...register('name', {
                required: 'Le nom du restaurant est requis',
              })}
              className={`w-full rounded-lg border p-2 dark:bg-gray-700 ${
                errors.name
                  ? 'border-red-500 dark:border-red-500'
                  : 'dark:border-gray-600'
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              {...register('description', {
                required: 'La description est requise',
                maxLength: {
                  value: 250,
                  message: t('description-max-limit', {
                    maxLimit: 250,
                  }),
                },
                minLength: {
                  value: 10,
                  message: t('description-min-limit', { minLimit: 10 }),
                },
              })}
              rows={3}
              className={`w-full rounded-lg border p-2 dark:bg-gray-700 ${
                errors.description
                  ? 'border-red-500 dark:border-red-500'
                  : 'dark:border-gray-600'
              }`}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              {...register('email', {
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Adresse email invalide',
                },
              })}
              className={`w-full rounded-lg border p-2 dark:bg-gray-700 ${
                errors.email
                  ? 'border-red-500 dark:border-red-500'
                  : 'dark:border-gray-600'
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <LogoUploader
              value={watch('logo')}
              onChange={url => handleFieldChange('logo', url)}
            />
          </div>

          <div>
            <LogoUploader
              value={watch('coverImage')}
              onChange={url => handleFieldChange('coverImage', url)}
              label="Image de Couverture"
              description="Format recommandé: JPG ou PNG en haute résolution (1920x1080px minimum)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Devise</label>
            <select
              {...register('currency', {
                required: 'La devise est requise',
              })}
              className={`w-full rounded-lg border p-2 dark:bg-gray-700 ${
                errors.currency
                  ? 'border-red-500 dark:border-red-500'
                  : 'dark:border-gray-600'
              }`}
            >
              {allCurrencies.map(currency => (
                <option key={currency.value} value={currency.value}>
                  {currency.label}
                </option>
              ))}
            </select>
            {errors.currency && (
              <p className="mt-1 text-sm text-red-500">
                {errors.currency.message}
              </p>
            )}

            <div
              className="flex mt-4 items-center p-4 mb-4 text-sm text-yellow-800 border border-yellow-300 rounded-lg bg-yellow-50 dark:bg-gray-800 dark:text-yellow-300 dark:border-yellow-800"
              role="alert"
            >
              <svg
                className="flex-shrink-0 inline w-4 h-4 me-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
              </svg>
              {currencyObject &&
                (currencyObject?.acceptedPaymentMethods?.length < 1 ? (
                  <span>
                    Moyen de payment disponibles:{' '}
                    <span className="font-semibold">
                      Livraison et autres moyens ajoutés personnellement
                    </span>
                  </span>
                ) : (
                  <span>
                    Moyen de payment disponibles:{' '}
                    <span className="font-semibold">
                      {currencyObject?.acceptedPaymentMethods.join(', ')}{' '}
                    </span>
                  </span>
                ))}
            </div>
          </div>

          <LanguageSwitcher
            value={watch('language')}
            onLanguageChanged={language =>
              handleFieldChange('language', language)
            }
          />
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-xl font-semibold">Limites de commande</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">
              Nombre maximum de commandes
            </label>
            <input
              type="number"
              {...register('rateLimits.maxOrders', {
                required: 'Ce champ est requis',
                min: {
                  value: 1,
                  message: 'La valeur minimum est 1',
                },
              })}
              className={`w-full rounded-lg border p-2 dark:bg-gray-700 ${
                errors.rateLimits?.maxOrders
                  ? 'border-red-500 dark:border-red-500'
                  : 'dark:border-gray-600'
              }`}
            />
            {errors.rateLimits?.maxOrders && (
              <p className="mt-1 text-sm text-red-500">
                {errors.rateLimits.maxOrders.message}
              </p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Nombre maximum de commandes par période
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Période (en heures)
            </label>
            <input
              type="number"
              {...register('rateLimits.timeWindowHours', {
                required: 'Ce champ est requis',
                min: {
                  value: 1,
                  message: 'La valeur minimum est 1',
                },
              })}
              className={`w-full rounded-lg border p-2 dark:bg-gray-700 ${
                errors.rateLimits?.timeWindowHours
                  ? 'border-red-500 dark:border-red-500'
                  : 'dark:border-gray-600'
              }`}
            />
            {errors.rateLimits?.timeWindowHours && (
              <p className="mt-1 text-sm text-red-500">
                {errors.rateLimits.timeWindowHours.message}
              </p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Durée de la période de limitation
            </p>
          </div>
        </div>
      </section>

      <SocialMediaSettings />
    </div>
  );
}
