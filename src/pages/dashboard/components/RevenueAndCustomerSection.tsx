import { memo } from 'react';
import { motion } from 'framer-motion';
import { RevenueDetails } from '../../../components/dashboard/RevenueDetails';
import { PaymentMethodStats } from '../../../components/dashboard/components/analytics/MemoizedPaymentMethodStats';
import { PaginatedRecentOrders } from '../../../components/dashboard/PaginatedRecentOrders';
import { PaginatedCustomerList } from '../../../components/dashboard/PaginatedCustomerList';
import { useTranslation } from 'react-i18next';
import { Order } from '../../../types';

interface RevenueAndCustomerSectionProps {
    deliveredOrders: Order[];
    dateRange: {
        startDate: Date;
        endDate: Date;
    };
    primaryColor?: string;
}

function RevenueAndCustomerSectionComponent({
    deliveredOrders,
    dateRange,
    primaryColor
}: RevenueAndCustomerSectionProps) {
    const { t } = useTranslation(['dashboard', 'common']);

    return (
        <>
            {/* Products and Revenue */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
                >
                    <h3 className="text-lg font-semibold mb-4">{t('income')}</h3>
                    <RevenueDetails
                        orders={deliveredOrders}
                        dateRange={{
                            startDate: dateRange.startDate,
                            endDate: dateRange.endDate
                        }}
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
                >
                    <h3 className="text-lg font-semibold mb-4">
                        {t('payment-method-distribution')}
                    </h3>
                    <PaymentMethodStats orders={deliveredOrders} primaryColor={primaryColor} />
                </motion.div>
            </div>

            {/* Customer Data */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm lg:col-span-1"
                >
                    <h3 className="text-lg font-semibold mb-4">
                        {t('recent-orders')}
                    </h3>
                    <PaginatedRecentOrders
                        orders={deliveredOrders}
                        itemsPerPage={5}
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm lg:col-span-1"
                >
                    <h3 className="text-lg font-semibold mb-4">
                        {t('best-customer')}
                    </h3>
                    <PaginatedCustomerList
                        orders={deliveredOrders.filter(order => !!order.customerPhone)}
                        itemsPerPage={5}
                    />
                </motion.div>
            </div>
        </>
    );
}

// Export memoized component
export const RevenueAndCustomerSection = memo(RevenueAndCustomerSectionComponent);
