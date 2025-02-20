import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';
import { motion } from 'framer-motion';
import { format, addMonths, subMonths } from 'date-fns';
import { fr, enUS as en } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { Language } from '../../types';

interface IDatePickerProps {
  date: Date;
  onSelect: (date: Date) => void;
  isOpen: boolean;
  onClose: () => void;
  position?: 'top' | 'bottom';
}

export function DatePicker(props: IDatePickerProps) {
  const { t, i18n } = useTranslation('common');
  const { date, onSelect, isOpen, onClose, position = 'bottom' } = props;
  const [viewDate, setViewDate] = useState(date);
  const today = new Date();
  const calendarRef = useRef<HTMLDivElement>(null);
  const lng = i18n.language as Language;

  const localesMap: Record<Language, Locale> = {
    en: en,
    fr: fr,
  };

  const locale = localesMap[lng] || fr;

  const currentMonth = viewDate.getMonth();
  const currentYear = viewDate.getFullYear();

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const weekDays = [
    t('common:sun'),
    t('common:mon'),
    t('common:tue'),
    t('common:wed'),
    t('common:thur'),
    t('common:fri'),
    t('common:sat'),
  ];
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className={` ${
        position === 'bottom' ? 'top-full mt-1' : 'bottom-full mb-1'
      } left-0 z-50`}
      style={{ minWidth: 'max-content' }}
    >
      <motion.div
        ref={calendarRef}
        initial={{ opacity: 0, y: position === 'bottom' ? 10 : -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: position === 'bottom' ? 10 : -10 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        <div className="flex items-center justify-between p-3 border-b dark:border-gray-700">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewDate(subMonths(viewDate, 1))}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="text-sm font-medium">
            {format(viewDate, 'MMMM yyyy', { locale })}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewDate(addMonths(viewDate, 1))}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-3">
          <div className="grid grid-cols-7 gap-1 mb-1">
            {weekDays.map(day => (
              <div
                key={day}
                className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-1"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfMonth }).map((_, index) => (
              <div key={`empty-${index}`} />
            ))}

            {days.map(day => {
              const currentDate = new Date(currentYear, currentMonth, day);
              const isToday =
                currentDate.toDateString() === today.toDateString();
              const isSelected =
                currentDate.toDateString() === date.toDateString();

              return (
                <button
                  key={day}
                  onClick={() => {
                    onSelect(currentDate);
                    onClose();
                  }}
                  className={`
                    flex h-8 w-8 items-center justify-center rounded-lg text-sm transition-all
                    hover:bg-gray-100 dark:hover:bg-gray-700
                    ${
                      isSelected
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : isToday
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                        : ''
                    }
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
        <div className="border-t dark:border-gray-700 p-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center text-sm"
            onClick={() => {
              onSelect(new Date());
              onClose();
            }}
          >
            {t('common:today')}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
