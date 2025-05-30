import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';
import { useSettings } from '../../hooks';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const { settings } = useSettings();
  const primaryColor = settings?.palette?.primary;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const visiblePages = pages.filter(page => {
    if (totalPages <= 5) return true;
    if (page === 1 || page === totalPages) return true;
    return Math.abs(page - currentPage) <= 1;
  });

  return (
    <div className="flex items-center justify-center space-x-2">
      <Button
        variant="custom"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        type="button"
        style={{ backgroundColor: primaryColor || '#3B82F6' }}
        className="text-white"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      {visiblePages.map((page, index) => {
        if (index > 0 && page - visiblePages[index - 1] > 1) {
          return (
            <span key={`ellipsis-${page}`} className="px-2 text-gray-500">
              ...
            </span>
          );
        }

        return (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            type="button"
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${currentPage !== page
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                : 'text-white'
              }`}
            style={currentPage === page ? { backgroundColor: primaryColor || '#3B82F6' } : undefined}
          >
            {page}
          </button>
        );
      })}

      <Button
        variant="custom"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        type="button"
        style={{ backgroundColor: primaryColor || '#3B82F6' }}
        className="text-white"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
