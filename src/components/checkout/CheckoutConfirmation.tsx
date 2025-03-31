import { CartSummary } from '../cart/CartSummary';
import { Button } from '../ui/Button';
import { useCart } from '../../context/CartContext';

interface CheckoutConfirmationProps {
  onBack: () => void;
  onConfirm: () => void;
}

export function CheckoutConfirmation({
  onBack,
  onConfirm,
}: CheckoutConfirmationProps) {
  const { cart, total } = useCart();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">Confirm Your Order</h2>

        <CartSummary items={cart} total={total} />

        <div className="mt-6 flex justify-end space-x-4">
          <Button variant="secondary" onClick={onBack}>
            Back to Cart
          </Button>
          <Button onClick={onConfirm}>Confirm Order</Button>
        </div>
      </div>
    </div>
  );
}
