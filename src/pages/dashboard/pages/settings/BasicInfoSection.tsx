import { UseFormRegister, UseFormWatch } from 'react-hook-form';
import { Building2 } from 'lucide-react';
import { RestaurantSettings } from '../../../../types';
import { LogoUploader } from '../../../../components/settings/LogoUploader';
import { allCurrencies } from '../../../../constants/defaultSettings';

interface BasicInfoSectionProps {
  register: UseFormRegister<RestaurantSettings>;
  watch: UseFormWatch<RestaurantSettings>;
  setValue: (name: keyof RestaurantSettings, value: any) => void;
}

export function BasicInfoSection({
  register,
  watch,
  setValue,
}: BasicInfoSectionProps) {
  const currency = watch('currency');
  const currencyObject = allCurrencies.find(cur => cur.value === currency);

  return (
    <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <h2 className="text-xl font-semibold">Informations du Restaurant</h2>
      </div>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">
            Nom du Restaurant
          </label>
          <input
            type="text"
            {...register('name', { required: true })}
            className="w-full rounded-lg border dark:border-gray-600 p-2 dark:bg-gray-700"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            {...register('description', {
              required: true,
            })}
            rows={3}
            className="w-full rounded-lg border dark:border-gray-600 p-2 dark:bg-gray-700"
          />
        </div>
        <div>
          <LogoUploader
            value={watch('logo')}
            onChange={url => setValue('logo', url)}
          />
        </div>

        <div>
          <LogoUploader
            value={watch('coverImage')}
            onChange={url => setValue('coverImage', url)}
            label="Image de Couverture"
            description="Format recommandé: JPG ou PNG en haute résolution (1920x1080px minimum)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Devise</label>
          <select
            {...register('currency')}
            className="w-full rounded-lg border dark:border-gray-600 p-2 dark:bg-gray-700"
          >
            {allCurrencies.map(currency => (
              <option key={currency.value} value={currency.value}>
                {currency.label}
              </option>
            ))}
          </select>
          {currencyObject?.infos && (
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
              <span className="sr-only">Info</span>
              <div>{currencyObject.infos}</div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
