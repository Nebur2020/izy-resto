import { motion } from 'framer-motion';
import { Order } from '../../../types';
import { OrderTimeline } from '../OrderTimeline';
import { OrderQRCode } from '../OrderQRCode';
import { Button } from '../../ui';
import { useState } from 'react';
import { generateUserReceipt } from '../../../utils/pdf';
import { useSettings } from '../../../hooks';
import toast from 'react-hot-toast';
import { Download, Clipboard } from 'lucide-react';
import { useOrders } from '../../../context/OrderContext';
import { useTranslation } from 'react-i18next';

interface OrderTrackingTimelineProps {
  order: Order;
}

export function OrderTrackingTimeline({ order }: OrderTrackingTimelineProps) {
  const { t } = useTranslation('order');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const { settings } = useSettings();
  const { updateOrderStatus } = useOrders();

  const handleCancelOrder = async () => {
    if (order.status !== 'pending') {
      toast.error(t('order-can-not-be-cancel'));
      return;
    }

    try {
      setIsCancelling(true);
      await updateOrderStatus(order.id, 'cancelled');
      toast.success(t('order-successfully-cancelled'));
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error(t('canceled-error'));
    } finally {
      setIsCancelling(false);
    }
  };

  const handleDownloadReceipt = async () => {
    try {
      setIsDownloading(true);
      const pdf = await generateUserReceipt(order, t, settings);
      console.log('pdf', pdf);
      pdf.save(`commande-${order.id.slice(0, 8)}.pdf`);
      toast.success(t('common:download-success'));
    } catch (error) {
      console.error('Error downloading receipt:', error);
      toast.error(t('common:download-error'));
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyLink = async () => {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(
        `${window.location.origin}/order/${order.id}`
      );
      toast.success(t('common:link-copied'));
    } else {
      window.open(`${window.location.origin}/order/${order.id}`, '_blank');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">{t('order-stat')}</h2>

      <div className="space-y-6">
        <OrderTimeline
          order={order}
          status={order.status}
          createdAt={order.createdAt}
          updatedAt={order.updatedAt}
        />

        {order.status !== 'cancelled' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center pt-6 border-t dark:border-gray-700"
          >
            <OrderQRCode orderId={order.id} size={150} />
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              {t('scan-and-track')}
            </p>
            <Button
              variant="primary"
              onClick={handleCopyLink}
              className="w-full mt-4"
            >
              <Clipboard className="w-4 h-4 mr-2" />
              {t('click-to-copy')}
            </Button>
            <Button
              variant="secondary"
              onClick={handleDownloadReceipt}
              disabled={isDownloading || order.status === 'pending'}
              className="w-full mt-4"
            >
              <Download className="w-4 h-4 mr-2" />
              {isDownloading
                ? t('downloading')
                : t('download-order-confirmation')}
            </Button>
            {order.status === 'pending' && (
              <Button
                disabled={isCancelling}
                variant="danger"
                onClick={handleCancelOrder}
                className="w-full mt-4"
                spanClassName='text-white'
              >
                {t('cancel-order')}
              </Button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
