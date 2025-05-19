import { memo } from 'react';
import { Order } from '../../../../types';
import { AnalyticsChart } from '../../../../pages/dashboard/components/AnalyticsChart';
import { useTranslation } from 'react-i18next';

interface PaymentMethodStatsProps {
    orders: Order[];
    primaryColor?: string;
}

function PaymentMethodStatsComponent({ orders, primaryColor }: PaymentMethodStatsProps) {
    const { t } = useTranslation(['dashboard', 'common']);

    // Compute payment data
    const paymentMethods = orders.reduce((acc, order) => {
        // Extract payment method name or use a default if not available
        const methodName = order.paymentMethod?.name || t('dashboard:cash-payment');
        acc[methodName] = (acc[methodName] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <AnalyticsChart data={paymentMethods} primaryColor={primaryColor} />
        </div>
    );
}

// Use memo to prevent unnecessary re-renders
export const PaymentMethodStats = memo(PaymentMethodStatsComponent);
