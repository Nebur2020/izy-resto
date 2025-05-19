import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { hexToRgba } from '../../../utils/colorUtils';

interface AnalyticsChartProps {
  data: Record<string, number>;
  primaryColor?: string;
}

export function AnalyticsChart({ data, primaryColor = '#3B82F6' }: AnalyticsChartProps) {
  const { t } = useTranslation(['common', 'dashboard']);
  const total = Object.values(data).reduce((sum, value) => sum + value, 0);

  // Default colors for known statuses
  const statusColors = {
    pending: 'bg-yellow-500',
    preparing: 'bg-blue-500',
    ready: 'bg-green-500',
    delivered: 'bg-purple-500',
    cancelled: 'bg-red-500',
  };

  // Default translations for known statuses
  const statusWording: Record<string, string> = {
    pending: t('common:status.pending'),
    preparing: t('common:preparing'),
    ready: t('common:ready'),
    delivered: t('common:status.delivered'),
    cancelled: t('common:status.canceled'),
    unknown: t('dashboard:unknown'),
  };

  // Get appropriate label for the item
  const getItemLabel = (key: string): string => {
    // Use predefined labels for known statuses
    if (key in statusWording) {
      return statusWording[key];
    }

    // Otherwise, just use the key with first letter capitalized
    return key.charAt(0).toUpperCase() + key.slice(1);
  };

  return (
    <div className="space-y-4">
      {total === 0 ? (
        <div className="text-center py-4 text-gray-500">{t('dashboard:no-data-available')}</div>
      ) : (
        Object.entries(data).map(([key, value], index) => {
          // Generate background color
          let bgColorClass = '';
          if (key in statusColors) {
            bgColorClass = statusColors[key as keyof typeof statusColors];
          } else {
            // For other items, use alternating colors
            bgColorClass = index % 2 === 0 ? 'bg-blue-500' : 'bg-indigo-500';
          }

          return (
            <div key={key} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="capitalize">{getItemLabel(key)}</span>
                <span className="font-medium">{value}</span>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(value / total) * 100}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className={`h-full ${bgColorClass}`}
                  style={
                    !(key in statusColors) ? {
                      backgroundColor: hexToRgba(primaryColor, 0.7 - (index * 0.05)),
                    } : {}
                  }
                />
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
