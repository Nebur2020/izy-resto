import React, { useState } from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Star,
  QrCode,
  CheckCircle,
  XCircle,
  Clipboard,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useOrders } from '../context/OrderContext';
import { OrderReceiptDetails } from '../components/orders/receipt/OrderReceiptDetails';
import { OrderTrackingLink } from '../components/orders/receipt/OrderTrackingLink';
import { OrderQRCode } from '../components/orders/OrderQRCode';
import { orderService } from '../services/orders/order.service';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export function OrderReceipt() {
  const { t } = useTranslation('order');
  const location = useLocation();
  const { updateOrderStatus } = useOrders();
  const [order, setOrder] = React.useState(location.state?.order);
  const [showQR, setShowQR] = useState(false);

  React.useEffect(() => {
    if (!order?.id) return;

    const unsubscribe = orderService.subscribeToOrder(
      order.id,
      updatedOrder => {
        setOrder(updatedOrder);
      }
    );

    return () => unsubscribe();
  }, [order?.id]);

  if (!order) {
    return <Navigate to="/" replace />;
  }

  const handleCopy = async () => {
    if (!order?.id) return;
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(
        `${window.location.origin}/order/${order.id}`
      );
    } else {
      window.open(`${window.location.origin}/order/${order.id}`);
    }
  };

  const handleCancelOrder = async () => {
    if (order.status !== 'pending') {
      toast.error('Cette commande ne peut plus être annulée');
      return;
    }

    try {
      await updateOrderStatus(order.id, 'cancelled');
      toast.success('Commande annulée avec succès');
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error("Erreur lors de l'annulation");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Link to="/">
          <Button variant="ghost" className="text-white hover:bg-white/10">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common:back-to-home')}
          </Button>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
        >
          <div
            className={`p-6 text-white ${
              order.status === 'cancelled'
                ? 'bg-red-600'
                : 'bg-gradient-to-r from-emerald-500 to-green-600'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                {order.status === 'cancelled' ? (
                  <XCircle className="w-8 h-8" />
                ) : (
                  <CheckCircle className="w-8 h-8" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-1">
                  {order.status === 'cancelled'
                    ? t('order:order-cancelled')
                    : t('order-confirmed')}
                </h1>
                <p className="text-white/80">
                  {order.status === 'cancelled'
                    ? t('this-order-is-canceled')
                    : t('order-successfully-saved')}
                </p>
              </div>
            </div>
          </div>

          <OrderReceiptDetails order={order} />

          <div className="p-6 border-t dark:border-gray-700">
            <div className="grid grid-cols-1 gap-4">
              <Button onClick={handleCopy} className="w-full">
                <Clipboard className="w-4 h-4 mr-2" />
                {t('click-and-copy-link')}
              </Button>
            </div>

            <Button
              variant="ghost"
              onClick={() => setShowQR(!showQR)}
              className="w-full mt-4"
            >
              <QrCode className="w-4 h-4 mr-2" />
              {showQR ? t('common:hide-qr-code') : t('common:show-qr-code')}
            </Button>

            {showQR && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 flex flex-col items-center"
              >
                <OrderQRCode orderId={order.id} size={200} />
                <p className="mt-2 text-sm text-gray-500">
                  {t('scan-and-track')}
                </p>
              </motion.div>
            )}
            {order.status === 'pending' && (
              <Button
                variant="danger"
                onClick={handleCancelOrder}
                className="w-full mt-4"
              >
                {t('cancel-order')}
              </Button>
            )}
          </div>
        </motion.div>
        {(order.status === 'delivered' || order.status === 'cancelled') &&
          !order.rating && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white text-center shadow-lg"
            >
              <Star className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
              <h3 className="text-xl font-semibold mb-2">
                {t('your-opinion')}
              </h3>
              <p className="text-white/80 mb-4">{t('help-us-to-improve')}</p>
              <Link to={`/order/${order.id}`}>
                <Button className="w-full bg-white text-blue-600 hover:bg-blue-50">
                  {t('rate-order')}
                </Button>
              </Link>
            </motion.div>
          )}

        {order.status !== 'cancelled' && (
          <OrderTrackingLink orderId={order.id} />
        )}
      </div>
    </div>
  );
}
