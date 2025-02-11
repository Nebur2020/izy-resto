import { useState, useMemo } from 'react';
import { OrderList } from '../../../components/orders/OrderList';
import { OrderStats } from '../../../components/orders/OrderStats';
import { OrderFilters } from '../../../components/orders/OrderFilters';
import { OrderStatus } from '../../../types';
import { useOrders } from '../../../context/OrderContext';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { useTranslation } from 'react-i18next';

export function OrderManagement() {
  const { t } = useTranslation('common');
  const { orders, updateOrderStatus } = useOrders();
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [cancelConfirmation, setCancelConfirmation] = useState<{
    isOpen: boolean;
    orderId?: string;
  }>({ isOpen: false });

  const [searchTerm, setSearchTerm] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
  };

  const filteredOrders = useMemo(() => {
    return orders
      .filter(order => {
        if (statusFilter !== 'all' && order.status !== statusFilter) {
          return false;
        }

        if (dateRange.from || dateRange.to) {
          const orderDate = new Date(order.createdAt.seconds * 1000);
          if (dateRange.from && orderDate < dateRange.from) {
            return false;
          }
          if (dateRange.to && orderDate > dateRange.to) {
            return false;
          }
        }

        if (searchTerm.length > 0) {
          return (
            order.id.includes(searchTerm) ||
            order.customerName
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            order.customerEmail
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            order.customerPhone
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase())
          );
        }

        return true;
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [orders, statusFilter, dateRange, searchTerm]);

  // Calculate stats
  const stats = useMemo(
    () => ({
      total: filteredOrders.length,
      pending: filteredOrders.filter(o => o.status === 'pending').length,
      preparing: filteredOrders.filter(o => o.status === 'preparing').length,
      delivered: filteredOrders.filter(o => o.status === 'delivered').length,
    }),
    [filteredOrders]
  );

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, status);
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelConfirmation.orderId) return;

    try {
      await updateOrderStatus(cancelConfirmation.orderId, 'cancelled');
      setCancelConfirmation({ isOpen: false });
    } catch (error) {
      console.error('Error cancelling order:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <input
          type="text"
          value={searchTerm}
          onChange={handleChange}
          placeholder={t('menu:search-items')}
          className="w-full pl-12 pr-10 py-3 rounded-full border border-gray-200 dark:border-gray-700 
                   bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm
                   focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                   shadow-sm hover:shadow-md transition-shadow"
        />
      </div>
      <OrderStats stats={stats} />

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <OrderFilters
          currentFilter={statusFilter}
          onFilterChange={setStatusFilter}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
      </div>

      <OrderList
        orders={filteredOrders}
        onStatusChange={handleStatusChange}
        onCancel={orderId =>
          setCancelConfirmation({
            isOpen: true,
            orderId,
          })
        }
      />

      <ConfirmDialog
        isOpen={cancelConfirmation.isOpen}
        title={t('order:cancel-order')}
        message={t('common:cancel-confirmation')}
        confirmLabel={t('order:cancel-order')}
        cancelLabel={t('common:cancel')}
        onConfirm={handleCancelOrder}
        onCancel={() => setCancelConfirmation({ isOpen: false })}
      />
    </div>
  );
}
