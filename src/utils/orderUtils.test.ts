import {
  validateOrderTimestamp,
  getOrderDate,
  filterOrdersByDateAndStatus,
  extractOrderMetrics,
  calculateRetentionMetrics,
} from './orderUtils';
import { Order } from '../types';

describe('Order Utility Functions', () => {
  describe('validateOrderTimestamp', () => {
    it('should return true for valid Firestore timestamp', () => {
      const order = {
        createdAt: { seconds: 1620000000, nanoseconds: 0 },
      } as Order;
      expect(validateOrderTimestamp(order)).toBe(true);
    });

    it('should return true for Date objects', () => {
      const order = { createdAt: new Date() } as Order;
      expect(validateOrderTimestamp(order)).toBe(true);
    });

    it('should return false for missing timestamp', () => {
      const order = {} as Order;
      expect(validateOrderTimestamp(order)).toBe(false);
    });
  });

  describe('getOrderDate', () => {
    it('should convert Firestore timestamp to Date', () => {
      const timestamp = { seconds: 1620000000, nanoseconds: 0 };
      const order = { createdAt: timestamp } as Order;
      const result = getOrderDate(order);

      expect(result instanceof Date).toBe(true);
      expect(result.getTime()).toBe(timestamp.seconds * 1000);
    });

    it('should return Date objects as-is', () => {
      const date = new Date();
      const order = { createdAt: date } as Order;
      const result = getOrderDate(order);

      expect(result).toBe(date);
    });

    it('should provide fallback for missing timestamp', () => {
      const order = {} as Order;
      const result = getOrderDate(order);

      expect(result instanceof Date).toBe(true);
      // Should be approximately now
      expect(Date.now() - result.getTime()).toBeLessThan(1000);
    });
  });

  describe('filterOrdersByDateAndStatus', () => {
    const baseDate = new Date('2025-01-01T12:00:00Z');
    const dateRange = {
      startDate: new Date(baseDate.getTime() - 86400000), // 1 day before
      endDate: new Date(baseDate.getTime() + 86400000), // 1 day after
    };

    const orders: Order[] = [
      {
        id: '1',
        status: 'delivered',
        createdAt: { seconds: baseDate.getTime() / 1000 },
      } as Order,
      {
        id: '2',
        status: 'pending',
        createdAt: { seconds: baseDate.getTime() / 1000 },
      } as Order,
      {
        id: '3',
        status: 'delivered',
        createdAt: { seconds: (baseDate.getTime() - 172800000) / 1000 },
      } as Order, // 2 days before
    ];

    it('should filter by date range', () => {
      const result = filterOrdersByDateAndStatus(orders, dateRange);
      expect(result.length).toBe(2);
      expect(result.map(o => o.id)).toContain('1');
      expect(result.map(o => o.id)).toContain('2');
    });

    it('should filter by status and date range', () => {
      const result = filterOrdersByDateAndStatus(
        orders,
        dateRange,
        'delivered'
      );
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('1');
    });

    it('should handle empty orders array', () => {
      const result = filterOrdersByDateAndStatus([], dateRange);
      expect(result.length).toBe(0);
    });
  });

  describe('extractOrderMetrics', () => {
    it('should extract numeric values from order', () => {
      const order = {
        total: '100.50',
        subtotal: '90.00',
        taxTotal: '10.50',
        amountPaid: '120.00',
        change: '19.50',
      } as unknown as Order;

      const metrics = extractOrderMetrics(order);

      expect(metrics.total).toBe(100.5);
      expect(metrics.subtotal).toBe(90);
      expect(metrics.taxTotal).toBe(10.5);
      expect(metrics.amountPaid).toBe(120);
      expect(metrics.change).toBe(19.5);
    });

    it('should provide defaults for missing values', () => {
      const order = {
        total: '100.50',
      } as unknown as Order;

      const metrics = extractOrderMetrics(order);

      expect(metrics.total).toBe(100.5);
      expect(metrics.subtotal).toBe(100.5); // Default to total
      expect(metrics.taxTotal).toBe(0);
      expect(metrics.amountPaid).toBe(0);
      expect(metrics.change).toBe(0);
    });
  });

  describe('calculateRetentionMetrics', () => {
    it('should calculate customer retention correctly', () => {
      const orders = [
        { customerEmail: 'user1@example.com' } as Order,
        { customerEmail: 'user1@example.com' } as Order,
        { customerEmail: 'user2@example.com' } as Order,
        { customerPhone: '123456789' } as Order,
        { customerPhone: '123456789' } as Order,
        { customerPhone: '987654321' } as Order,
      ];

      const metrics = calculateRetentionMetrics(orders);

      expect(metrics.totalCustomers).toBe(4); // 4 unique customers
      expect(metrics.returningCustomers).toBe(2); // 2 returning customers (user1 and phone 123456789)
      expect(metrics.retentionRate).toBe(50); // 50% retention rate
    });

    it('should handle anonymous customers', () => {
      const orders = [
        { id: '1' } as Order,
        { id: '2' } as Order,
        { id: '3' } as Order,
      ];

      const metrics = calculateRetentionMetrics(orders);

      expect(metrics.totalCustomers).toBe(1); // 1 anonymous customer
      expect(metrics.returningCustomers).toBe(1); // It's returning because all orders are from the same anonymous customer
      expect(metrics.retentionRate).toBe(100); // 100% retention rate for this one customer
    });
  });
});
