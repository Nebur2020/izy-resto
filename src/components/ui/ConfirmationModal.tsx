import { X } from 'lucide-react';
import { Button } from './Button';
import { useTranslation } from 'react-i18next';

interface IConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export function ConfirmationModal(props: IConfirmationModalProps) {
  const { t } = useTranslation();
  const { isOpen, onClose, onConfirm, title, message } = props;
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h3 className="text-xl font-semibold">{title}</h3>
          <button onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-300">{message}</p>
        </div>
        <div className="flex justify-end gap-4 p-6 border-t dark:border-gray-700">
          <Button variant="secondary" onClick={onClose}>
            {t('common:cancel')}
          </Button>
          <Button variant="danger" onClick={onConfirm} className='text-white'>
            {t('common:delete')}
          </Button>
        </div>
      </div>
    </div>
  );
}
