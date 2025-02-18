import { AnimatePresence } from 'framer-motion';
import { MenuItem } from '../../types';
import { MenuItemCard } from './MenuItemCard';
import { Currency } from '../../utils/currency';
import { Pagination } from '../ui/Pagination';

interface MenuItemListProps {
  items: MenuItem[];
  onEdit: (item: MenuItem) => void;
  onDelete: (id: string) => void;
  currency?: Currency;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
  currentPage?: number;
  nextPage?: VoidFunction;
  prevPage?: VoidFunction;
}

export function MenuItemList({
  onEdit,
  onDelete,
  currency,
  items,
  hasNextPage = true,
  hasPrevPage = true,
  currentPage = 1,
  nextPage = () => {},
  prevPage = () => {},
}: MenuItemListProps) {
  // const [currentPage, setCurrentPage] = useState(1);

  // Calculate pagination
  // const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  // const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  // const paginatedItems = items.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {items.map(item => (
            <MenuItemCard
              key={item.id}
              item={item}
              onEdit={onEdit}
              onDelete={onDelete}
              currency={currency}
            />
          ))}
        </AnimatePresence>
      </div>

      {items.length > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={0}
            onPageChange={() => {}}
            onNext={nextPage}
            onPrev={prevPage}
            hasNextPage={hasNextPage}
            hasPrevPage={hasPrevPage}
          />
        </div>
      )}
    </div>
  );
}
