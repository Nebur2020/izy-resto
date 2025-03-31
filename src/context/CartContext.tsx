import React, { createContext, useContext, useState } from 'react';
import { MenuItem, CartItem, OrderTip, DeliveryZone } from '../types';
import toast from 'react-hot-toast';
import { useSettings } from '../hooks';
import {
  calculatePriceWithoutTaxes,
  calculateTaxes,
  calculateTip,
  calculateTotal,
} from '../utils/tax';

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: MenuItem) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  taxes: { id: string; name: string; rate: number; amount: number }[];
  taxTotal: number;
  tip: OrderTip | null;
  setTipPercentage: (percentage: number | null) => void;
  total: number;
  deliveryZone: DeliveryZone | null;
  setDeliveryZone: (zone: DeliveryZone) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [tipPercentage, setTipPercentage] = useState<number | null>(null);
  const [deliveryZone, setDeliveryZone] = useState<DeliveryZone | null>(null);

  const { settings } = useSettings();

  // Calculate subtotal (pre-tax amount)
  const subtotal = cart.reduce((sum, item) => {
    const itemPrice = settings?.taxes.includedInPrice
      ? calculatePriceWithoutTaxes(item.price, settings.taxes.rates, [
          item.categoryId,
        ])
      : item.price;
    return sum + itemPrice * item.quantity;
  }, 0);

  // Calculate taxes per item
  const { taxes, taxTotal } = cart.reduce<{
    taxes: { id: string; name: string; rate: number; amount: number }[];
    taxTotal: number;
  }>(
    (acc, item) => {
      const { taxes, total } = calculateTaxes(
        item.price * item.quantity,
        settings?.taxes.rates || [],
        item.categoryId ? [item.categoryId] : []
      );
      const taxTotal = acc.taxTotal + total;
      const taxList = acc.taxes.concat(
        taxes.map(tax => ({
          ...tax,
          amount: tax.amount,
        }))
      );
      // merge duplicate taxes
      const taxMap = new Map<
        string,
        { id: string; name: string; rate: number; amount: number }
      >();
      taxList.forEach(tax => {
        const existingTax = taxMap.get(tax.id);
        if (existingTax) {
          existingTax.amount += tax.amount;
        } else {
          taxMap.set(tax.id, { ...tax });
        }
      });
      const mergedTaxes = Array.from(taxMap.values());
      return {
        taxes: mergedTaxes,
        taxTotal,
      };
    },
    {
      taxes: [],
      taxTotal: 0,
    }
  );

  // Calculate tip
  const tip = tipPercentage
    ? {
        amount: calculateTip(subtotal, tipPercentage),
        percentage: tipPercentage,
      }
    : null;

  // Calculate total
  const total = (
    deliveryZone
      ? calculateTotal(subtotal, taxTotal, tip?.amount || 0) +
        Number(deliveryZone.price)
      : calculateTotal(subtotal, taxTotal, tip?.amount || 0)
  ).toFixed(2);

  const addToCart = (item: MenuItem & { quantity?: number }) => {
    setCart(currentCart => {
      const existingItem = currentCart.find(
        cartItem => cartItem.id === item.id
      );

      if (existingItem) {
        // Add the new quantity to the existing quantity
        const newQuantity = existingItem.quantity + (item.quantity || 1);

        // Check if we have enough stock
        if (item.stockQuantity && newQuantity > item.stockQuantity) {
          toast.error(
            `Stock insuffisant. Maximum disponible: ${item.stockQuantity}`
          );
          return currentCart;
        }

        const updatedCart = currentCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: newQuantity }
            : cartItem
        );
        // toast.success('Quantité mise à jour');
        return updatedCart;
      }

      // Check initial stock for new item
      if (item.stockQuantity && (item.quantity || 1) > item.stockQuantity) {
        toast.error(
          `Stock insuffisant. Maximum disponible: ${item.stockQuantity}`
        );
        return currentCart;
      }

      const newItem: CartItem = {
        ...item,
        quantity: item.quantity || 1,
        options: [],
        specialInstructions: '',
        selectedVariants: [],
      };
      // toast.success('Produit ajouté au panier');
      return [...currentCart, newItem];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(currentCart => currentCart.filter(item => item.id !== itemId));
    // toast.success('Produit retiré du panier');
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    setCart(currentCart => {
      const item = currentCart.find(i => i.id === itemId);

      if (!item) return currentCart;

      // Check stock limit
      if (item.stockQuantity && quantity > item.stockQuantity) {
        toast.error(
          `Stock insuffisant. Maximum disponible: ${item.stockQuantity}`
        );
        return currentCart;
      }

      if (quantity < 1) {
        return currentCart.filter(item => item.id !== itemId);
      }

      return currentCart.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      );
    });
    // toast.success('Quantité mise à jour');
  };

  const clearCart = () => {
    setCart([]);
    setTipPercentage(null);
    setDeliveryZone(null);
  };

  // useEffect(() => {
  //   localStorage.setItem(USER_CART, JSON.stringify(cart));
  // }, [cart]);

  // const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        total: Number(total),
        subtotal: Number(subtotal),
        taxes,
        taxTotal: Number(taxTotal),
        tip,
        setTipPercentage,
        deliveryZone,
        setDeliveryZone,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
