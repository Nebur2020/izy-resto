import { Download, Share2, QrCode } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Order } from '../../../types';
import { OrderQRCode } from '../OrderQRCode';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface IReceiptActionsProps {
  order: Order;
  isDownloading: boolean;
  showQR: boolean;
  onDownload: () => Promise<void>;
  onShare: () => Promise<void>;
  onToggleQR: () => void;
  onCancel?: () => Promise<void>;
}

export function ReceiptActions(props: IReceiptActionsProps) {
  const {
    order,
    isDownloading,
    showQR,
    onDownload,
    onShare,
    onToggleQR,
    onCancel,
  } = props;
  const { t } = useTranslation(['order', 'common']);
  return (
    <div className="p-6 border-t dark:border-gray-700">
      <div className="grid grid-cols-2 gap-4">
        <Button
          variant="secondary"
          onClick={onDownload}
          disabled={isDownloading}
          className="w-full"
        >
          <Download className="w-4 h-4 mr-2" />
          {isDownloading ? t('downloading') : t('download')}
        </Button>

        <Button onClick={onShare} className="w-full">
          <Share2 className="w-4 h-4 mr-2" />
          {t('share')}
        </Button>
      </div>

      <Button variant="ghost" onClick={onToggleQR} className="w-full mt-4">
        <QrCode className="w-4 h-4 mr-2" />
        {showQR ? t('hide-qr-code') : t('show-qr-code')}
      </Button>

      <AnimatePresence>
        {showQR && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 flex flex-col items-center"
          >
            <OrderQRCode orderId={order.id} size={200} />
            <p className="mt-2 text-sm text-gray-500">
              {t('scan-qr-code-to-track')}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {order.status === 'pending' && onCancel && (
        <Button variant="danger" onClick={onCancel} className="w-full mt-4">
          {t('cancel-order')}
        </Button>
      )}
    </div>
  );
}
