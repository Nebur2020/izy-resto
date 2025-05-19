import React from 'react';
import { useTranslation } from 'react-i18next';
import { Clock } from 'lucide-react';
import { useSettings } from '../../../hooks';

interface HeatmapProps {
    data: number[];
    title: string;
    maxValue: number;
    labels: string[];
    icon?: React.ReactNode;
}

export const OrderTimeHeatmap: React.FC<HeatmapProps> = ({
    data,
    title,
    maxValue,
    labels,
    icon
}) => {
    const { settings } = useSettings();
    const primaryColor = settings?.palette.primary || '#3B82F6';
    const { t } = useTranslation('dashboard');

    // Find the peak value time
    let peakIndex = 0;
    let peakValue = 0;
    data.forEach((value, index) => {
        if (value > peakValue) {
            peakValue = value;
            peakIndex = index;
        }
    });

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center space-x-2 mb-4">
                {icon || <Clock className="h-5 w-5 text-gray-500" />}
                <h3 className="text-lg font-semibold">{title}</h3>
            </div>

            <div className="grid grid-cols-6 md:grid-cols-12 gap-2 mb-4">
                {data.map((value, index) => {
                    // Calculate opacity based on value
                    const opacity = maxValue > 0 ? (value / maxValue) : 0;

                    return (
                        <div key={index} className="flex flex-col items-center">
                            <div
                                className="w-full aspect-square rounded-md flex items-center justify-center relative mb-2 transition-all hover:scale-105"
                                style={{
                                    backgroundColor: `rgba(${parseInt(primaryColor.slice(1, 3), 16)}, ${parseInt(primaryColor.slice(3, 5), 16)}, ${parseInt(primaryColor.slice(5, 7), 16)}, ${opacity})`,
                                    minHeight: '30px'
                                }}
                            >
                                {value > 0 && (
                                    <span className="text-xs font-medium text-white">
                                        {value}
                                    </span>
                                )}
                                {index === peakIndex && value > 0 && (
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border-2 border-white dark:border-gray-800"></div>
                                )}
                            </div>
                            <span className="text-xs text-gray-500">{labels[index]}</span>
                        </div>
                    );
                })}
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-semibold">{t('peak-time')}: </span>
                    {labels[peakIndex]}
                    {peakValue > 0 ? ` (${peakValue} ${t('orders')})` : ` (${t('no-orders')})`}
                </p>
            </div>
        </div>
    );
};
