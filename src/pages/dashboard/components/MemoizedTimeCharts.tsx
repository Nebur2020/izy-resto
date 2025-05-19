import { memo } from 'react';
import { motion } from 'framer-motion';
import { TimeDistributionChart } from './TimeDistributionChart';
import { useTranslation } from 'react-i18next';

interface TimeChartProps {
    title: string;
    data: Record<string, number>;
    peakLabel: string;
    peakValue: string;
    primaryColor?: string;
}

function TimeChartComponent({ title, data, peakLabel, peakValue, primaryColor }: TimeChartProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm"
        >
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">{title}</h3>
            <div className="h-48 sm:h-64">
                <TimeDistributionChart data={data} primaryColor={primaryColor} />
            </div>
            <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-semibold">{peakLabel}: </span>
                    <span className="break-words hyphens-auto">{peakValue}</span>
                </p>
            </div>
        </motion.div>
    );
}

interface TimeChartsContainerProps {
    hourData: Array<{ label: string, count: number }>;
    dayData: Array<{ label: string, count: number }>;
    peakHour: number;
    hourDistribution: number[];
    peakDay: number;
    peakDayName: string;
    dayDistribution: number[];
    primaryColor?: string;
}

function TimeChartsContainerComponent({
    hourData,
    dayData,
    peakHour,
    hourDistribution,
    peakDay,
    peakDayName,
    dayDistribution,
    primaryColor
}: TimeChartsContainerProps) {
    const { t } = useTranslation(['dashboard', 'common']);

    // Convert data to the format expected by AnalyticsChart
    const hourChartData = Object.fromEntries(
        hourData.map(item => [item.label, item.count])
    );

    const dayChartData = Object.fromEntries(
        dayData.map(item => [item.label, item.count])
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TimeChart
                title={t('hourly-order-distribution')}
                data={hourChartData}
                peakLabel={t('peak-hour')}
                peakValue={`${peakHour}:00 - ${peakHour + 1}:00 (${hourDistribution[peakHour]} ${hourDistribution[peakHour] <= 1 ? t('order-singular') : t('orders-plural')})`}
                primaryColor={primaryColor}
            />

            <TimeChart
                title={t('weekly-order-distribution')}
                data={dayChartData}
                peakLabel={t('peak-day')}
                peakValue={`${peakDayName} (${dayDistribution[peakDay]} ${dayDistribution[peakDay] <= 1 ? t('order-singular') : t('orders-plural')})`}
                primaryColor={primaryColor}
            />
        </div>
    );
}

// Export memoized components
const TimeChart = memo(TimeChartComponent);
export const TimeChartsContainer = memo(TimeChartsContainerComponent);
