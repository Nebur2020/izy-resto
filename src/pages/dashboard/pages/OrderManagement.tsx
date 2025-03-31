import { useState, useMemo, useEffect, useRef } from 'react';
import { OrderList } from '../../../components/orders/OrderList';
import { OrderStats } from '../../../components/orders/OrderStats';
import { OrderFilters } from '../../../components/orders/OrderFilters';
import { Order, OrderStatus } from '../../../types';
import { useOrders } from '../../../context/OrderContext';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { useTranslation } from 'react-i18next';
import { Search, RefreshCw, X } from 'lucide-react';
import LoadMoreButton from '../../../components/ui/LoadMoreButton';

export function OrderManagement() {
  const { t } = useTranslation();
  const {
    orders,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMoreOrders,
    updateOrderStatus,
    searchOrders,
    refreshOrders,
  } = useOrders();

  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [cancelConfirmation, setCancelConfirmation] = useState<{
    isOpen: boolean;
    orderId?: string;
  }>({ isOpen: false });

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Order[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const seenOrderIdsRef = useRef<Set<string>>(new Set());
  const isFirstLoadRef = useRef(true);

  useEffect(() => {
    refreshOrders();
  }, []);

  useEffect(() => {
    if (isLoading || isSearching || orders.length === 0) return;

    if (isFirstLoadRef.current) {
      orders.forEach(order => {
        seenOrderIdsRef.current.add(order.id);
      });
      isFirstLoadRef.current = false;
      return;
    }

    const newOrders = orders.filter(
      order => !seenOrderIdsRef.current.has(order.id)
    );

    if (newOrders.length > 0) {
      newOrders.forEach(order => {
        seenOrderIdsRef.current.add(order.id);
      });
    }
  }, [orders, isLoading, isSearching]);

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchTerm.trim() !== '') {
        performSearch(searchTerm);
      } else {
        setIsSearching(false);
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

  const performSearch = async (term: string) => {
    if (term.trim().length < 2) return;

    setSearchLoading(true);
    setIsSearching(true);

    try {
      const results = await searchOrders(term);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching orders:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setIsSearching(false);
    setSearchResults([]);
  };

  const displayedOrders = useMemo(() => {
    const ordersToFilter = isSearching ? searchResults : orders;

    const fromDate = dateRange.from;
    const toDate = dateRange.to;
    let endDate: Date | undefined;

    if (toDate) {
      endDate = new Date(toDate);
      endDate.setHours(23, 59, 59, 999);
    }

    return ordersToFilter
      .filter(order => {
        if (statusFilter === 'all' && !fromDate && !toDate) {
          return true;
        }

        if (statusFilter !== 'all' && order.status !== statusFilter) {
          return false;
        }

        if (fromDate || endDate) {
          const orderTimestamp =
            order.createdAt?.seconds ||
            (order.createdAt instanceof Date
              ? order.createdAt.getTime() / 1000
              : new Date(order.createdAt).getTime() / 1000);

          const orderDate = new Date(orderTimestamp * 1000);

          if (fromDate && orderDate < fromDate) {
            return false;
          }
          if (endDate && orderDate > endDate) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        const getTimestamp = (order: Order) => {
          if (order.createdAt?.seconds) return order.createdAt.seconds;
          if (order.createdAt instanceof Date)
            return order.createdAt.getTime() / 1000;
          return new Date(order.createdAt).getTime() / 1000;
        };

        return getTimestamp(b) - getTimestamp(a);
      });
  }, [orders, searchResults, isSearching, statusFilter, dateRange]);

  const stats = useMemo(
    () => ({
      total: displayedOrders.length,
      pending: displayedOrders.filter(o => o.status === 'pending').length,
      preparing: displayedOrders.filter(o => o.status === 'preparing').length,
      delivered: displayedOrders.filter(o => o.status === 'delivered').length,
      cancelled: displayedOrders.filter(o => o.status === 'cancelled').length,
    }),
    [displayedOrders]
  );

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, status);

      if (isSearching && searchTerm) {
        performSearch(searchTerm);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelConfirmation.orderId) return;

    try {
      await updateOrderStatus(cancelConfirmation.orderId, 'cancelled');
      setCancelConfirmation({ isOpen: false });

      if (isSearching && searchTerm) {
        performSearch(searchTerm);
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder={t('order:search-orders')}
              className="w-full pl-12 pr-10 py-3 rounded-full border border-gray-200 dark:border-gray-700 
                      bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm
                      focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                      shadow-sm hover:shadow-md transition-shadow"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          {isSearching && (
            <div className="mt-2 text-sm text-blue-600 dark:text-blue-400">
              {searchLoading ? (
                <span className="flex items-center">
                  <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
                  {t('order:searching')}
                </span>
              ) : (
                <span>
                  {t('common:search-results', { count: searchResults.length })}
                </span>
              )}
            </div>
          )}
        </div>
        <div>
          <button
            onClick={refreshOrders}
            className="flex items-center gap-2 p-2 text-blue-600 hover:bg-blue-50 rounded-full"
            title={t('common:refresh')}
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
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
        orders={displayedOrders}
        onStatusChange={handleStatusChange}
        onCancel={orderId =>
          setCancelConfirmation({
            isOpen: true,
            orderId,
          })
        }
        isLoading={(isLoading || searchLoading) && displayedOrders.length === 0}
      />

      {!isSearching && hasMore && !isLoading && !isLoadingMore && (
        <div className="flex justify-center mt-6">
          <LoadMoreButton
            handleLoadMore={loadMoreOrders || (() => {})}
            isLoading={(isLoading || isLoadingMore) ?? false}
          />
        </div>
      )}

      {!isSearching && isLoadingMore && (
        <div className="flex justify-center mt-6">
          <div className="animate-spin text-blue-500">
            <RefreshCw className="w-6 h-6" />
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={cancelConfirmation.isOpen}
        title={t('order:cancel-order')}
        message={t('order:cancel-order-message')}
        confirmLabel={t('order:cancel-order')}
        onConfirm={handleCancelOrder}
        onCancel={() => setCancelConfirmation({ isOpen: false })}
      />
    </div>
  );
}
