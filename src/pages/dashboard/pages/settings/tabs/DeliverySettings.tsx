import React from 'react';
import { Truck, Plus, AlertCircle } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import {
  RestaurantSettings,
  DeliveryZone,
} from '../../../../../types/settings';
import { Button } from '../../../../../components/ui/Button';
import { ConfirmDialog } from '../../../../../components/ui/ConfirmDialog';
import { DeliveryZoneForm } from '../../../components/delivery/DeliveryZoneForm';
import { DeliveryZoneList } from '../../../components/delivery/DeliveryZoneList';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../../../../../hooks';

export function DeliverySettings() {
  const { t } = useTranslation();
  const {
    watch,
    setValue,
    register,
    formState: { errors },
    trigger,
  } = useFormContext<RestaurantSettings>();

  const { settings } = useSettings();
  const primaryColor = settings?.palette.primary

  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingZone, setEditingZone] = React.useState<DeliveryZone | null>(
    null
  );
  const [deleteConfirmation, setDeleteConfirmation] = React.useState<{
    isOpen: boolean;
    zone: DeliveryZone | null;
  }>({ isOpen: false, zone: null });

  const deliveryEnabled = watch('delivery.enabled');
  const zones = watch('delivery.zones') || [];
  const currency = watch('currency');

  React.useEffect(() => {
    register('delivery.zones', {
      validate: value => {
        if (deliveryEnabled && (!value || value.length === 0)) {
          return t('settingDelivery:errors-no-zones');
        }
        return true;
      },
    });
  }, [register, deliveryEnabled]);

  const handleDeliveryToggle = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setValue('delivery.enabled', e.target.checked);
    await trigger('delivery.zones');
  };

  const handleSave = (data: Omit<DeliveryZone, 'id'>) => {
    const newZones = editingZone
      ? zones.map(zone =>
          zone.id === editingZone.id ? { ...zone, ...data } : zone
        )
      : [...zones, { ...data, id: crypto.randomUUID() }];

    setValue('delivery.zones', newZones, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setIsFormOpen(false);
    setEditingZone(null);
  };

  const handleDelete = () => {
    if (!deleteConfirmation.zone) return;

    const newZones = zones.filter(
      zone => zone.id !== deleteConfirmation.zone?.id
    );
    setValue('delivery.zones', newZones, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setDeleteConfirmation({ isOpen: false, zone: null });
  };

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <Truck className="h-5 w-5 dark:text-blue-400" color={primaryColor} />
          <h2 className="text-xl font-semibold">{t('common:delivery')}</h2>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            {...register('delivery.enabled', {
              onChange: handleDeliveryToggle,
            })}
            className="rounded border-gray-300 dark:border-gray-600"
          />
          <label className="text-sm font-medium">
            {t('settingDelivery:enable-delivery')}
          </label>
        </div>
      </section>
      {deliveryEnabled && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">
              {t('settingDelivery:delivery-zones')}
            </h3>
            <Button
              type="button"
              onClick={() => setIsFormOpen(true)}
              variant="custom"
              style={{ backgroundColor: primaryColor }}
              spanClassName="text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('settingDelivery:add-zone')}
            </Button>
          </div>
          {errors.delivery?.zones && (
            <div className="flex items-center gap-2 p-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <p>{errors.delivery.zones.message}</p>
            </div>
          )}

          <DeliveryZoneList
            zones={zones}
            isLoading={false}
            currency={currency}
            onEdit={zone => {
              setEditingZone(zone);
              setIsFormOpen(true);
            }}
            onDelete={zone => {
              if (deliveryEnabled && zones.length === 1) {
                return;
              }
              setDeleteConfirmation({
                isOpen: true,
                zone,
              });
            }}
            primaryColor={primaryColor}
          />
        </section>
      )}
      {isFormOpen && (
        <DeliveryZoneForm
          zone={editingZone}
          onSave={handleSave}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingZone(null);
          }}
          currency={currency}
        />
      )}

      <ConfirmDialog
        isOpen={deleteConfirmation.isOpen}
        title={t('settingDelivery:delete-zone')}
        message={
          deliveryEnabled && zones.length === 1
            ? t('settingDelivery:delete-last-zone-warning')
            : t('settingDelivery:delete-zone-warning', {
                deleteConfirmation: deleteConfirmation.zone?.name,
              })
        }
        confirmLabel={t('common:delete')}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmation({ isOpen: false, zone: null })}
      />
    </div>
  );
}
