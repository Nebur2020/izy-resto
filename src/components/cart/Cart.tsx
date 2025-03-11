import { useState } from 'react';
import { ShoppingCart, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useSettings } from '../../hooks/useSettings';
import { CartItem } from './CartItem';
import { CheckoutForm } from '../checkout/CheckoutForm';
import { formatCurrency } from '../../utils/currency';
import { formatTaxRate } from '../../utils/tax';
import { useTranslation } from 'react-i18next';

interface ICartProps {
  primaryColor?: string;
  backgroundColor?: string;
  isDarkMode?: boolean;
}

export function Cart({
  primaryColor = '#3b82f6',
  backgroundColor = '#f3f4f6',
  isDarkMode = false,
}: ICartProps) {
  const { t } = useTranslation('cart');
  const { cart, total, taxes, subtotal } = useCart();
  const { settings } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  if (cart.length === 0) {
    return null;
  }

  // Styles with inline color properties to handle dynamic colors
  const getStyleForElement = (element: string) => {
    switch (element) {
      case 'cartButton':
        return {
          className:
            'fixed bottom-6 right-6 text-white p-4 rounded-full shadow-lg transition-all z-50 hover:scale-105 active:scale-95 hover:opacity-90',
          style: { backgroundColor: primaryColor },
        };
      case 'orderButton':
        return {
          className:
            'w-full text-white font-medium px-6 py-3 rounded-xl shadow-md hover:opacity-90',
          style: { backgroundColor: primaryColor },
        };
      case 'totalCartAmount':
        return {
          className: 'dark:text-blue-400 text-xl font-bold',
          style: { color: primaryColor },
        };
      default:
        return {};
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={getStyleForElement('cartButton').className}
        style={getStyleForElement('cartButton').style}
      >
        <ShoppingCart className="w-6 h-6" />
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-medium rounded-full w-6 h-6 flex items-center justify-center">
          {cart.length}
        </span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-gray-50 dark:bg-gray-800 shadow-xl z-50 flex flex-col transition-transform duration-300 py-5">
            <div className="p-4 border-b dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  {t('your-cart')} ({cart.length})
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {isCheckingOut ? (
                <CheckoutForm
                  onSuccess={() => {
                    setIsCheckingOut(false);
                    setIsOpen(false);
                  }}
                  onCancel={() => setIsCheckingOut(false)}
                  primaryColor={primaryColor}
                  backgroundColor={backgroundColor}
                  isDarkMode={isDarkMode}
                />
              ) : (
                cart.map(item => <CartItem key={item.id} item={item} />)
              )}
            </div>

            {!isCheckingOut && cart.length > 0 && (
              <div className="p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>{t('sub-total')}</span>
                    <span>{formatCurrency(subtotal, settings?.currency)}</span>
                  </div>

                  {taxes.map(tax => (
                    <div
                      key={tax.id}
                      className="flex justify-between text-sm text-gray-600 dark:text-gray-400"
                    >
                      <span>
                        {t(tax.name)} ({formatTaxRate(tax.rate)})
                      </span>
                      <span>
                        {formatCurrency(tax.amount, settings?.currency)}
                      </span>
                    </div>
                  ))}

                  <div className="pt-2 border-t dark:border-gray-700 mt-2">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-gray-800 dark:text-gray-200">
                        {t('total-cart')}
                      </span>
                      <span
                        className={
                          getStyleForElement('totalCartAmount').className
                        }
                        style={getStyleForElement('totalCartAmount').style}
                      >
                        {formatCurrency(total, settings?.currency)}
                      </span>
                    </div>
                    <button
                      onClick={() => setIsCheckingOut(true)}
                      className={getStyleForElement('orderButton').className}
                      style={getStyleForElement('orderButton').style}
                    >
                      {t('make-order')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
