import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface ModalProps {
  isOpen: boolean;
  children: React.ReactNode;
  onClose?: () => void;
  modalTitle?: string;
  displayCloseButton?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  children,
  modalTitle,
  displayCloseButton,
}: ModalProps) {
  const { t } = useTranslation();
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-40"
            onClick={onClose}
          />

          <motion.div
            initial={{ y: '50%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '50%', opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-6"
          >
            <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
              <div className="p-4 border-b dark:border-gray-700">
                <h2 className="text-lg font-semibold">{modalTitle}</h2>
              </div>

              <div className="flex-1 overflow-y-auto p-4">{children}</div>

              {displayCloseButton && (
                <div className="p-4 border-t dark:border-gray-700">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    {t('comon:close')}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
