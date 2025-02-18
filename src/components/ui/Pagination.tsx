import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrevPage?: boolean;
  hasNextPage?: boolean;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  onPrev = () => {},
  onNext = () => {},
  hasPrevPage = true,
  hasNextPage = true,
}: PaginationProps) {
  return (
    <div className="flex items-center justify-center space-x-2">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => {
          onPageChange(currentPage - 1);
          onPrev();
        }}
        disabled={!hasPrevPage}
        type="button"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      {/* {visiblePages.map((page, index) => {
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
            onClick={() => {
              onPageChange(page);
            }}
            type="button"
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              currentPage === page
                ? 'bg-blue-600 text-white dark:bg-blue-500'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {page}
          </button>
        );
      })} */}

      <Button
        variant="secondary"
        size="sm"
        onClick={() => {
          onPageChange(currentPage + 1);
          onNext();
        }}
        disabled={!hasNextPage}
        type="button"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
