import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../../ui/Button';
import { useNotifications } from '../../../hooks/useNotifications';
import { OrderNotification } from './OrderNotification';
import { useTranslation } from 'react-i18next';

const MAX_NOTIFICATIONS = 5;

export function NotificationBell() {
  const { t } = useTranslation();
  const { notifications, clearNotification, hasUnread } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const sortedNotifications = [...notifications].sort((a, b) => {
    return (
      new Date(b.order.createdAt).getTime() -
      new Date(a.order.createdAt).getTime()
    );
  });

  const totalPages = Math.ceil(sortedNotifications.length / MAX_NOTIFICATIONS);
  const startIndex = (currentPage - 1) * MAX_NOTIFICATIONS;
  const endIndex = startIndex + MAX_NOTIFICATIONS;
  const currentNotifications = sortedNotifications.slice(startIndex, endIndex);

  useEffect(() => {
    if (isOpen) {
      setCurrentPage(1);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && !event.defaultPrevented) {
        setIsOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen]);

  const handlePreviousPage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNextPage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={e => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="relative h-10 w-10 rounded-full p-0"
      >
        <Bell className="h-5 w-5" />
        {hasUnread && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-red-500"
          />
        )}
      </Button>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 z-50 mt-2 w-80 rounded-lg bg-white p-4 shadow-xl dark:bg-gray-800"
              onClick={e => e.stopPropagation()}
            >
              {notifications.length > 0 ? (
                <>
                  <div className="mb-3 text-sm text-gray-500 dark:text-gray-400">
                    {notifications.length} notification
                    {notifications.length > 1 ? 's' : ''}
                  </div>

                  <div className="space-y-2">
                    <AnimatePresence mode="wait">
                      {currentNotifications.map(notification => (
                        <OrderNotification
                          key={notification.id}
                          order={notification.order}
                          onClose={() => {
                            clearNotification(notification.id);
                            if (
                              currentNotifications.length === 1 &&
                              currentPage > 1
                            ) {
                              setCurrentPage(prev => prev - 1);
                            }
                          }}
                        />
                      ))}
                    </AnimatePresence>
                  </div>

                  {totalPages > 1 && (
                    <div className="mt-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                        className="p-1"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {t('notification:page-indicator', { currentPage, totalPages })}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        className="p-1"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">
                  {t('notification:no-notifications')}
                </p>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
