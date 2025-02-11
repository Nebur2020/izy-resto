import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import { Order } from '../../../../types';
import { useSettings } from '../../../../hooks/useSettings';
import {
  formatCurrency,
  formatNumberByLanguage,
} from '../../../../utils/currency';
import { Button } from '../../../ui/Button';

interface ProductSalesStats {
  id: string;
  name: string;
  quantity: number;
  revenue: number;
}

interface ProductSalesStatsProps {
  orders: Order[];
}

const ITEMS_PER_PAGE = 5;

export function ProductSalesStats({ orders }: ProductSalesStatsProps) {
  const { settings } = useSettings();
  const [currentPage, setCurrentPage] = useState(1);

  const productStats = useMemo(() => {
    const stats = new Map<string, ProductSalesStats>();

    // Only consider delivered orders for accurate stats
    const deliveredOrders = orders.filter(
      order => order.status === 'delivered'
    );

    deliveredOrders.forEach(order => {
      order.items.forEach(item => {
        const existing = stats.get(item.id);
        if (existing) {
          existing.quantity += Number(item.quantity);
          existing.revenue += Number(item.price) * Number(item.quantity);
        } else {
          stats.set(item.id, {
            id: item.id,
            name: item.name,
            quantity: Number(item.quantity),
            revenue: Number(item.price) * Number(item.quantity),
          });
        }
      });
    });

    // Convert to array and sort by quantity sold
    return Array.from(stats.values()).sort((a, b) => b.quantity - a.quantity);
  }, [orders]);

  const totalQuantity = productStats.reduce(
    (sum, stat) => sum + stat.quantity,
    0
  );
  const totalRevenue = productStats.reduce(
    (sum, stat) => sum + stat.revenue,
    0
  );

  // Calculate pagination
  const totalPages = Math.ceil(productStats.length / ITEMS_PER_PAGE);
  const paginatedStats = productStats.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Package className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
              Ventes par Produit
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              {productStats.length} produits vendus
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="wait">
          {paginatedStats.map((stat, index) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs sm:text-sm font-medium">
                  #{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                </div>
                <div>
                  <h4 className="font-medium text-sm sm:text-base text-gray-900 dark:text-white">
                    {stat.name}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    {formatNumberByLanguage(
                      Number(
                        ((stat.quantity / totalQuantity) * 100).toFixed(2)
                      ),
                      'fr-FR'
                    )}
                    % des ventes
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-sm sm:text-base text-gray-900 dark:text-white">
                  {stat.quantity} vendus
                </p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  {formatCurrency(stat.revenue, settings?.currency)}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center pt-4 border-t dark:border-gray-700">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="text-gray-500 dark:text-gray-400"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Page {currentPage} sur {totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="text-gray-500 dark:text-gray-400"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>
        )}

        {/* Empty State */}
        {productStats.length === 0 && (
          <div className="text-center py-12">
            <TrendingUp className="w-8 h-8 sm:w-12 sm:h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
              Aucune vente enregistrée pour le moment
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
