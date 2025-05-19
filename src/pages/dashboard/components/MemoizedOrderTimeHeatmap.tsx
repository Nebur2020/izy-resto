import { memo } from 'react';
import { motion } from 'framer-motion';
import { hexToRgba } from '../../../utils/colorUtils';
import { useTranslation } from 'react-i18next';

interface OrderTimeHeatmapProps {
    data: number[];
    title: string;
    maxValue: number;
    labels: string[];
    icon: React.ReactNode;
    primaryColor?: string;
}

function OrderTimeHeatmapComponent({
    data,
    title,
    maxValue,
    labels,
    icon,
    primaryColor = '#3B82F6'
}: OrderTimeHeatmapProps) {
    const { t } = useTranslation(['dashboard']);

    const getColorIntensity = (value: number) => {
        if (maxValue === 0) return 0.1; // Handle case with no data
        const intensity = Math.max(0.1, Math.min(0.9, value / maxValue));
        return intensity;
    };

    // Get text color based on intensity
    const getTextColor = (value: number) => {
        if (value === 0) return 'text-gray-500';
        const intensity = getColorIntensity(value);
        return intensity > 0.5 ? 'text-white' : 'text-gray-800';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm"
        >
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
                {icon}
                <h3 className="text-base sm:text-lg font-semibold">{title}</h3>
            </div>

            <div className="grid grid-cols-6 md:grid-cols-12 gap-1 md:gap-2">
                {data.map((value, index) => (
                    <div key={index} className="flex flex-col items-center">
                        <div
                            className={`w-full aspect-square rounded-md flex items-center justify-center text-xs font-semibold ${getTextColor(value)}`}
                            style={{
                                backgroundColor: hexToRgba(primaryColor, getColorIntensity(value)),
                                boxShadow: value > 0 ? '0 1px 2px rgba(0, 0, 0, 0.1)' : 'none'
                            }}
                        >
                            {value}
                        </div>
                        <span className="text-[9px] md:text-xs mt-1 text-gray-500 text-center max-w-full overflow-hidden whitespace-nowrap">
                            {labels[index]}
                        </span>
                    </div>
                ))}
            </div>

            {maxValue === 0 && (
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg text-center text-sm text-gray-500">
                    {t('no-data-available')}
                </div>
            )}
        </motion.div>
    );
}

// Export memoized component
export const MemoizedOrderTimeHeatmap = memo(OrderTimeHeatmapComponent);
