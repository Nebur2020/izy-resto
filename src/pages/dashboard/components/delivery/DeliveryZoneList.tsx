import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, Trash2, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useMemo } from 'react';

import { formatCurrency } from '../../../../utils/currency';
import { Currency, DeliveryZone } from '../../../../types';
import { Button } from '../../../../components/ui';

interface DeliveryZoneListProps {
  zones: DeliveryZone[];
  isLoading: boolean;
  currency?: Currency;
  onEdit: (zone: DeliveryZone) => void;
  onDelete: (zone: DeliveryZone) => void;
  itemsPerPage?: number;
  primaryColor?: string;
}

export function DeliveryZoneList({
  zones,
  isLoading,
  currency,
  onEdit,
  onDelete,
  itemsPerPage = 5, // Default to 5 items per page
  primaryColor
}: DeliveryZoneListProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const paginatedZones = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return zones.slice(startIndex, endIndex);
  }, [zones, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(zones.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence mode="popLayout">
        {paginatedZones.map(zone => (
          <motion.div
            key={zone.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg" style={{ backgroundColor: primaryColor }}>
                  <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" color='#fff'/>
                </div>
                <div>
                  <h3 className="font-medium text-lg">{zone.name}</h3>
                  {zone.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {zone.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="font-semibold text-lg">
                  {formatCurrency(zone.price, currency)}
                </span>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => onEdit(zone)}
                    className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  {zones.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => onDelete(zone)}
                      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {zones.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
          >
            <MapPin className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Aucune zone de livraison
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Commencez par ajouter une zone de livraison
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Page {currentPage} sur {totalPages}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-2"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {/* Page Numbers */}
            <div className="flex gap-1">
              {[...Array(totalPages)].map((_, index) => {
                const pageNumber = index + 1;
                const isActive = pageNumber === currentPage;

                return (
                  <Button
                    type="button"
                    key={pageNumber}
                    variant={isActive ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => handlePageChange(pageNumber)}
                    className={`w-8 ${
                      isActive
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {pageNumber}
                  </Button>
                );
              })}
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-2"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
