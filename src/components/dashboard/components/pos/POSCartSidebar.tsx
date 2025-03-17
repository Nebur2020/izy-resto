import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { CartItem, Order } from '../../../../types';
import { CartItemList } from '../../../pos/CartItemList';
import { CustomerInfoForm } from '../../../pos/CustomerInfoForm';
import { OrderSummary } from '../../../pos/OrderSummary';
import { PaymentSection } from '../../../pos/PaymentSection';
import { Button } from '../../../ui/Button';
import toast from 'react-hot-toast';
import { useServerCart } from '../../../../context/ServerCartContext';
import { formatCurrency } from '../../../../utils/currency';
import { useSettings } from '../../../../hooks';
import { useTranslation } from 'react-i18next';
import { orderService } from '../../../../services';

interface IPOSCartSidebarProps {
  onClose?: () => void;
  cart: CartItem[];
  tableNumber: string;
  setTableNumber: (value: string) => void;
  customerInfo: {
    name?: string;
    phone?: string;
  };
  setCustomerInfo: (info: { name?: string; phone?: string }) => void;
  amountPaid: number;
  setAmountPaid: (amount: number) => void;
  total: number;
  onUpdateQuantity: (itemId: string, delta: number) => void;
  onQuickAmount: (amount: number) => void;
  onCheckout: () => Promise<void>;
  isSubmitting: boolean;
  order?: Order;
  itemsToOrder?: CartItem[];
  setIsAddItemsToOrder?: (value: boolean) => void;
}

export function POSCartSidebar(props: IPOSCartSidebarProps) {
  const {
    onClose,
    cart,
    tableNumber,
    setTableNumber,
    customerInfo,
    setCustomerInfo,
    amountPaid,
    setAmountPaid,
    onQuickAmount,
    onCheckout,
    isSubmitting,
    order,
    itemsToOrder,
    setIsAddItemsToOrder,
  } = props;

  const [error] = useState('');
  const [showExtras, setShowExtras] = useState(false);
  const { settings } = useSettings();
  const { t } = useTranslation('common');
  const { total } = useServerCart();
  const [cartItems, setCartItems] = useState<any[]>([]);

  useEffect(() => {
    if (order) {
      setTableNumber(order.tableNumber || '');
      setCustomerInfo({
        name: order.customerName || '',
        phone: order.customerPhone || '',
      });
    }
  }, [order]);

  useEffect(() => {
    if (order && order?.items.length > 0) {
      setCartItems(order.items);
    } else if (cart.length > 0) {
      setCartItems(cart);
    } else {
      setCartItems([]);
    }
  }, [order?.items, cart]);

  const handleCheckout = async () => {
    try {
      if (amountPaid < 0 || (amountPaid !== 0 && amountPaid < total)) {
        toast.error(t('amount-condition'));
        return;
      }

      await onCheckout();
      toast.success(t('order-successfully-created'));
    } catch (error) {
      console.error('Error creating order:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error(t('order-creation-fail'));
      }
    }
  };

  const handleUpdateOrder = async () => {
    try {
      if (!order) {
        throw new Error('No order to update');
      }

      console.log('cartItems: ', cartItems, 'itemsToOrder', itemsToOrder);

      const updateData = {
        tableNumber,
        customerName: customerInfo.name,
        customerPhone: customerInfo.phone,
        items: itemsToOrder,
        total,
        amountPaid,
        updatedAt: new Date().toISOString(),
      };

      await orderService.updateOrder(order.id, updateData);
      toast.success(t('common:order-successfully-updated'));
    } catch (error) {
      console.error('Error updating order:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error(t('order-update-fail'));
      }
    }
  };

  return (
    <div className="h-full flex flex-col">
      {onClose && (
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold">{t('cart')}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 border-b dark:border-gray-700">
          <label className="block text-sm font-medium mb-1">
            {t('table-number')}
          </label>
          <input
            type="text"
            value={tableNumber}
            onChange={e => setTableNumber(e.target.value)}
            className="w-full rounded-lg border dark:border-gray-700 p-2"
            placeholder="Ex: 42"
            min={0}
          />
        </div>

        <div className="p-4 border-b dark:border-gray-700">
          <CustomerInfoForm
            customerInfo={customerInfo}
            onChange={setCustomerInfo}
          />
        </div>

        <div className="px-4">
          <CartItemList
            items={itemsToOrder}
            setIsAddItemsToOrder={setIsAddItemsToOrder}
          />
        </div>
      </div>

      {cartItems.length > 0 && (
        <div className="dark:border-gray-700 p-4 space-y-4 bg-white dark:bg-gray-800">
          <div className="flex justify-between items-center text-lg font-semibold border-t dark:border-gray-700 pt-4">
            <span>{t('total')}</span>
            <span className="text-blue-600 dark:text-blue-400">
              {formatCurrency(total, settings?.currency)}
            </span>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => setShowExtras(!showExtras)}
              className="w-full flex items-center justify-between text-sm text-gray-600 dark:text-gray-400"
            >
              <span>{t('tax-and-tips')}</span>
              {showExtras ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
            {showExtras && <OrderSummary items={cart} total={total} />}
          </div>

          <PaymentSection
            total={total}
            amountPaid={amountPaid}
            onAmountPaidChange={setAmountPaid}
            onQuickAmount={onQuickAmount}
          />

          {error && <p className="text-red-500 dark:text-red-400">{error}</p>}

          <Button
            onClick={order ? handleUpdateOrder : handleCheckout}
            disabled={cart.length === 0 || isSubmitting}
            className="w-full py-3 text-base font-medium bg-blue-600 hover:bg-blue-700 text-white  rounded-lg
                     transition-colors duration-200 shadow-sm hover:shadow-md
                     disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting
              ? t('processing')
              : order
              ? t('common:updated-order')
              : t('validated-order')}
          </Button>
        </div>
      )}
    </div>
  );
}
