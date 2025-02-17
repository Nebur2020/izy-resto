import { Webhook, Bluetooth, X } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { RestaurantSettings } from '../../../../../types';
import { Button } from '../../../../../components/ui/Button';
import { useBluetooth } from '../../../../../hooks/useBluetooth';
import { useTranslation } from 'react-i18next';

export function IntegrationSettings() {
  const { t } = useTranslation();
  const {} = useFormContext<RestaurantSettings>();
  const {
    devices,
    isScanning,
    scanForDevices,
    connectDevice,
    disconnectDevice,
    removeDevice,
  } = useBluetooth();

  return (
    <div className="space-y-8">
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bluetooth className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold">
              {t('settingIntegration:bluetooth-title')}
            </h2>
          </div>
          <Button
            onClick={scanForDevices}
            disabled={isScanning}
            className="relative group"
          >
            {isScanning ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                {t('common:search')}
              </>
            ) : (
              <>
                <Bluetooth className="w-4 h-4 mr-2" />
                {t('settingIntegration:search-device')}
              </>
            )}
          </Button>
        </div>

        <div className="space-y-3">
          {devices.map(device => (
            <div
              key={device.id}
              className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center gap-3">
                <Bluetooth className="w-5 h-5 text-gray-400" />
                <div>
                  <h3 className="font-medium">{device.name}</h3>
                  <p className="text-sm text-gray-500">
                    {device.status === 'connected'
                      ? t('settingIntegration:connected')
                      : t('settingIntegration:disconnected')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {device.status === 'disconnected' ? (
                  <Button
                    onClick={() => connectDevice(device.id)}
                    className="text-sm"
                  >
                    {t('settingIntegration:connect')}
                  </Button>
                ) : (
                  <Button
                    onClick={() => disconnectDevice(device.id)}
                    variant="secondary"
                    className="text-sm"
                  >
                    {t('settingIntegration:disconnect')}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  onClick={() => removeDevice(device.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}

          {devices.length === 0 && !isScanning && (
            <div className="text-center py-8 px-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <Bluetooth className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-600 dark:text-gray-400">
                {t('settingIntegration:no-device-found')}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                {t('settingIntegration:make-sure-device')}
              </p>
            </div>
          )}
        </div>
      </section>
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <Webhook className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-xl font-semibold">
            {t('settingIntegration:api-title')}
          </h2>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <p className="text-sm text-blue-600 dark:text-blue-400">
            {t('settingIntegration:api-description')}
          </p>
        </div>
      </section>
    </div>
  );
}
