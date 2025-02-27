import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Order } from '../../types';
import { useSettings } from '../../hooks/useSettings';
import { formatCurrency } from '../../utils/currency';
import { Pagination } from '../ui/Pagination';
import { CustomerDetailsModal } from './CustomerDetailsModal';
import { Phone, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PaginatedCustomerListProps {
  orders: Order[];
  itemsPerPage: number;
}

export function PaginatedCustomerList(props: PaginatedCustomerListProps) {
  const { orders, itemsPerPage } = props;
  const { settings } = useSettings();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<{
    name: string;
    email?: string | null;
    phone: string;
  } | null>(null);
  const { t } = useTranslation('order');

  const customers = useMemo(() => {
    const customerMap = orders.reduce((acc, order) => {
      const key = order.customerPhone;
      const customer = acc.get(key);
      if (customer) {
        customer.totalOrders++;
        customer.totalSpent += order.total;
        customer.orders.push(order);
      } else {
        acc.set(key, {
          name: order.customerName,
          email: order.customerEmail,
          phone: order.customerPhone,
          totalOrders: 1,
          totalSpent: order.total,
          orders: [order],
        });
      }
      return acc;
    }, new Map());

    return Array.from(customerMap.values()).sort(
      (a, b) => b.totalSpent - a.totalSpent
    );
  }, [orders]);

  const totalPages = Math.ceil(customers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCustomers = customers.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const selectedCustomerOrders = useMemo(() => {
    if (!selectedCustomer) return [];
    return orders
      .filter(order => order.customerPhone === selectedCustomer.phone)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [selectedCustomer, orders]);

  return (
    <>
      <div className="space-y-4">
        {paginatedCustomers.length > 0 ? (
          paginatedCustomers.map((customer, index) => (
            <motion.button
              key={customer.email || customer.phone}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() =>
                setSelectedCustomer({
                  name: customer.name,
                  email: customer.email,
                  phone: customer.phone,
                })
              }
              className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600/50 transition-colors text-left"
            >
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  <span className="flex items-center ">
                    <User className="w-4 h-4 mr-1" /> {customer.name}
                  </span>
                </h4>
                <span className="flex items-center">
                  <Phone className="w-4 h-4 mr-1" />
                  {customer.phone}
                </span>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {customer.totalOrders} {t('orders')}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(customer.totalSpent, settings?.currency)}
                </p>
              </div>
            </motion.button>
          ))
        ) : (
          <div className="text-center bg-gray-50 dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              {t('common:no-customers-found')}
            </h2>
          </div>
        )}

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      <CustomerDetailsModal
        customer={selectedCustomer}
        orders={selectedCustomerOrders}
        onClose={() => setSelectedCustomer(null)}
      />
    </>
  );
}
