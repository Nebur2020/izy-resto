import { AnimatePresence } from 'framer-motion';
import { MenuItem } from '../../types';
import { MenuItemCard } from './MenuItemCard';
import { Currency } from '../../utils/currency';

interface MenuItemListProps {
  items: MenuItem[];
  onEdit: (item: MenuItem) => void;
  onDelete: (id: string) => void;
  currency?: Currency;
}

export function MenuItemList({
  items,
  onEdit,
  onDelete,
  currency,
}: MenuItemListProps) {
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
    </div>
  );
}
