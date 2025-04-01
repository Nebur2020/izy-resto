import { Phone, Mail, MapPin, Utensils, Truck } from 'lucide-react';
import { Order } from '../../../types';
import { useSettings } from '../../../hooks/useSettings';
import { formatCurrency } from '../../../utils/currency';
import { formatTaxRate } from '../../../utils/tax';
import { useTranslation } from 'react-i18next';

interface OrderTrackingDetailsProps {
  order: Order;
}

export function OrderTrackingDetails({ order }: OrderTrackingDetailsProps) {
  const { settings } = useSettings();
  const { t } = useTranslation('order');
  const primaryColor = settings?.palette.primary;

  const showAdditionalCharges = order.status !== 'cancelled';

  const calculateTotal = () => {
    if (order.status === 'cancelled') {
      return order.subtotal || 0;
    }
    return order.total || 0;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">{t('client-details')}</h2>
        <div className="space-y-3">
          {order.customerPhone && (
            <p className="flex items-center text-gray-600 dark:text-gray-400">
              <Phone className="w-4 h-4 mr-2" />
              {order.customerPhone}
            </p>
          )}

          {order.customerEmail && (
            <p className="flex items-center text-gray-600 dark:text-gray-400">
              <Mail className="w-4 h-4 mr-2" />
              {order.customerEmail}
            </p>
          )}
          {order.diningOption === 'delivery' && order.customerAddress && (
            <p className="flex items-center text-gray-600 dark:text-gray-400">
              <MapPin className="w-4 h-4 mr-2" />
              {order.customerAddress}
            </p>
          )}
          <div className="flex items-center mt-4">
            {order.diningOption === 'dine-in' ? (
              <div
                className="flex items-center px-3 py-1 rounded-full"
                style={{
                  backgroundColor: `${primaryColor}`,
                  color: '#fff',
                }}
              >
                <Utensils className="w-4 h-4 mr-2" />
                <span>
                  {t('on-site')} (Table {order.tableNumber})
                </span>
              </div>
            ) : (
              <div
                className="flex items-center px-3 py-1 rounded-full"
                style={{
                  backgroundColor: `${primaryColor}`,
                  color: '#fff',
                }}
              >
                <Truck className="w-4 h-4 mr-2" />
                <span className="text-white">{t('delivery')}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">
          {t('common:item-ordered')}
        </h2>
        <div className="space-y-3">
          {order.items.map(item => (
            <div key={item.id} className="flex justify-between items-center">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm" style={{ color: primaryColor }}>
                  {formatCurrency(item.price, settings?.currency)} ×{' '}
                  {item.quantity}
                </p>
              </div>
              <p className="font-medium" style={{ color: primaryColor }}>
                {formatCurrency(item.price * item.quantity, settings?.currency)}
              </p>
            </div>
          ))}
          {(!!order.subtotal ||
            !!(showAdditionalCharges && order?.taxes) ||
            !!(showAdditionalCharges && order?.tip?.percentage)) && (
            <div className="space-y-2 pt-4 mt-4 border-t border-current/10">
              {order.subtotal && (
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>{t('cart:sub-total')}</span>
                  <span style={{ color: primaryColor }}>
                    {formatCurrency(order.subtotal, settings?.currency)}
                  </span>
                </div>
              )}

              {showAdditionalCharges &&
                (order?.taxes || []).map(tax => (
                  <div
                    key={tax.id}
                    className="flex justify-between text-sm text-gray-800 dark:text-gray-400"
                  >
                    <span>
                      {tax.name} ({formatTaxRate(tax.rate)})
                    </span>
                    <span style={{ color: primaryColor }}>
                      {formatCurrency(tax.amount, settings?.currency)}
                    </span>
                  </div>
                ))}
              {showAdditionalCharges && order?.tip?.percentage && (
                <div
                  key={order.tip.amount}
                  className="flex justify-between text-sm text-gray-600 dark:text-gray-400"
                >
                  <span>
                    {t('tip')} ({order.tip.percentage}%)
                  </span>
                  <span style={{ color: primaryColor }}>
                    {formatCurrency(order.tip.amount, settings?.currency)}
                  </span>
                </div>
              )}
              {showAdditionalCharges && order?.delivery && (
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>
                    {t('delivery-to')} {order.delivery.name}
                  </span>
                  <span style={{ color: primaryColor }}>
                    {formatCurrency(
                      Number(order.delivery.price),
                      settings?.currency
                    )}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>{t('total')}</span>
                <span className="font-bold" style={{ color: primaryColor }}>
                  {formatCurrency(calculateTotal(), settings?.currency)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
