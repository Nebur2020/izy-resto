import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { Language, Order } from '../../../types';
import { formatCurrency } from '../../../utils/currency';
import { useSettings } from '../../../hooks/useSettings';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface OrderNotificationProps {
  order: Order;
  onClose: () => void;
}

interface FirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
}

function isFirestoreTimestamp(value: any): value is FirestoreTimestamp {
  return (
    value &&
    typeof value.seconds === 'number' &&
    typeof value.nanoseconds === 'number'
  );
}

function formatElapsedTime(
  timestamp: FirestoreTimestamp | undefined,
  lng: string
): string {
  const { t } = useTranslation();

  if (!timestamp || !isFirestoreTimestamp(timestamp)) {
    return '';
  }

  try {
    const now = new Date();
    const orderDate = new Date(timestamp.seconds * 1000);

    const diffInSeconds = Math.floor(
      (now.getTime() - orderDate.getTime()) / 1000
    );

    if (diffInSeconds < 60) {
      return t('notification:just-now');
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return t('notification:minutes-ago', { count: minutes });
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return t('notification:hours-ago', { count: hours });
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return t('notification:days-ago', { count: days });
    } else {
      return new Intl.DateTimeFormat(lng, {
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit',
      }).format(orderDate);
    }
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return '';
  }
}

export function OrderNotification({ order, onClose }: OrderNotificationProps) {
  const { t, i18n } = useTranslation();
  const lng = i18n.language as Language;
  const navigate = useNavigate();
  const { settings } = useSettings();

  const handleClick = () => {
    navigate(`/dashboard/orders`);
    onClose();
  };

  const elapsedTime = formatElapsedTime(
    order.createdAt as FirestoreTimestamp,
    lng
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      onClick={handleClick}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
    >
      <div className="flex items-start gap-3">
        <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-lg">
          <ShoppingBag className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 dark:text-white">
            {t('notification:new-order')} #{order.id.slice(0, 8)}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            {order.customerName} •{' '}
            {formatCurrency(order.total, settings?.currency)}
          </p>
          {elapsedTime && (
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {t('notification:order-receive')} {elapsedTime}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
