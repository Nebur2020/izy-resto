import { useState, useEffect } from 'react';
import { PaymentMethod } from '../types/payment';
import { paymentService } from '../services/payments/payment.service';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export function usePayments() {
  const { t } = useTranslation();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      setIsLoading(true);
      const methods = await paymentService.getActivePaymentMethods();
      setPaymentMethods(methods);
    } catch (error) {
      console.error('Error loading payment methods:', error);
      toast.error(t('payment:failed-to-load-methods'));
    } finally {
      setIsLoading(false);
    }
  };

  const addPaymentMethod = async (data: Omit<PaymentMethod, 'id'>) => {
    try {
      const id = await paymentService.create(data);
      await loadPaymentMethods();
      toast.success(t('payment:method-added-successfully'));
      return id;
    } catch (error) {
      console.error('Error adding payment method:', error);
      toast.error(t('payment:failed-to-add-method'));
      throw error;
    }
  };

  const updatePaymentMethod = async (
    id: string,
    data: Partial<PaymentMethod>
  ) => {
    try {
      await paymentService.update(id, {
        ...data,
        updatedAt: new Date().toISOString(),
      });
      await loadPaymentMethods();
      toast.success(t('payment:method-updated-successfully'));
    } catch (error) {
      console.error('Error updating payment method:', error);
      toast.error(t('payment:failed-to-update-method'));
      throw error;
    }
  };

  const deletePaymentMethod = async (id: string) => {
    try {
      await paymentService.update(id, {
        active: false,
        updatedAt: new Date().toISOString(),
      });
      await loadPaymentMethods();
      toast.success(t('payment:method-deleted-successfully'));
    } catch (error) {
      console.error('Error deleting payment method:', error);
      toast.error(t('payment:failed-to-delete-method'));
      throw error;
    }
  };

  return {
    paymentMethods,
    isLoading,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    refreshPaymentMethods: loadPaymentMethods,
  };
}
