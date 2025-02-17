import { Globe, Search, Share2 } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { RestaurantSettings } from '../../../../../types/settings';
import { FaviconUploader } from '../../../../../components/settings/seo/FaviconUploader';
import { KeywordsInput } from '../../../../../components/settings/seo/KeywordsInput';
import { LogoUploader } from '../../../../../components/settings/LogoUploader';
import { useSEOUpdater } from '../../../../../hooks/useSEOUpdater';
import { useTranslation } from 'react-i18next';

export function SEOSettings() {
  const { t } = useTranslation();
  const { register, watch, setValue } = useFormContext<RestaurantSettings>();
  
  useSEOUpdater(watch('seo.title'), watch('seo.favicon'));

  return (
    <div className="space-y-8">
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <Search className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-xl font-semibold">
            {t('settingSeo:seo-settings-title')}
          </h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              {t('settingSeo:seo-title')}
            </label>
            <input
              type="text"
              {...register('seo.title')}
              className="w-full rounded-lg border dark:border-gray-600 p-2 dark:bg-gray-700"
              placeholder={t('settingSeo:seo-title-placeholder')}
            />
            <p className="mt-1 text-sm text-gray-500">
              {t('settingSeo:seo-title-description')}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {t('common:description')}
            </label>
            <textarea
              {...register('seo.description')}
              rows={3}
              className="w-full rounded-lg border dark:border-gray-600 p-2 dark:bg-gray-700"
              placeholder={t('settingSeo:seo-description-placeholder')}
            />
            <p className="mt-1 text-sm text-gray-500">
              {t('settingSeo:seo-description-description')}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {t('settingSeo:seo-keywords')}
            </label>
            <KeywordsInput
              value={watch('seo.keywords') || []}
              onChange={(keywords) => setValue('seo.keywords', keywords, { shouldDirty: true })}
            />
            <p className="mt-1 text-sm text-gray-500">
             {t('settingSeo:seo-keywords-description')}
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-xl font-semibold">
            {t('settingSeo:seo-images-title')}
          </h2>
        </div>

        <div className="space-y-6">
          <FaviconUploader
            value={watch('seo.favicon')}
            onChange={(url) => setValue('seo.favicon', url, { shouldDirty: true })}
          />

          <div>
            <LogoUploader
              value={watch('seo.ogImage')}
              onChange={(url) => setValue('seo.ogImage', url, { shouldDirty: true })}
              label={t('settingSeo:seo-og-image')}
              description={t('settingSeo:seo-og-image-description')}
            />
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <Share2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-xl font-semibold">
            {t('settingSeo:seo-social-title')}
          </h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              {t('settingSeo:seo-twitter-handle')}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">@</span>
              <input
                type="text"
                {...register('seo.twitterHandle')}
                className="w-full rounded-lg border dark:border-gray-600 p-2 pl-8 dark:bg-gray-700"
                placeholder="username"
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {t('settingSeo:seo-twitter-handle-description')}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {t('settingSeo:seo-facebook-page')}
            </label>
            <input
              type="text"
              {...register('seo.googleSiteVerification')}
              className="w-full rounded-lg border dark:border-gray-600 p-2 dark:bg-gray-700"
              placeholder={t('settingSeo:seo-facebook-page-placeholder')}
            />
            <p className="mt-1 text-sm text-gray-500">
              {t('settingSeo:seo-facebook-page-description')}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}