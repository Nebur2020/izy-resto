import { useState, useMemo } from 'react';
import { useIsMobile } from '../../../hooks/useIsMobile';
import { DateFilter } from '../../../components/dashboard/components/accounting/DateFilter';
import { ProductSalesStats } from '../../../components/dashboard/components/analytics/ProductSalesStats';
import { useOrdersExtended, useDebouncedValue } from '../../../hooks/useOrdersExtended';
import { Laptop, Clock, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../../../hooks';
import { OverviewSwitcher } from '../components/OverviewSwitcher';
import { calculateRetentionMetrics, getOrderDate } from '../../../utils/orderUtils';
import { LoadingState, ErrorState } from '../components/StaticComponents';
import { AnalyticsGrid as MemoizedAnalyticsGrid, EmptyState } from '../components/MemoizedAnalytics';
import { TimeChartsContainer } from '../components/MemoizedTimeCharts';
import { MemoizedOrderTimeHeatmap } from '../components/MemoizedOrderTimeHeatmap';
import { RevenueAndCustomerSection } from '../components/RevenueAndCustomerSection';

export function EnhancedOverview() {
    const isMobile = useIsMobile();
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().setHours(0, 0, 0, 0)),
        endDate: new Date(),
    });

    // Use debounced values to prevent excessive re-renders
    const debouncedStartDate = useDebouncedValue(dateRange.startDate, 300);
    const debouncedEndDate = useDebouncedValue(dateRange.endDate, 300);

    const { getDeliveredOrdersByDateRange, isLoading, error } = useOrdersExtended();
    const { t } = useTranslation(['dashboard', 'common']);

    const { settings } = useSettings();
    const primaryColor = settings?.palette.primary;    // Get filtered delivered orders using our new hook function
    const deliveredOrders = useMemo(() => {
        // Use debounced dates to prevent excessive filtering
        return getDeliveredOrdersByDateRange(debouncedStartDate, debouncedEndDate);
    }, [getDeliveredOrdersByDateRange, debouncedStartDate, debouncedEndDate]);

    // Calculate key analytics metrics
    const analytics = useMemo(() => {
        const daysDiff = Math.max(
            1,
            Math.ceil(
                (debouncedEndDate.getTime() - debouncedStartDate.getTime()) /
                (1000 * 60 * 60 * 24)
            )
        );

        const dailyOrderRate = deliveredOrders.length / daysDiff;

        // Extract valid subtotals for analysis
        const validSubtotals = deliveredOrders
            .map(order => {
                if (order.subtotal === undefined || order.subtotal === null) return null;
                const subtotal = typeof order.subtotal === 'string'
                    ? parseFloat(order.subtotal)
                    : order.subtotal;

                // Add additional validation for numeric values
                if (typeof subtotal !== 'number' || isNaN(subtotal) || subtotal < 0 || subtotal > 100000) {
                    console.warn('Invalid subtotal found:', subtotal, 'for order:', order.id);
                    return null;
                }

                return subtotal;
            })
            .filter(subtotal => subtotal !== null) as number[];

        // Calculate total revenue consistently with other views
        const totalRevenue = deliveredOrders.reduce((sum, order) => {
            // Safely access subtotal - handle strings or numbers
            const subtotal = typeof order.subtotal === 'string'
                ? parseFloat(order.subtotal)
                : (typeof order.subtotal === 'number' ? order.subtotal : 0);

            // Only add valid numbers
            return sum + (isNaN(subtotal) ? 0 : subtotal);
        }, 0);

        // Calculate the average order value (simple approach - total divided by count)
        const avgOrderValue = deliveredOrders.length > 0
            ? totalRevenue / deliveredOrders.length
            : 0;

        // Calculate customer retention rate using our utility function
        const retentionMetrics = calculateRetentionMetrics(deliveredOrders);

        return {
            totalRevenue,
            totalOrders: deliveredOrders.length,
            uniqueCustomers: retentionMetrics.totalCustomers,
            dailyOrderRate: Math.round(dailyOrderRate * 10) / 10,
            avgOrderValue: Math.round(avgOrderValue * 100) / 100,
            retentionRate: retentionMetrics.retentionRate,
        };
    }, [deliveredOrders, debouncedStartDate, debouncedEndDate]);

    // Get detailed time analysis
    const timeAnalysis = useMemo(() => {
        // Group orders by hour of day
        const hourDistribution = Array(24).fill(0);
        // Group orders by day of week (0 = Sunday, 6 = Saturday)
        const dayDistribution = Array(7).fill(0);

        deliveredOrders.forEach(order => {
            try {
                const orderDate = getOrderDate(order);
                const hour = orderDate.getHours();
                const day = orderDate.getDay();

                hourDistribution[hour]++;
                dayDistribution[day]++;
            } catch (err) {
                console.error('Error processing order date for time analysis:', err, order);
            }
        });

        // Find peak hour
        let peakHour = 0;
        let peakHourValue = 0;
        hourDistribution.forEach((count, hour) => {
            if (count > peakHourValue) {
                peakHourValue = count;
                peakHour = hour;
            }
        });

        // Find peak day
        let peakDay = 0;
        let peakDayValue = 0;
        dayDistribution.forEach((count, day) => {
            if (count > peakDayValue) {
                peakDayValue = count;
                peakDay = day;
            }
        });

        const dayNames = [
            t('common:days.sunday'),
            t('common:days.monday'),
            t('common:days.tuesday'),
            t('common:days.wednesday'),
            t('common:days.thursday'),
            t('common:days.friday'),
            t('common:days.saturday')
        ];

        // Create abbreviated day names from translations
        const shortDayNames = [
            t('dashboard:short-days.sunday'),
            t('dashboard:short-days.monday'),
            t('dashboard:short-days.tuesday'),
            t('dashboard:short-days.wednesday'),
            t('dashboard:short-days.thursday'),
            t('dashboard:short-days.friday'),
            t('dashboard:short-days.saturday')
        ];

        return {
            hourDistribution,
            dayDistribution,
            peakHour,
            peakDay,
            peakDayName: dayNames[peakDay],
            shortDayNames,
            hourData: hourDistribution.map((value, hour) => ({
                hour: hour,
                count: value,
                label: `${hour < 10 ? '0' + hour : hour}:00`
            })),
            dayData: dayDistribution.map((value, day) => ({
                day,
                count: value,
                label: shortDayNames[day] // Use abbreviated names for chart labels
            }))
        };
    }, [deliveredOrders, t]);

    if (isLoading) {
        return <LoadingState />;
    }

    if (error) {
        return <ErrorState error={error} />;
    }

    if (isMobile) {
        return (
            <div className="p-4 space-y-6">
                <div className="text-center bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                    <Laptop className="w-12 h-12 mx-auto text-blue-500 mb-4" />
                    <h2 className="text-xl font-semibold mb-2">
                        {t('limit-view-on-mobile')}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {t('best-experience')}
                    </p>
                </div>
                <MemoizedAnalyticsGrid
                    totalRevenue={analytics.totalRevenue}
                    avgOrderValue={analytics.avgOrderValue}
                    totalOrders={analytics.totalOrders}
                    dailyOrderRate={analytics.dailyOrderRate}
                    uniqueCustomers={analytics.uniqueCustomers}
                    retentionRate={analytics.retentionRate}
                    primaryColor={primaryColor}
                />
                <ProductSalesStats orders={deliveredOrders} />
                <RevenueAndCustomerSection
                    deliveredOrders={deliveredOrders}
                    dateRange={{
                        startDate: debouncedStartDate,
                        endDate: debouncedEndDate
                    }}
                />
            </div>
        );
    }

    return (
        <div className="space-y-6 p-4 sm:p-6">
            <OverviewSwitcher />
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    {t('delivered-orders-dashboard')}
                </h2>
                <DateFilter
                    startDate={dateRange.startDate}
                    endDate={dateRange.endDate}
                    onDateChange={(start, end) =>
                        setDateRange({ startDate: start, endDate: end })
                    }
                />
            </div>

            {deliveredOrders.length === 0 ? (
                <EmptyState primaryColor={primaryColor} />
            ) : (
                <>
                    {/* Enhanced Analytics Grid */}
                    <MemoizedAnalyticsGrid
                        totalRevenue={analytics.totalRevenue}
                        avgOrderValue={analytics.avgOrderValue}
                        totalOrders={analytics.totalOrders}
                        dailyOrderRate={analytics.dailyOrderRate}
                        uniqueCustomers={analytics.uniqueCustomers}
                        retentionRate={analytics.retentionRate}
                        primaryColor={primaryColor}
                    />

                    {/* Time Analysis Charts - Using Memoized Component */}
                    <TimeChartsContainer
                        hourData={timeAnalysis.hourData}
                        dayData={timeAnalysis.dayData}
                        peakHour={timeAnalysis.peakHour}
                        hourDistribution={timeAnalysis.hourDistribution}
                        peakDay={timeAnalysis.peakDay}
                        peakDayName={timeAnalysis.peakDayName}
                        dayDistribution={timeAnalysis.dayDistribution}
                        primaryColor={primaryColor}
                    />

                    {/* Hourly Heatmap */}
                    <MemoizedOrderTimeHeatmap
                        data={timeAnalysis.hourDistribution}
                        title={t('hourly-heatmap')}
                        maxValue={Math.max(...timeAnalysis.hourDistribution)}
                        labels={Array.from({ length: 24 }, (_, i) => `${i < 10 ? '0' + i : i}:00`)}
                        icon={<Clock className="h-5 w-5 text-gray-500" />}
                        primaryColor={primaryColor}
                    />

                    {/* Day of Week Heatmap */}
                    <MemoizedOrderTimeHeatmap
                        data={timeAnalysis.dayDistribution}
                        title={t('weekly-heatmap')}
                        maxValue={Math.max(...timeAnalysis.dayDistribution)}
                        labels={timeAnalysis.shortDayNames}
                        icon={<Calendar className="h-5 w-5 text-gray-500" />}
                        primaryColor={primaryColor}
                    />

                    {/* Products and Revenue */}
                    <ProductSalesStats orders={deliveredOrders} />

                    {/* Revenue and Customer Section - Using Memoized Component */}
                    <RevenueAndCustomerSection
                        deliveredOrders={deliveredOrders}
                        dateRange={{
                            startDate: debouncedStartDate,
                            endDate: debouncedEndDate
                        }}
                        primaryColor={primaryColor}
                    />
                </>
            )}
        </div>
    );
}
