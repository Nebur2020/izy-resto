import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  AlertCircle,
  ArrowLeft,
  RefreshCw,
  Mail,
  Phone,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useSettings } from '../../hooks';

interface TemporaryUnavailableProps {
  title?: string;
  message?: string;
  estimatedTime?: string;
  showBackButton?: boolean;
  showRefreshButton?: boolean;
  redirectPath?: string;
  primaryColor?: string;
}

export function TemporaryUnavailable({
  title,
  message,
  estimatedTime,
  showBackButton = true,
  showRefreshButton = true,
  redirectPath = '/',
  primaryColor = '#fcb302', // Default primary color
}: TemporaryUnavailableProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState<number | null>(null);
  const { settings } = useSettings();
  //   const primaryColor = settings?.palette.primary || primaryColorVar;

  // Initialize countdown if estimatedTime is a number (minutes)
  // Initialize countdown if estimatedTime is a number (minutes), default to 24 hours
  useEffect(() => {
    if (estimatedTime && !isNaN(Number(estimatedTime))) {
      const minutes = Number(estimatedTime);
      setCountdown(minutes * 60);
    } else {
      // Default to 24 hours (1440 minutes)
      setCountdown(1440 * 60);
    }
  }, [estimatedTime]);

  //   console.log('estimatedTime', countdown);

  // Countdown timer
  useEffect(() => {
    if (countdown === null || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown(prev => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  // Format countdown as MM:SS
  const formatCountdown = () => {
    if (countdown === null) return '';
    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleBack = () => {
    navigate(redirectPath);
  };

  // Style objects
  const primaryColorStyle = {
    color: primaryColor,
  };

  const primaryBackgroundStyle = {
    backgroundColor: primaryColor,
  };

  const primaryBorderStyle = {
    borderColor: primaryColor,
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden"
      >
        <div className="h-2 w-full" style={primaryBackgroundStyle} />

        <div className="p-6 sm:p-8">
          <div className="flex flex-col items-center text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: `${primaryColor}20` }}
            >
              <Clock className="w-8 h-8" style={primaryColorStyle} />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {title || t('common:temporarily-unavailable')}
            </h1>

            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {message || t('common:temporarily-unavailable-message')}
            </p>

            {estimatedTime && (
              <div className="mb-6 w-full">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {estimatedTime
                      ? t('common:estimated-time')
                      : t('common:estimated-completion')}
                  </span>
                </div>

                <div
                  className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 text-center"
                  style={{ borderLeft: `4px solid ${primaryColor}` }}
                >
                  {countdown !== null ? (
                    <span
                      className="font-mono text-lg font-bold"
                      style={primaryColorStyle}
                    >
                      {formatCountdown()}
                    </span>
                  ) : (
                    <span className="font-medium" style={primaryColorStyle}>
                      {estimatedTime} {t('common:minutes')}
                    </span>
                  )}
                </div>
                {countdown !== null && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                    {t('common:remaining-time')}
                  </p>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              {showBackButton && (
                <Button variant="ghost" onClick={handleBack} className="flex-1">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t('common:back')}
                </Button>
              )}

              {showRefreshButton && (
                <Button
                  variant="primary"
                  onClick={handleRefresh}
                  className="flex-1 text-white"
                  style={primaryBackgroundStyle}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {t('common:refresh')}
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {(settings?.email || settings?.phone) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-8 text-sm text-gray-500 dark:text-gray-400 text-center"
        >
          <p className="mb-2">{t('common:if-problem-persists')}</p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {settings?.email && (
              <Link
                to={`mailto:${settings.email}`}
                className="font-medium hover:underline transition-colors flex items-center"
                style={primaryColorStyle}
              >
                <Mail className="w-4 h-4 mr-2" />
                {settings.email}
              </Link>
            )}

            {settings?.phone && (
              <Link
                to={`tel:${settings.phone}`}
                className="font-medium hover:underline transition-colors flex items-center"
                style={primaryColorStyle}
              >
                <Phone className="w-4 h-4 mr-2" />
                {settings.phone}
              </Link>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
