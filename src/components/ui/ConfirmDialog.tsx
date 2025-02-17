import { motion } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from './Button';
import { useTranslation } from 'react-i18next';

interface IConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ConfirmDialog(props: IConfirmDialogProps) {
  const { t } = useTranslation();
  const {
    isOpen,
    title,
    message,
    confirmLabel = t('common:confirm'),
    cancelLabel = t('common:cancel'),
    onConfirm,
    onCancel,
    isLoading,
  } = props;
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden"
      >
        <div className="flex items-center gap-4 p-6 border-b dark:border-gray-700">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {message}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="absolute right-4 top-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex justify-end gap-3 p-6 bg-gray-50 dark:bg-gray-800/50">
          <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? t('common:deleting') : confirmLabel}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
