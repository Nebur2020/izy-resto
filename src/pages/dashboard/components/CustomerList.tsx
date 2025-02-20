import { motion } from 'framer-motion';
import { Order } from '../../../types';

interface CustomerListProps {
  orders: Order[];
}

export function CustomerList({ orders }: CustomerListProps) {
  const customers = orders
    .reduce(
      (acc, order) => {
        const customer = acc.find(c => c.email === order.customerEmail);
        if (customer) {
          customer.totalOrders++;
          customer.totalSpent += order.total;
        } else {
          acc.push({
            name: order.customerName,
            email: order.customerEmail,
            totalOrders: 1,
            totalSpent: order.total,
          });
        }
        return acc;
      },
      [] as Array<{
        name: string;
        email: string;
        totalOrders: number;
        totalSpent: number;
      }>
    )
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 5);

  return (
    <div className="space-y-4">
      {customers.map((customer, index) => (
        <motion.div
          key={customer.email}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
        >
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">
              {customer.name}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {customer.email}
            </p>
          </div>
          <div className="text-right">
            <p className="font-medium text-gray-900 dark:text-white">
              ${customer.totalSpent.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {customer.totalOrders} orders
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
