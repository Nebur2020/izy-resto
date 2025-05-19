import { memo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, CreditCard, Package, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../../utils/currency';
import { useSettings } from '../../../hooks';

interface AnalyticCardProps {
    title: string;
    value: string | number;
    subtitle: string;
    icon: React.ReactNode;
    primaryColor?: string;
    delay?: number;
}

function AnalyticCardComponent({
    title,
    value,
    subtitle,
    icon,
    primaryColor = '#3B82F6',
    delay = 0.1
}: AnalyticCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
        >
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
                    <h3 className="text-2xl font-bold mt-1">{value}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {subtitle}
                    </p>
                </div>
                <div
                    style={{ backgroundColor: primaryColor, opacity: 0.1 }}
                    className="p-3 rounded-full"
                >
                    {icon}
                </div>
            </div>
        </motion.div>
    );
}

interface AnalyticsGridProps {
    totalRevenue: number;
    avgOrderValue: number;
    totalOrders: number;
    dailyOrderRate: number;
    uniqueCustomers: number;
    retentionRate: number;
    primaryColor?: string;
}

function AnalyticsGridComponent({
    totalRevenue,
    avgOrderValue,
    totalOrders,
    dailyOrderRate,
    uniqueCustomers,
    retentionRate,
    primaryColor = '#3B82F6'
}: AnalyticsGridProps) {
    const { t } = useTranslation(['dashboard', 'common']);
    const { settings } = useSettings();
    const currency = settings?.currency;

    // Using avgOrderValue directly without capping
    const safeAvgOrderValue = avgOrderValue;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <AnalyticCard
                title={t('common:total-income')}
                value={formatCurrency(totalRevenue, currency)}
                subtitle={t('from-delivered-orders')}
                icon={<TrendingUp size={24} style={{ color: primaryColor }} />}
                primaryColor={primaryColor}
                delay={0.1}
            />

            <AnalyticCard
                title={t('avg-order-value')}
                value={formatCurrency(safeAvgOrderValue, currency)}
                subtitle={t('per-delivered-order')}
                icon={<CreditCard size={24} style={{ color: primaryColor }} />}
                primaryColor={primaryColor}
                delay={0.2}
            />

            <AnalyticCard
                title={t('delivered-orders')}
                value={totalOrders}
                subtitle={`${dailyOrderRate} ${t('common:orders')} / ${t('common:day')}`}
                icon={<Package size={24} style={{ color: primaryColor }} />}
                primaryColor={primaryColor}
                delay={0.3}
            />

            <AnalyticCard
                title={t('customer-retention')}
                value={`${retentionRate}%`}
                subtitle={`${uniqueCustomers} ${t('unique-customers')}`}
                icon={<Users size={24} style={{ color: primaryColor }} />}
                primaryColor={primaryColor}
                delay={0.4}
            />
        </div>
    );
}

interface EmptyStateProps {
    primaryColor?: string;
}

function EmptyStateComponent({ primaryColor = '#3B82F6' }: EmptyStateProps) {
    const { t } = useTranslation(['dashboard', 'order', 'common']);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm text-center">
            <div
                className={`w-16 h-16 mx-auto mb-4 rounded-full dark:bg-blue-900/30 flex items-center justify-center`}
                style={{ backgroundColor: primaryColor, opacity: 0.5 }}
            >
                <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">
                {t('order:no-orders-found')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
                {t('common:try-different-date-range')}
            </p>
        </div>
    );
}

// Export memoized components
const AnalyticCard = memo(AnalyticCardComponent);
export const AnalyticsGrid = memo(AnalyticsGridComponent);
export const EmptyState = memo(EmptyStateComponent);
