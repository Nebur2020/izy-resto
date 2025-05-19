import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { LayoutDashboard, BarChart2 } from 'lucide-react';
import { useSettings } from '../../../hooks';
import { useMemo } from 'react';

export function OverviewSwitcher() {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation('dashboard');
    const { settings } = useSettings();
    const primaryColor = settings?.palette.primary || '#3B82F6';

    // Memoize these values to prevent unnecessary re-renders
    const { isEnhanced, isStandard } = useMemo(() => ({
        isEnhanced: location.pathname === '/dashboard/enhanced',
        isStandard: location.pathname === '/dashboard',
    }), [location.pathname]);

    return (
        <div className="flex justify-end mb-6">
            <div className="inline-flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                <button
                    onClick={() => navigate('/dashboard')}
                    className={`relative flex items-center px-3 py-2 text-sm font-medium rounded-md ${isStandard
                            ? 'text-white'
                            : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                        }`}
                    type="button"
                >
                    {isStandard && (
                        <motion.div
                            layoutId="overview-tab"
                            className="absolute inset-0 rounded-md z-0"
                            style={{ backgroundColor: primaryColor }}
                            transition={{ type: 'spring', duration: 0.5 }}
                        />
                    )}
                    <LayoutDashboard className="w-4 h-4 mr-2 relative z-10" />
                    <span className="relative z-10">{t('overview')}</span>
                </button>

                <button
                    onClick={() => navigate('/dashboard/enhanced')}
                    className={`relative flex items-center px-3 py-2 text-sm font-medium rounded-md ${isEnhanced
                            ? 'text-white'
                            : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                        }`}
                    type="button"
                >
                    {isEnhanced && (
                        <motion.div
                            layoutId="overview-tab"
                            className="absolute inset-0 rounded-md z-0"
                            style={{ backgroundColor: primaryColor }}
                            transition={{ type: 'spring', duration: 0.5 }}
                        />
                    )}
                    <BarChart2 className="w-4 h-4 mr-2 relative z-10" />
                    <span className="relative z-10">{t('enhanced-overview')}</span>
                </button>
            </div>
        </div>
    );
}
