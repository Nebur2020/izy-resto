import { useTranslation } from 'react-i18next';

interface CustomerInfo {
  name?: string;
  phone?: string;
}

interface CustomerInfoFormProps {
  customerInfo: CustomerInfo;
  onChange: (info: CustomerInfo) => void;
}

export function CustomerInfoForm({
  customerInfo,
  onChange,
}: CustomerInfoFormProps) {
  const { t } = useTranslation('common');
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">{t('name')}</label>
          <input
            type="text"
            value={customerInfo.name || ''}
            onChange={e => onChange({ ...customerInfo, name: e.target.value })}
            placeholder={t('client-name')}
            className="w-full rounded-lg border dark:border-gray-700 p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            {t('phone-number')}
          </label>
          <input
            type="tel"
            value={customerInfo.phone || ''}
            onChange={e => onChange({ ...customerInfo, phone: e.target.value })}
            placeholder={t('client-phone-number')}
            className="w-full rounded-lg border dark:border-gray-700 p-2"
          />
        </div>
      </div>
    </div>
  );
}
