import { useState, useMemo } from 'react';
import { CustomerList } from '../../../components/dashboard/customers/CustomerList';
import { CustomerFilters } from '../../../components/dashboard/customers/CustomerFilters';
import { useOrdersRealtime } from '../../../hooks/useOrdersRealtime';
import { useCustomers } from '../../../hooks/useCustomers';
import { CustomerDetailsModal } from '../../../components/dashboard/CustomerDetailsModal';
import { Pagination } from '../../../components/ui/Pagination';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../../../hooks';

const ITEMS_PER_PAGE = 10;

export function CustomerManagement() {
  const { t } = useTranslation();
  const { orders } = useOrdersRealtime();
  const customers = useCustomers(orders);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [sortBy, setSortBy] = useState<'spent' | 'orders'>('spent');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);

  const { settings } = useSettings();
  const primaryColor = settings?.palette.primary;

  const filteredCustomers = useMemo(() => {
    return customers
      .filter(custmer => !!custmer.phone)
      .filter(
        customer =>
          customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.phone.includes(searchTerm)
      )
      .sort((a, b) => {
        const multiplier = sortOrder === 'asc' ? 1 : -1;
        if (sortBy === 'spent') {
          return (a.totalSpent - b.totalSpent) * multiplier;
        }
        return (a.orderCount - b.orderCount) * multiplier;
      });
  }, [customers, searchTerm, sortOrder, sortBy]);

  const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const selectedCustomer = useMemo(() => {
    if (!selectedCustomerId) return null;
    return customers.find(c => c.id === selectedCustomerId) || null;
  }, [selectedCustomerId, customers]);

  const customerOrders = useMemo(() => {
    if (!selectedCustomerId) return [];
    return orders
      .filter(
        order =>
          order.customerEmail === selectedCustomerId ||
          order.customerPhone === selectedCustomerId
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [selectedCustomerId, orders]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">{t('client:customer')}</h1>
        <p className="text-gray-600 dark:text-gray-400">
          {customers.length} {t('client:total-customers')}
        </p>
      </div>

      <CustomerFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sortOrder={sortOrder}
        onSortChange={setSortOrder}
        sortBy={sortBy}
        onSortByChange={setSortBy}
      />

      <CustomerList
        customers={paginatedCustomers}
        onViewDetails={setSelectedCustomerId}
        primaryColor={primaryColor}
      />

      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      <CustomerDetailsModal
        customer={
          selectedCustomer
            ? {
                name: selectedCustomer.name,
                email: selectedCustomer.email,
                phone: selectedCustomer.phone,
              }
            : null
        }
        orders={customerOrders}
        onClose={() => setSelectedCustomerId(null)}
      />
    </div>
  );
}
