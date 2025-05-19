import { useState, useCallback, useMemo } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '../../../ui/Button';
import { DatePicker } from '../../../ui/DatePicker';
import { format } from 'date-fns';
import { fr, enUS as en } from 'date-fns/locale';
import { Language } from '../../../../types';
import { useIsMobile } from '../../../../hooks/useIsMobile';
import { useTranslation } from 'react-i18next';

interface IDateFilterProps {
  startDate: Date;
  endDate: Date;
  onDateChange: (start: Date, end: Date) => void;
}

export function DateFilter(props: IDateFilterProps) {
  const { startDate, endDate, onDateChange } = props;
  const { t, i18n } = useTranslation();
  const [isStartPickerOpen, setIsStartPickerOpen] = useState(false);
  const [isEndPickerOpen, setIsEndPickerOpen] = useState(false);
  const isMobile = useIsMobile();
  const lng = i18n.language as Language;

  const localesMap: Record<Language, Locale> = {
    en: en,
    fr: fr,
  };

  const locale = localesMap[lng] || fr;

  const formattedStartedDate = format(startDate, 'dd MMM yyyy', { locale });
  const formattedEndDate = format(endDate, 'dd MMM yyyy', { locale });

  const presets = [
    { label: t('common:today'), days: 0 },
    { label: isMobile ? '7j' : t('common:last-week'), days: 7 },
    { label: isMobile ? '30j' : t('common:last-month'), days: 30 },
  ];

  // Function to ensure consistent date normalization
  const normalizeDate = useCallback((date: Date, isEndOfDay = false): Date => {
    const normalized = new Date(date);
    if (isEndOfDay) {
      // For end date, set time to end of day (23:59:59.999)
      normalized.setHours(23, 59, 59, 999);
    } else {
      // For start date, set time to beginning of day (00:00:00.000)
      normalized.setHours(0, 0, 0, 0);
    }
    return normalized;
  }, []);

  // Enhanced date selection handlers with proper normalization
  const handleStartDateSelect = useCallback((date: Date) => {
    const normalizedDate = normalizeDate(date);
    onDateChange(normalizedDate, endDate);
    setIsStartPickerOpen(false);
  }, [onDateChange, endDate, normalizeDate]);

  const handleEndDateSelect = useCallback((date: Date) => {
    const normalizedDate = normalizeDate(date, true);
    onDateChange(startDate, normalizedDate);
    setIsEndPickerOpen(false);
  }, [onDateChange, startDate, normalizeDate]);

  // Enhanced preset handler with proper time normalization
  const handlePresetClick = useCallback((days: number) => {
    const end = normalizeDate(new Date(), true);
    const start = new Date();

    if (days > 0) {
      start.setDate(start.getDate() - days);
    }

    const normalizedStart = normalizeDate(start);
    onDateChange(normalizedStart, end);
  }, [onDateChange, normalizeDate]);

  return (
    <div className="w-full sm:w-auto relative">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="flex items-center gap-2 order-2 sm:order-1">
          {presets.map(preset => (
            <Button
              key={preset.days}
              variant="secondary"
              size="sm"
              onClick={() => handlePresetClick(preset.days)}
              className="flex-1 sm:flex-initial text-xs sm:text-sm px-2 sm:px-3"
            >
              {preset.label}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2 order-1 sm:order-2">
          <div className="relative flex-1 sm:flex-initial">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setIsEndPickerOpen(false);
                setIsStartPickerOpen(true);
              }}
              className="w-full sm:w-[140px] justify-start text-xs sm:text-sm"
            >
              <CalendarIcon className="mr-2 h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
              {formattedStartedDate}
            </Button>

            {isStartPickerOpen && (
              <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
                <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl p-4 max-w-fit mx-auto">
                  <div className="flex justify-end mb-4 -mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsStartPickerOpen(false)}
                    >
                      ✕
                    </Button>
                  </div>
                  <DatePicker
                    date={startDate}
                    onSelect={handleStartDateSelect}
                    isOpen={isStartPickerOpen}
                    onClose={() => setIsStartPickerOpen(false)}
                    position="bottom"
                  />
                </div>
              </div>
            )}
          </div>

          <span className="text-gray-500 dark:text-gray-400">
            {lng === 'fr' ? 'à' : 'to'}
          </span>

          <div className="relative flex-1 sm:flex-initial">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setIsStartPickerOpen(false);
                setIsEndPickerOpen(true);
              }}
              className="w-full sm:w-[140px] justify-start text-xs sm:text-sm"
            >
              <CalendarIcon className="mr-2 h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
              {formattedEndDate}
            </Button>
            {isEndPickerOpen && (
              <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
                <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl p-4 max-w-fit mx-auto">
                  <div className="flex justify-end mb-4 -mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEndPickerOpen(false)}
                      className=" top-2 right-2"
                    >
                      ✕
                    </Button>
                  </div>
                  <DatePicker
                    date={endDate}
                    onSelect={handleEndDateSelect}
                    isOpen={isEndPickerOpen}
                    onClose={() => setIsEndPickerOpen(false)}
                    position="bottom"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
