import { motion } from 'framer-motion';
import { AlertTriangle, AlertCircle } from 'lucide-react';
import { InventoryItem } from '../../../../types/inventory';
import { useTranslation } from 'react-i18next';

interface InventoryAlertsProps {
  items: InventoryItem[];
}

export function InventoryAlerts({ items }: InventoryAlertsProps) {
  const { t } = useTranslation(['common', 'inventory']);
  const lowStockItems = items.filter(item => {
    return Number(item.quantity) <= Number(item.minQuantity);
  });

  const expiringItems = items.filter(item => {
    if (!item.expiryDate) return false;
    const expiryDate = new Date(item.expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil(
      (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  });

  const expiredItems = items.filter(item => {
    if (!item.expiryDate) return false;
    return new Date(item.expiryDate) < new Date();
  });

  if (!lowStockItems.length && !expiringItems.length && !expiredItems.length) {
    return null;
  }

  return (
    <div className="space-y-4">
      {lowStockItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-900/20"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <h3 className="font-medium text-amber-800 dark:text-amber-400">
              {t('common:low-stock')}
            </h3>
          </div>
          <div className="mt-2 space-y-1">
            {lowStockItems.map(item => (
              <p
                key={item.id}
                className="text-sm text-amber-700 dark:text-amber-300"
              >
                {item.name}: {item.quantity}{' '}
                {t(`common:units-name.${item.unit}`)} (Min: {item.minQuantity})
              </p>
            ))}
          </div>
        </motion.div>
      )}

      {expiredItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-900/20"
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <h3 className="font-medium text-red-800 dark:text-red-400">
              {t('inventory:expired-products')}
            </h3>
          </div>
          <div className="mt-2 space-y-1">
            {expiredItems.map(item => (
              <p
                key={item.id}
                className="text-sm text-red-700 dark:text-red-300"
              >
                {item.name} - {t('inventory:expired-on')}{' '}
                {new Date(item.expiryDate!).toLocaleDateString()}
              </p>
            ))}
          </div>
        </motion.div>
      )}

      {expiringItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-900/20"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-blue-500" />
            <h3 className="font-medium text-blue-800 dark:text-blue-400">
              {t('inventory:soon-to-expire')}
            </h3>
          </div>
          <div className="mt-2 space-y-1">
            {expiringItems.map(item => (
              <p
                key={item.id}
                className="text-sm text-blue-700 dark:text-blue-300"
              >
                {item.name} - {t('inventory:expires-on')}{' '}
                {new Date(item.expiryDate!).toLocaleDateString()}
              </p>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
