import React from 'react';
import { motion } from 'framer-motion';
import { X, Clock } from 'lucide-react';
import { useSettings } from '../../hooks/useSettings';
import { Button } from '../ui/Button';
import { useTranslation } from 'react-i18next';

interface OpeningHoursModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OpeningHoursModal({ isOpen, onClose }: OpeningHoursModalProps) {
  const { settings } = useSettings();
  const { t } = useTranslation('common');

  // Filter out days with no hours set
  const openingHours = React.useMemo(() => {
    if (!settings?.openingHours) return [];

    return Object.entries(settings.openingHours)
      .filter(([_, hours]) => hours && (hours.open || hours.closed))
      .sort((a, b) => {
        const days = [
          'monday',
          'tuesday',
          'wednesday',
          'thursday',
          'friday',
          'saturday',
          'sunday',
        ];
        return days.indexOf(a[0]) - days.indexOf(b[0]);
      });
  }, [settings?.openingHours]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold">
              {t('opening-hours-modal-title')}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="rounded-full p-2"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          {openingHours.length > 0 ? (
            <div className="space-y-4">
              {openingHours.map(([day, hours]) => (
                <div key={day} className="flex justify-between items-center">
                  <span className="font-medium">{t(`common:days.${day}`)}</span>
                  <span
                    className={`text-gray-600 dark:text-gray-400 ${
                      hours.closed ? 'text-red-500 dark:text-red-400' : ''
                    }`}
                  >
                    {hours.closed ? 'Fermé' : `${hours.open} - ${hours.close}`}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Aucun horaire défini
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t dark:border-gray-700 p-4">
          <Button onClick={onClose} className="w-full">
            {t('close')}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
