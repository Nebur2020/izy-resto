import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Language, Order } from '../../types';
import { OrderCardHeader } from './card/OrderCardHeader';
import { OrderCardDetails } from './card/OrderCardDetails';
import { OrderTimeline } from './OrderTimeline';
import { Button } from '../ui/Button';
import { Printer } from 'lucide-react';
import {
  generateReceiptPDF,
  getPdfSettings,
  getPdfTranslationValues,
} from '../../utils/pdf';
import { useSettings } from '../../hooks';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

interface OrderCardProps {
  order: Order;
  onStatusChange: (orderId: string, status: string) => void;
  onCancel?: (orderId: string) => void;
}

export const OrderCard = React.forwardRef<HTMLDivElement, OrderCardProps>(
  ({ order, onStatusChange, onCancel }, ref) => {
    const { settings } = useSettings();
    const { t, i18n } = useTranslation('order');
    const lng = i18n.language as Language;

    const canCancel = ['pending', 'preparing'].includes(order.status);
    const [isPrinting, setIsPrinting] = useState(false);

    const statusStyles = {
      pending:
        'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-300',
      preparing:
        'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300',
      ready:
        'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300',
      delivered:
        'bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-300',
      cancelled: 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300',
    };

    const handlePrint = async () => {
      try {
        setIsPrinting(true);
        const translations = getPdfTranslationValues(t);
        const pdfSettings = getPdfSettings(settings);
        const pdf = await generateReceiptPDF(
          order,
          {
            ...translations,
            paymentMethodName: t(
              `order:payment-method-names.${order.paymentMethod?.name}`
            ),
          },
          t,
          lng,
          pdfSettings
        );
        pdf.autoPrint();
        window.open(pdf.output('bloburl'));
        toast.success(t('invoice-in-printing'));
      } catch (error) {
        console.error('Error printing receipt:', error);
        toast.error(t('printing-error'));
      } finally {
        setIsPrinting(false);
      }
    };

    return (
      <motion.div
        ref={ref}
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`rounded-lg shadow-sm p-6 ${statusStyles[order.status]} ${
          order.status === 'cancelled' ? 'opacity-75 cursor-not-allowed' : ''
        }`}
      >
        <div className="space-y-6">
          <OrderCardHeader order={order} />

          <OrderTimeline
            order={order}
            status={order.status}
            createdAt={order.createdAt}
            updatedAt={order.updatedAt}
          />
          <OrderCardDetails order={order} />
          <div className="flex justify-between items-center gap-4 pt-4 border-t border-current/10">
            {order.status !== 'cancelled' && order.status !== 'delivered' && (
              <Button
                onClick={() =>
                  onStatusChange(
                    order.id,
                    order.status === 'pending' ? 'preparing' : 'delivered'
                  )
                }
                className="flex-1 bg-white/90 hover:bg-white text-current"
              >
                {order.status === 'pending'
                  ? t('mark-in-cooking')
                  : t('mark-as-delivered')}
              </Button>
            )}
            {canCancel && onCancel && (
              <Button
                variant="danger"
                onClick={() => onCancel(order.id)}
                className="flex-1"
              >
                {t('cancel-order')}
              </Button>
            )}
          </div>
          <Button
            onClick={handlePrint}
            disabled={isPrinting}
            className="bg-white/90 hover:bg-white text-current px-4 py-2 rounded w-full"
          >
            <Printer className="h-4 w-4 mr-2" />
            {isPrinting ? t('common:printing') : t('print-bill')}
          </Button>
        </div>
      </motion.div>
    );
  }
);

OrderCard.displayName = 'OrderCard';
