import { Order, OrderStatus } from '../types';

/**
 * Ensures order has valid createdAt timestamp
 * @param order The order to validate
 * @returns True if the order has a valid timestamp, false otherwise
 */
export function validateOrderTimestamp(order: Order): boolean {
  if (!order.createdAt) {
    return false;
  }

  if (typeof order.createdAt === 'object' && 'seconds' in order.createdAt) {
    return true;
  }

  if (order.createdAt instanceof Date) {
    return true;
  }

  // Try to parse as date string
  try {
    new Date(order.createdAt);
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Normalizes an order's timestamp to a JavaScript Date object
 * @param order The order containing a timestamp
 * @returns A JavaScript Date object
 */
export function getOrderDate(order: Order): Date {
  if (!order.createdAt) {
    return new Date(); // Default to now if no timestamp
  }

  if (typeof order.createdAt === 'object' && 'seconds' in order.createdAt) {
    return new Date(order.createdAt.seconds * 1000);
  }

  if (order.createdAt instanceof Date) {
    return order.createdAt;
  }

  return new Date(order.createdAt);
}

/**
 * Filters orders by status and date range with improved error handling
 * @param orders Array of orders to filter
 * @param dateRange Object containing start and end dates
 * @param status Optional order status to filter by
 * @returns Filtered array of orders
 */
export function filterOrdersByDateAndStatus(
  orders: Order[],
  dateRange: { startDate: Date; endDate: Date },
  status?: OrderStatus
): Order[] {
  if (!orders || orders.length === 0) return [];

  return orders.filter(order => {
    // Status filter
    if (status && order.status !== status) {
      return false;
    }

    // Date filter with error handling
    try {
      if (!validateOrderTimestamp(order)) {
        return false;
      }

      const orderDate = getOrderDate(order);
      return orderDate >= dateRange.startDate && orderDate <= dateRange.endDate;
    } catch (err) {
      console.error('Error filtering order by date:', err, order);
      return false;
    }
  });
}

/**
 * Extracts numeric metrics from orders with proper error handling
 * @param order The order to extract metrics from
 * @returns Object containing numeric metrics
 */
export function extractOrderMetrics(order: Order) {
  return {
    total: Number(order.total || 0),
    subtotal: order.subtotal
      ? Number(order.subtotal)
      : Number(order.total || 0),
    taxTotal: order.taxTotal ? Number(order.taxTotal) : 0,
    amountPaid: order.amountPaid ? Number(order.amountPaid) : 0,
    change: order.change ? Number(order.change) : 0,
  };
}

/**
 * Calculate customer retention metrics from orders
 * @param orders Array of orders to analyze
 * @returns Object containing retention metrics
 */
export function calculateRetentionMetrics(orders: Order[]) {
  const customerOrders = orders.reduce((acc, order) => {
    const customerId =
      order.customerEmail || order.customerPhone || 'anonymous';
    if (!acc[customerId]) {
      acc[customerId] = [];
    }
    acc[customerId].push(order);
    return acc;
  }, {} as Record<string, Order[]>);

  const returningCustomers = Object.values(customerOrders).filter(
    orders => orders.length > 1
  ).length;
  const totalCustomers = Object.keys(customerOrders).length;
  const retentionRate =
    totalCustomers > 0 ? (returningCustomers / totalCustomers) * 100 : 0;

  return {
    returningCustomers,
    totalCustomers,
    retentionRate: Math.round(retentionRate * 10) / 10,
  };
}
