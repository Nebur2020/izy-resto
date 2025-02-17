import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { motion } from 'framer-motion';
import { RestaurantSettings } from '../../../types';
import { useSettings } from '../../../hooks/useSettings';
import { Tabs } from '../../../components/ui/Tabs';
import {
  GeneralSettings,
  AppearanceSettings,
  BusinessSettings,
  IntegrationSettings,
  SEOSettings,
  DataManagement,
  LegalSettings,
  TaxSettings,
  DeliverySettings,
} from './settings/tabs';

import toast from 'react-hot-toast';

import { useTranslation } from 'react-i18next';

export function Settings() {
  const { t } = useTranslation();
  const { settings, updateSettings, isLoading } = useSettings();
  const [activeTab, setActiveTab] = React.useState('general');
  const methods = useForm<RestaurantSettings>({
    defaultValues: settings || {},
  });

  const {
    handleSubmit,
    formState: { isSubmitting, isDirty },
    reset,
  } = methods;

  const tabs = [
    { id: 'general', label: t('setting:general') },
    { id: 'appearance', label: t('setting:appearance') },
    { id: 'business', label: t('setting:business') },
    { id: 'tax', label: t('setting:tax') },
    { id: 'delivery', label: t('setting:delivery') },
    { id: 'seo', label: t('setting:seo') },
    { id: 'legal', label: t('setting:legal') },
    { id: 'integrations', label: t('setting:integrations') },
    { id: 'data', label: t('setting:data') },
  ];

  React.useEffect(() => {
    if (settings) {
      reset(settings);
    }
  }, [settings, reset]);

  const onSubmit = async (data: RestaurantSettings) => {
    try {
      await updateSettings(data);
      toast.success(t('setting:settings-saved'));
      reset(data);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(t('setting:settings-error'));
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralSettings />;
      case 'appearance':
        return <AppearanceSettings />;
      case 'business':
        return <BusinessSettings />;
      case 'seo':
        return <SEOSettings />;
      case 'tax':
        return <TaxSettings />;
      case 'delivery':
        return <DeliverySettings />;
      case 'legal':
        return <LegalSettings />;
      case 'integrations':
        return <IntegrationSettings />;
      case 'data':
        return <DataManagement />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-4xl mx-auto space-y-8 px-4 py-8"
      >
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="mt-8">{renderTabContent()}</div>

          {activeTab !== 'data' && (
            <div className="flex justify-end pt-6 border-t dark:border-gray-700">
              <button
                type="submit"
                disabled={!isDirty || isSubmitting}
                className={`
                  px-6 py-2 rounded-lg font-medium text-white
                  transition-all duration-200
                  ${
                    isDirty && !isSubmitting
                      ? 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl'
                      : 'bg-gray-400 cursor-not-allowed'
                  }
                `}
              >
                {isSubmitting ? t('common:saving') : t('setting:save-settings')}
              </button>
            </div>
          )}
        </form>
      </motion.div>
    </FormProvider>
  );
}
