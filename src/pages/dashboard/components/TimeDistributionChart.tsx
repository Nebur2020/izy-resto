import { motion } from 'framer-motion';
import { hexToRgba } from '../../../utils/colorUtils';

interface TimeDistributionChartProps {
    data: Record<string, number>;
    primaryColor?: string;
}

export function TimeDistributionChart({ data, primaryColor = '#3B82F6' }: TimeDistributionChartProps) {
    const entries = Object.entries(data);
    const maxValue = Math.max(...Object.values(data), 1); // Prevent division by zero

    // Use different display strategies based on number of entries
    const displayEntries = entries;

    return (
        <div className="grid grid-cols-12 gap-0.5 md:gap-1 h-full">
            {displayEntries.map(([label, value]) => {
                // Calculate bar height as percentage of max value
                const heightPercentage = Math.max(3, Math.min(95, (value / maxValue) * 95));
                const opacity = Math.max(0.2, Math.min(0.9, value / maxValue));

                return (
                    <div key={label} className="flex flex-col items-center justify-end h-full">
                        <div className="w-full flex flex-col justify-end h-[85%]">
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${heightPercentage}%` }}
                                transition={{ duration: 0.5, ease: 'easeOut' }}
                                className="rounded-t-sm w-full"
                                style={{
                                    backgroundColor: hexToRgba(primaryColor, opacity),
                                    minHeight: value > 0 ? '4px' : '0'
                                }}
                            />
                        </div>
                        <div className="h-[15%] flex items-start justify-center mt-1">
                            <span className="text-[9px] sm:text-xs text-gray-500 w-full text-center max-w-full overflow-hidden whitespace-nowrap">
                                {label}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

