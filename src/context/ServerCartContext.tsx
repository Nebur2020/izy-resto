import React, { createContext, useContext, useState } from 'react';
import { MenuItem, CartItem } from '../types';
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
  tip: { amount: number; percentage?: number } | null;
  setTipPercentage: (percentage: number | null) => void;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function ServerCartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [tipPercentage, setTipPercentage] = useState<number | null>(null);
  const { settings } = useSettings();

  const subtotal = cart.reduce((sum, item) => {
    const itemPrice = settings?.taxes.includedInPrice
      ? calculatePriceWithoutTaxes(item.price, settings.taxes.rates, [
          item.categoryId,
        ])
      : item.price;
    return sum + itemPrice * item.quantity;
  }, 0);

  const { taxes, total: taxTotal } = calculateTaxes(
    subtotal,
    settings?.taxes.rates || [],
    cart.map(item => item.categoryId)
  );

  const tip = tipPercentage
    ? {
        amount: calculateTip(subtotal, tipPercentage),
        percentage: tipPercentage,
      }
    : null;

  const total = calculateTotal(subtotal, taxTotal, tip?.amount || 0);

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
        return updatedCart;
      }

      if (item.stockQuantity && (item.quantity || 1) > item.stockQuantity) {
        toast.error(
          `Stock insuffisant. Maximum disponible: ${item.stockQuantity}`
        );
        return currentCart;
      }

      const newItem = { ...item, quantity: item.quantity || 1 };
      return [...currentCart, newItem];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(currentCart => currentCart.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    setCart(currentCart => {
      const item = currentCart.find(i => i.id === itemId);

      if (!item) return currentCart;

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
  };

  const clearCart = () => {
    setCart([]);
    setTipPercentage(null);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        total,
        subtotal,
        taxes,
        taxTotal,
        tip,
        setTipPercentage,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useServerCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
