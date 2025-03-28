import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { PaymentMethodForm } from '../../../components/dashboard/components/payments/PaymentMethodForm';
import { PaymentMethodList } from '../../../components/dashboard/components/payments/PaymentMethodList';
import { ConfirmationModal } from '../../../components/ui/ConfirmationModal';
import { usePayments } from '../../../hooks/usePayments';
import { PaymentMethod } from '../../../types/payment';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../../../hooks';

export function PaymentManagement() {
  const { t } = useTranslation();
  const {
    paymentMethods,
    isLoading,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
  } = usePayments();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(
    null
  );
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    methodId?: string;
  }>({ isOpen: false });
  const { settings } = useSettings();
  const primaryColor = settings?.palette.primary;

  const handleSave = async (data: Omit<PaymentMethod, 'id'>) => {
    try {
      if (editingMethod) {
        await updatePaymentMethod(editingMethod.id, data);
      } else {
        await addPaymentMethod(data);
      }
      setIsFormOpen(false);
      setEditingMethod(null);
    } catch (error) {
      console.error('Error saving payment method:', error);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmation.methodId) return;

    try {
      await deletePaymentMethod(deleteConfirmation.methodId);
    } catch (error) {
      console.error('Error deleting payment method:', error);
    } finally {
      setDeleteConfirmation({ isOpen: false });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{t('common:payment-method')}</h1>
          <p className="text-gray-500 dark:text-gray-400">
            {t('payment:payment-method-managment')}
          </p>
        </div>
        <Button
          onClick={() => setIsFormOpen(true)}
          variant="custom"
          style={{ backgroundColor: primaryColor, color: '#fff' }}
          spanClassName='text-white'
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('payment:add-payment-method')}
        </Button>
      </div>

      <PaymentMethodList
        methods={paymentMethods}
        isLoading={isLoading}
        onEdit={method => {
          setEditingMethod(method);
          setIsFormOpen(true);
        }}
        onDelete={methodId =>
          setDeleteConfirmation({
            isOpen: true,
            methodId,
          })
        }
      />

      {isFormOpen && (
        <PaymentMethodForm
          method={editingMethod}
          onSave={handleSave}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingMethod(null);
          }}
        />
      )}

      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false })}
        onConfirm={handleDelete}
        title={t('payment:delete-payment-method')}
        message={t('payment:delete-payment-method-confirmation')}
      />
    </div>
  );
}
