import { Order } from '../../../types';

interface OrderCardActionsProps {
  order: Order;
  onStatusChange: (orderId: string, status: string) => void;
}

export function OrderCardActions({ order, onStatusChange }: OrderCardActionsProps) {
  const statusFlow: { [key: string]: string | null } = {
    pending: 'preparing',
    preparing: 'delivered',
    delivered: null
  };

  const statusTranslations: { [key: string]: string } = {
    pending: 'En attente',
    preparing: 'En préparation',
    delivered: 'Livré'
  };

  const getNextStatus = () => {
    const nextStatusKey = statusFlow[order.status];
    return nextStatusKey ? statusTranslations[nextStatusKey] : null;
  };

  const getNextStatusKey = () => {
    return statusFlow[order.status];
  };

  if (order.status === 'delivered') {
    return null;
  }

  return (
    <div className="mt-6">
      {getNextStatus() && (
        <button
          onClick={() => onStatusChange(order.id, getNextStatusKey()!)}
          className="w-full bg-black hover:bg-gray-900 text-white dark:bg-black dark:hover:bg-gray-900 dark:text-white py-2 px-4 rounded-lg transition-colors"
        >
          Marquer comme {getNextStatus()}
        </button>
      )}
    </div>
  );
}