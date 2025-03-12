import { MapPin } from 'lucide-react';
import { useSettings } from '../../hooks/useSettings';
import { formatCurrency } from '../../utils/currency';
import { DeliveryZone } from '../../types';
import { useTranslation } from 'react-i18next';

interface DeliveryZoneSelectProps {
  selectedZone: DeliveryZone | null;
  onZoneChange: (zone: DeliveryZone) => void;
  className?: string;
  primaryColor?: string;
  backgroundColor?: string;
  isDarkMode?: boolean;
}

export function DeliveryZoneSelect({
  selectedZone,
  onZoneChange,
  className = '',
  primaryColor = '#3b82f6',
  backgroundColor = '#f3f4f6',
  isDarkMode = false,
}: DeliveryZoneSelectProps) {
  const { settings, isLoading } = useSettings();
  const { t } = useTranslation('order');

  // Function to get dynamic styles
  const getStyle = (element: string) => {
    switch (element) {
      case 'select':
        return {
          className:
            'w-full pl-10 pr-4 py-2 rounded-lg border appearance-none focus:ring-2 focus:ring-opacity-50 focus:border-transparent focus:outline-none',
          style: {
            borderColor: isDarkMode ? '#4b5563' : '#d1d5db', // gray-600 or gray-300
            backgroundColor: isDarkMode ? '#374151' : 'white', // gray-700 or white
            color: isDarkMode ? '#e5e7eb' : '#1f2937', // gray-200 or gray-800
            // Add focus style variables
            '--tw-ring-color': primaryColor,
          } as React.CSSProperties,
        };
      case 'icon':
        return {
          className: 'absolute left-3 top-1/2 -translate-y-1/2',
          style: { color: '#9ca3af' }, // gray-400
        };
      case 'error':
        return {
          className: 'text-sm',
          style: { color: '#ef4444' }, // red-500
        };
      case 'loading':
        return {
          className: 'animate-pulse rounded-lg h-10 w-full',
          style: { backgroundColor: isDarkMode ? '#1f2937' : '#f3f4f6' }, // gray-800 or gray-100
        };
      default:
        return {};
    }
  };

  if (isLoading) {
    return (
      <div
        className={getStyle('loading').className}
        style={getStyle('loading').style}
      />
    );
  }

  const zones = settings?.delivery?.zones || [];

  if (zones.length === 0) {
    return (
      <div
        className={getStyle('error').className}
        style={getStyle('error').style}
      >
        {t('delivery-not-available')}
      </div>
    );
  }

  return (
    <div className={className}>
      <label className="block text-sm font-medium mb-1">
        {t('delivery-zone')} *
      </label>
      <div className="relative">
        <MapPin
          className={getStyle('icon').className}
          style={getStyle('icon').style}
        />
        <select
          value={selectedZone?.id || ''}
          onChange={e => {
            const zone = zones.find(z => z.id === e.target.value);
            if (zone) onZoneChange(zone);
          }}
          className={getStyle('select').className}
          style={getStyle('select').style}
        >
          <option value="">{`${t('select-zone')}`}</option>
          {zones.map(zone => (
            <option key={zone.id} value={zone.id}>
              {zone.name} - {formatCurrency(zone.price, settings?.currency)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
