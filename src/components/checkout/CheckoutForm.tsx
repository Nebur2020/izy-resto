import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { useCart } from '../../context/CartContext';
import { orderService } from '../../services/orders/order.service';
import toast from 'react-hot-toast';
import { Utensils, Truck, AlertCircle, X } from 'lucide-react';
import { OrderConfirmation } from './OrderConfirmation';
import { PaymentMethod } from '../../types/payment';
import { useSettings } from '../../hooks';
import { AnimatePresence, motion } from 'framer-motion';
import { DeliveryZoneSelect } from './DeliveryZoneSelect';
import { formatCurrency } from '../../utils/currency';
import { useTranslation } from 'react-i18next';
import PhoneInput, { CountryData } from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { CountryCode, isValidPhoneNumber } from 'libphonenumber-js';
import './check-form.css';

interface CheckoutFormData {
  name?: string;
  phone: string;
  address?: string;
  tableNumber?: string;
  preference?: string;
  phoneCode?: string;
}

interface ICheckoutFormProps {
  onCancel: () => void;
  onSuccess?: () => void;
  deliveryTitleStyle?: string;
  deliveryHoverStyle?: string;
  dinInOptionStyle?: string;
  dinInHoverOptionStyle?: string;
  dinInUstensilsStyle?: string;
  dinInHoverUstensilsStyle?: string;
  truckStyle?: string;
  nextButtonStyle?: string;
  totalPriceStyle?: string;
  selectedPyamentMethod?: string;
  selectedHoverPaymentMethod?: string;
  selectRoundedDiv?: string;
  selectRoundedDivHover?: string;
  confirmOrderButtonStyle?: string;
}

type DiningOption = 'dine-in' | 'delivery';
type CheckoutStep = 'form' | 'confirmation';

export function CheckoutForm(props: ICheckoutFormProps) {
  const { t } = useTranslation('order');
  const {
    onCancel,
    onSuccess,
    deliveryTitleStyle = 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20',
    deliveryHoverStyle = 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600',
    dinInOptionStyle = 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20',
    dinInHoverOptionStyle = 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600',
    truckStyle = 'text-blue-500 dark:text-blue-400',
    dinInUstensilsStyle = 'text-blue-500 dark:text-blue-400',
    dinInHoverUstensilsStyle = 'text-gray-500 dark:text-gray-400',
    nextButtonStyle = 'px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700',
    totalPriceStyle,
    selectedPyamentMethod,
    selectedHoverPaymentMethod,
    selectRoundedDiv,
    selectRoundedDivHover,
    confirmOrderButtonStyle
  } = props;
  const navigate = useNavigate();

  const {
    cart,
    total,
    clearCart,
    subtotal,
    tip,
    setDeliveryZone,
    deliveryZone,
  } = useCart();
  const { settings } = useSettings();
  const [diningOption, setDiningOption] = useState<DiningOption | null>(null);

  const [step, setStep] = useState<CheckoutStep>('form');
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);
  const [selectedCode, setSelectedCode] = useState<{
    countryCode: string;
    dialCode: string;
  }>({
    countryCode: settings?.country.countryCode || 'sn',
    dialCode: `+${settings?.country.dialCode || '221'}`,
  });

  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    trigger,
  } = useForm<CheckoutFormData>({
    mode: 'onChange',
    defaultValues: {
      name: '',
      phone: '',
      address: '',
      tableNumber: '',
    },
  });

  const validatePhone = (value: string) => {
    if (diningOption === 'dine-in' && !value) return true;

    return isValidPhoneNumber(
      value,
      selectedCode.countryCode.toLocaleUpperCase() as CountryCode
    );
  };

  const onSubmit = async (data: CheckoutFormData) => {
    if (step === 'form') {
      const isValid = await trigger();
      if (isValid) {
        setStep('confirmation');
      }
      return;
    }

    try {
      const name =
        !data.name && !data.tableNumber
          ? ''
          : data.name || `Table ${data.tableNumber}`;
      const orderId = await orderService.createOrder({
        items: cart,
        status: 'pending',
        subtotal,
        total,
        tip,
        customerName: name,
        customerPhone: `${selectedCode.dialCode}${data.phone}`,
        customerAddress: diningOption === 'delivery' ? data.address : undefined,
        tableNumber: diningOption === 'dine-in' ? data.tableNumber : undefined,
        diningOption,
        preference: data.preference,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        paymentMethod: selectedPaymentMethod,
        taxRates: settings?.taxes.rates || [],
        delivery: diningOption === 'dine-in' ? null : deliveryZone,
      });

      toast.success(
        diningOption === 'dine-in'
          ? t('order-success-dine-in')
          : t('order-success-delivery')
      );

      clearCart();
      onSuccess?.();
      const order = await orderService.getOrderById(orderId);
      navigate(`/order/${order?.id}`);
    } catch (error: any) {
      console.log('Error creating order:', error?.code);
      if (error?.code?.includes('rate-limit')) {
        setRateLimitError(error?.message || 'Rate limit atteint...');
      }
      toast.error(t('error-order-failed'));
      setStep('form');
    }
  };

  useEffect(() => {
    if (settings?.canDeliver && !settings.canDineIn) {
      setDiningOption('delivery');
    }

    if (settings?.canDineIn && !settings.canDeliver) {
      setDiningOption('dine-in');
    }

    if (settings?.canDeliver && settings.canDineIn) {
      setDiningOption('delivery');
    }
  }, [settings]);

  useEffect(() => {
    if (settings?.country) {
      setSelectedCode({
        countryCode: settings.country.countryCode || 'sn',
        dialCode: `+${settings.country.dialCode || '221'}`,
      });
    }
  }, [settings]);

  if (diningOption === null) {
    return null;
  }

  const formData = watch();

  if (step === 'confirmation') {
    return (
      <OrderConfirmation
        customerData={{
          ...formData,
          diningOption,
          selectedCode: selectedCode.dialCode,
        }}
        onConfirm={() => handleSubmit(onSubmit)()}
        onBack={() => setStep('form')}
        showPaymentMethods={diningOption === 'delivery'}
        setSelectedPaymentMethod={setSelectedPaymentMethod}
        totalPriceStyle={totalPriceStyle}
        selectedPyamentMethod={selectedPyamentMethod}
        selectedHoverPaymentMethod={selectedHoverPaymentMethod}
        selectRoundedDiv={selectRoundedDiv}
        selectRoundedDivHover={selectRoundedDivHover}
        confirmOrderButtonStyle={confirmOrderButtonStyle}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        {settings?.canDeliver && (
          <button
            type="button"
            onClick={() => setDiningOption('delivery')}
            className={`
           p-4 rounded-xl border-2 transition-all duration-200
           flex flex-col items-center gap-2 relative overflow-hidden
           ${
             diningOption === 'delivery'
               ? deliveryTitleStyle
               : deliveryHoverStyle
           }
         `}
          >
            {diningOption === 'delivery' && (
              <div className="absolute inset-0 bg-blue-500/5 dark:bg-blue-400/10" />
            )}
            <Truck
              className={`w-6 h-6 ${
                diningOption === 'delivery'
                  ? truckStyle
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            />
            <span className="font-medium text-sm">{t('delivery')}</span>
          </button>
        )}

        {settings?.canDineIn && (
          <button
            type="button"
            onClick={() => setDiningOption('dine-in')}
            className={`
             p-4 rounded-xl border-2 transition-all duration-200
             flex flex-col items-center gap-2 relative overflow-hidden
             ${
               diningOption === 'dine-in'
                 ? dinInOptionStyle
                 : dinInHoverOptionStyle
             }
           `}
          >
            {diningOption === 'dine-in' && (
              <div className="absolute inset-0 bg-blue-500/5 dark:bg-blue-400/10" />
            )}
            <Utensils
              className={`w-6 h-6 ${
                diningOption === 'dine-in'
                  ? dinInUstensilsStyle
                  : dinInHoverUstensilsStyle
              }`}
            />
            <span className="font-medium text-sm">{t('on-site')}</span>
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('order-customer-name')}
            </label>
            <input
              type="text"
              {...register('name')}
              className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-2.5 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-shadow"
              placeholder={t('order-customer-placeholder')}
            />
          </div>
          <div className="relative w-full">
            <div className="relative flex items-center border rounded-lg w-full focus-within:ring-2 focus-within:ring-blue-500 dark:focus-within:ring-blue-400border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700">
              <PhoneInput
                country={selectedCode.countryCode}
                value={selectedCode.dialCode}
                onChange={(_, country: CountryData) => {
                  if (country && country.countryCode && country.dialCode) {
                    setSelectedCode({
                      countryCode: country.countryCode,
                      dialCode: `+${country.dialCode}`,
                    });
                  }
                }}
                containerClass="w-[120px] flex items-center border-r border-gray-300 !dark:border-gray-600"
                inputClass="!w-full !border-none bg-transparent pl-2 text-sm text-gray-700 !dark:text-gray-300 dark:bg-gray-800"
                buttonClass="!bg-transparent !dark:bg-transparent !border-none p-0 flex items-center"
                dropdownClass="absolute top-full z-50 bg-white dark:bg-gray-800 shadow-lg border border-gray-300 !dark:border-gray-600"
                enableSearch
              />
              <input
                type="tel"
                {...register('phone', {
                  required:
                    diningOption === 'delivery'
                      ? t('order-customer-phone-required')
                      : false,
                  validate: validatePhone,
                })}
                className={`w-full p-2 pr-10 text-sm bg-transparent border-none outline-none focus:ring-0 ${
                  errors.phone
                    ? 'text-red-500 placeholder-red-400'
                    : 'text-gray-900 dark:text-gray-300'
                }`}
                placeholder={t('order-customer-phone-placeholder')}
              />
              {errors.phone && (
                <div className="absolute right-3 text-red-500">
                  <AlertCircle className="w-5 h-5" />
                </div>
              )}
            </div>
            {errors.phone && (
              <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                {errors.phone.message}
              </p>
            )}
          </div>
          {diningOption === 'dine-in' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('table-number')}
              </label>
              <input
                type="text"
                {...register('tableNumber', {
                  required: t('table-number-required'),
                })}
                className={`w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-2.5 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-shadow
                 ${
                   errors.tableNumber
                     ? 'border-red-500 dark:border-red-500'
                     : ''
                 }
               `}
                placeholder="Mettez 0 s'il n'y a pas des tables numérotées"
              />
              {errors.tableNumber && (
                <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                  {errors.tableNumber.message}
                </p>
              )}
            </div>
          ) : (
            <div>
              {settings?.delivery.enabled && (
                <>
                  <DeliveryZoneSelect
                    selectedZone={deliveryZone}
                    onZoneChange={setDeliveryZone}
                    className="mb-4"
                  />
                  {deliveryZone && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-2">
                      <p className="text-sm text-blue-600 dark:text-blue-400 flex justify-between">
                        <span>{t('delivery-fees')}</span>
                        <span className="font-medium">
                          {formatCurrency(
                            deliveryZone.price,
                            settings?.currency
                          )}
                        </span>
                      </p>
                    </div>
                  )}
                </>
              )}

              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('delivery-address')} *
              </label>
              <textarea
                {...register('address', {
                  required: t('customer-delivery-addres-required'),
                })}
                rows={3}
                className={`w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-2.5 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-shadow resize-none
                 ${errors.address ? 'border-red-500 dark:border-red-500' : ''}
               `}
                placeholder={t('customer-delivery-addres-placeholder')}
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                  {errors.address.message}
                </p>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('restaurant-indication')}
          </label>
          <textarea
            {...register('preference')}
            rows={3}
            className={`w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-2.5 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-shadow resize-none `}
            placeholder={t('customer-indication-placeholder')}
          />
        </div>

        <AnimatePresence>
          {rateLimitError && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-4 bg-red-50 dark:bg-red-900/30 border-b border-red-100 dark:border-red-800"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 text-sm text-red-600 dark:text-red-400">
                  {rateLimitError}
                </div>
                <button className="text-red-400 hover:text-red-500 dark:text-red-500 dark:hover:text-red-400">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            className="px-4"
          >
            {t('common:back')}
          </Button>
          <Button
            variant="custom"
            disabled={
              !deliveryZone &&
              diningOption === 'delivery' &&
              settings?.delivery.enabled
            }
            type="submit"
            spanClassName="text-white"
            className={`${nextButtonStyle}`}
          >
            {t('common:next')}
          </Button>
        </div>
      </form>
    </div>
  );
}
