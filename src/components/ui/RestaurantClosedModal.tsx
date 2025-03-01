import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Lock, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useSettings } from '../../hooks/useSettings';
import { Button } from './Button';
import { useRestaurantStatus } from '../../hooks/useRestaurantStatus';
import { useTranslation } from 'react-i18next';

const DAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

const FRENCH_DAYS: Record<string, string> = {
  sunday: 'Dimanche',
  monday: 'Lundi',
  tuesday: 'Mardi',
  wednesday: 'Mercredi',
  thursday: 'Jeudi',
  friday: 'Vendredi',
  saturday: 'Samedi',
};

export function RestaurantClosedModal() {
  const { settings } = useSettings();
  // const [isOpen, setIsOpen] = useState(false);
  const [nextOpenTime] = useState<string | null>(null);
  const location = useLocation();

  const { isOpen: isRestaurantOpen, isHoliday } = useRestaurantStatus();

  const { t } = useTranslation();
  // Check if we're on a protected route
  const isProtectedRoute =
    location.pathname.startsWith('/dashboard') ||
    location.pathname === '/login';

  // Early return after hooks
  if (isRestaurantOpen || isProtectedRoute || isHoliday) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full overflow-hidden"
      >
        <div className="p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <Lock className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>

          <h2 className="text-2xl font-bold mb-2">Nous sommes fermés</h2>

          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {nextOpenTime ? (
              <>Nous ouvrirons {nextOpenTime}</>
            ) : (
              <>Nous sommes actuellement fermés</>
            )}
          </p>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Clock className="w-4 h-4" />
              Horaires d'ouverture :
            </div>

            <div className="space-y-1 text-sm px-10">
              {DAYS.map(day => {
                const hours = settings?.openingHours?.[day];
                return (
                  <div key={day} className="flex justify-between">
                    <span className="capitalize">
                      {t(`common:days.${day}`)}
                    </span>
                    <span>
                      {hours?.closed
                        ? 'Fermé'
                        : `${hours?.open || '--:--'} - ${
                            hours?.close || '--:--'
                          }`}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="border-t dark:border-gray-700 pt-4 mt-2">
              <Link to="/login">
                <Button variant="ghost" className="w-full">
                  <Settings className="w-4 h-4 mr-2" />
                  Administration
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
