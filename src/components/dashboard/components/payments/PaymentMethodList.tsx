import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, Trash2, QrCode } from 'lucide-react';
import { PaymentMethod } from '../../../../types/payment';
import { Button } from '../../../ui/Button';
import { useTranslation } from 'react-i18next';

interface IPaymentMethodListProps {
  methods: PaymentMethod[];
  isLoading: boolean;
  onEdit: (method: PaymentMethod) => void;
  onDelete: (id: string) => void;
}

export function PaymentMethodList(props: IPaymentMethodListProps) {
  const { t } = useTranslation();
  const { methods, isLoading, onEdit, onDelete } = props;
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence mode="popLayout">
        {methods.map(method => (
          <motion.div
            key={method.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              {method.qrCode ? (
                <img
                  src={method.qrCode}
                  alt={`QR Code for ${method.name}`}
                  className="w-16 h-16 object-contain rounded-lg bg-gray-50 dark:bg-gray-700 p-2"
                />
              ) : (
                <div className="w-16 h-16 flex items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-700">
                  <QrCode className="w-8 h-8 text-gray-400" />
                </div>
              )}

              <div>
                <h3 className="font-medium text-lg">
                  {t(`order:payment-method-names.${method.name}`)}
                  {method.isDefault && (
                    <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
                      {t('common:payment-method-default')}
                    </span>
                  )}
                </h3>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onEdit(method)}
                disabled={method.isDefault}
              >
                <Edit2 className="w-4 h-4" />
              </Button>

              {methods.length > 1 && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => onDelete(method.id)}
                  disabled={methods.length < 2}
                  spanClassName='text-white'
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
