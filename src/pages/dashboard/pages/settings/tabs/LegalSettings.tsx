import { FileText } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { RestaurantSettings } from '../../../../../types/settings';
import { useTranslation } from 'react-i18next';

export function LegalSettings() {
  const { t } = useTranslation();
  const { register } = useFormContext<RestaurantSettings>();

  return (
    <div className="space-y-8">
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-xl font-semibold">
            {t('settingLegal:legal-settings-title')}
          </h2>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('settingLegal:terms-of-service')}
            </label>
            <textarea
              {...register('termsOfService')}
              rows={15}
              className="w-full rounded-lg border dark:border-gray-600 p-4 dark:bg-gray-700 font-mono text-sm"
              placeholder={t('settingLegal:terms-of-service-placeholder')}
            />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {t('settingLegal:terms-of-service-description')}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
