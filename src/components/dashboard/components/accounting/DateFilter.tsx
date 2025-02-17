import { useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '../../../ui/Button';
import { DatePicker } from '../../../ui/DatePicker';
import { format } from 'date-fns';
import { fr, enUS as en } from 'date-fns/locale';
import { useIsMobile } from '../../../../hooks/useIsMobile';
import { useTranslation } from 'react-i18next';
import { Language } from '../../../../types';

interface DateFilterProps {
  startDate: Date;
  endDate: Date;
  onDateChange: (start: Date, end: Date) => void;
}

export function DateFilter({
  startDate,
  endDate,
  onDateChange,
}: DateFilterProps) {
  const [isStartPickerOpen, setIsStartPickerOpen] = useState(false);
  const [isEndPickerOpen, setIsEndPickerOpen] = useState(false);
  const isMobile = useIsMobile();
  const { t, i18n } = useTranslation('common');
  const lng = i18n.language as Language;

  const localesMap: Record<Language, Locale> = {
    en: en,
    fr: fr,
  };

  const locale = localesMap[lng] || fr;

  const formattedStartedDate = format(startDate, 'dd MMM yyyy', { locale });
  const formattedEndDate = format(endDate, 'dd MMM yyyy', { locale });

  const presets = [
    { label: t('today'), days: 0 },
    { label: isMobile ? '7j' : t('last-week'), days: 7 },
    { label: isMobile ? '30j' : t('last-month'), days: 30 },
  ];

  const handlePresetClick = (days: number) => {
    const end = new Date();
    const start = new Date();
    if (days > 0) {
      start.setDate(start.getDate() - days);
    } else {
      start.setHours(0, 0, 0, 0);
    }
    onDateChange(start, end);
  };

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
                    onSelect={date => {
                      onDateChange(date, endDate);
                      setIsStartPickerOpen(false);
                    }}
                    isOpen={isStartPickerOpen}
                    onClose={() => setIsStartPickerOpen(false)}
                    position="center"
                  />
                </div>
              </div>
            )}
          </div>

          <span className="text-gray-500 dark:text-gray-400">
            {lng === 'en' ? 'to' : 'à'}
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
                    onSelect={date => {
                      onDateChange(startDate, date);
                      setIsEndPickerOpen(false);
                    }}
                    isOpen={isEndPickerOpen}
                    onClose={() => setIsEndPickerOpen(false)}
                    position="center"
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
