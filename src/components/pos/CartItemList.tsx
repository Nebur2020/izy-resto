import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { Button } from '../ui/Button';
import { useSettings } from '../../hooks/useSettings';
import { formatCurrency } from '../../utils/currency';
import { useServerCart } from '../../context/ServerCartContext';
import { useTranslation } from 'react-i18next';

interface CartItemListProps {
  items?: any[];
  setIsAddItemsToOrder?: (value: boolean) => void;
  onItemRemoved?: (itemId: string) => void;
}

export function CartItemList(props: CartItemListProps) {
  const { items = [], setIsAddItemsToOrder, onItemRemoved } = props;
  const { settings } = useSettings();
  const { t } = useTranslation('common');
  const { cart, updateQuantity, removeFromCart } = useServerCart();

  const [cartItems, setCartItems] = useState<any[]>([]);

  useEffect(() => {
    if (items.length > 0) {
      setCartItems(items);
    } else if (cart.length > 0) {
      setCartItems(cart);
    } else {
      setCartItems([]);
    }
  }, [items, cart]);

  console.group('CartItemList group one');
  console.table(cartItems);
  console.groupEnd();

  const handleRemoveItem = (id: string) => {
    setCartItems(() => cartItems.filter(item => item.id !== id));

    console.log('Removing item:', id);
    removeFromCart(id);

    console.group('CartItemList group two');
    console.table(cartItems);
    console.groupEnd();

    if (onItemRemoved) {
      onItemRemoved(id);
    }
  };

  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    updateQuantity(id, newQuantity);

    if (items.length > 0) {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
        <ShoppingBag className="w-12 h-12 mb-2 opacity-50" />
        <p className="text-sm">{t('cart-empty')}</p>
      </div>
    );
  }

  return (
    <div>
      <AnimatePresence mode="popLayout">
        {cartItems.map(item => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-start gap-4 py-4 border-b dark:border-gray-700 last:border-0"
          >
            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 dark:text-white truncate">
                {item.name}
              </h3>
              {item?.selectedVariants?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {item.selectedVariants.map(
                    (variant: string, index: React.Key | null | undefined) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs
                               bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                      >
                        {variant.split(': ')[1]}
                      </span>
                    )
                  )}
                </div>
              )}
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {formatCurrency(item.price, settings?.currency)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                className="h-8 w-8 p-0 rounded-full"
              >
                <Minus className="w-4 h-4" />
              </Button>

              <span className="w-8 text-center font-medium">
                {item.quantity}
              </span>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                className="h-8 w-8 p-0 rounded-full"
                disabled={Boolean(
                  item.stockQuantity && item.quantity >= item.stockQuantity
                )}
              >
                <Plus className="w-4 h-4" />
              </Button>

              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  handleRemoveItem(item.id);
                }}
                className="h-8 w-8 p-0 rounded-full ml-2 text-white"
              >
                <Trash2 className="w-4 h-4 text-white" />
              </Button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {items.length > 0 && (
        <div className="flex justify-center mt-6">
          <Button
            variant="primary"
            onClick={() => setIsAddItemsToOrder && setIsAddItemsToOrder(true)}
          >
            {t('add-more-items')}
          </Button>
        </div>
      )}
    </div>
  );
}
