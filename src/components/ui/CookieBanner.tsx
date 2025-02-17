import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X } from 'lucide-react';
import { Button } from './Button';
import { useLayoutMount } from '../../hooks/useLayoutMount';
import { useTranslation } from 'react-i18next';

export function CookieBanner() {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const { isLoading } = useLayoutMount();

  useEffect(() => {
    if (!isLoading) {
      const hasAcceptedCookies = !!localStorage.getItem('cookiesAccepted')
        ? localStorage.getItem('cookiesAccepted') === 'true'
        : false;
      if (!hasAcceptedCookies) {
        const timer = setTimeout(() => setIsVisible(true), 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [isLoading]);

  const handleAccept = () => {
    localStorage.setItem('cookiesAccepted', 'true');
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-0 inset-x-0 z-50 p-4 md:p-0"
        >
          <div className="max-w-screen-xl mx-auto">
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 md:p-8">
              {/* Close Button */}
              <button
                onClick={handleDismiss}
                className="absolute right-4 top-4 p-1 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                {/* Icon */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                    <Cookie className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {t('common:cookie-banner-title')}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base">
                    {t('common:cookie-banner-description')}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <Button
                    spanClassName="text-white"
                    onClick={handleAccept}
                    className="w-full text-white sm:w-auto whitespace-nowrap bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    {t('common:accepted')}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleDismiss}
                    className="w-full sm:w-auto whitespace-nowrap"
                  >
                    {t('common:cookie-banner-dismiss')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
