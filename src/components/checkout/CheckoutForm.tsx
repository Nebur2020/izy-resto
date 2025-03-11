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

// Add this style to check-form.css or inline as shown here
const FocusStyle = ({ primaryColor }: { primaryColor: string }) => (
  <style>{`
    .primary-focus-ring:focus {
      outline: none !important;
      box-shadow: 0 0 0 2px ${primaryColor} !important;
      border-color: transparent !important;
    }
    .phone-container-focus:focus-within {
      box-shadow: 0 0 0 2px ${primaryColor} !important;
      border-color: transparent !important;
    }
  `}</style>
);

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
  primaryColor?: string;
  backgroundColor?: string;
  isDarkMode?: boolean;
}

type DiningOption = 'dine-in' | 'delivery';
type CheckoutStep = 'form' | 'confirmation';

// Helper function to get lighter/darker variations of a color
const getLighterColor = (hexColor: string, opacity = 0.1) => {
  // For simplicity using opacity, but could be improved with actual color manipulation
  return `${hexColor}${Math.round(opacity * 255)
    .toString(16)
    .padStart(2, '0')}`;
};

export function CheckoutForm({
  onCancel,
  onSuccess,
  primaryColor = '#3b82f6',
  backgroundColor = '#f3f4f6',
  isDarkMode = false,
}: ICheckoutFormProps) {
  const { t } = useTranslation('order');
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

  // Function to get styles with dynamic colors
  const getStyle = (element: string, isSelected: boolean = false) => {
    switch (element) {
      case 'delivery':
        return {
          className: `p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 relative overflow-hidden ${
            isSelected
              ? 'bg-opacity-5 dark:bg-opacity-10'
              : 'hover:border-opacity-60'
          }`,
          style: {
            borderColor: isSelected
              ? primaryColor
              : isDarkMode
              ? '#374151'
              : '#e5e7eb', // gray-200 or gray-700
            backgroundColor: isSelected
              ? getLighterColor(primaryColor, 0.05)
              : 'transparent',
          },
        };
      case 'dineIn':
        return {
          className: `p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 relative overflow-hidden ${
            isSelected
              ? 'bg-opacity-5 dark:bg-opacity-10'
              : 'hover:border-opacity-60'
          }`,
          style: {
            borderColor: isSelected
              ? primaryColor
              : isDarkMode
              ? '#374151'
              : '#e5e7eb', // gray-200 or gray-700
            backgroundColor: isSelected
              ? getLighterColor(primaryColor, 0.05)
              : 'transparent',
          },
        };
      case 'icon':
        return {
          className: isSelected ? '' : 'text-gray-500 dark:text-gray-400',
          style: isSelected ? { color: primaryColor } : {},
        };
      case 'nextButton':
        return {
          className: 'px-6 text-white',
          style: {
            background: `linear-gradient(to right, ${primaryColor}, ${getLighterColor(
              primaryColor,
              0.8
            )})`,
          },
        };
      case 'deliveryFees':
        return {
          className: 'p-3 rounded-lg mb-2',
          style: {
            backgroundColor: isDarkMode
              ? `${primaryColor}20` // 20 is hex for 12% opacity
              : `${primaryColor}10`, // 10 is hex for 6% opacity
          },
        };
      case 'deliveryFeesText':
        return {
          className: 'text-sm flex justify-between',
          style: { color: primaryColor },
        };
      case 'input':
        return {
          className:
            'w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-2.5 transition-shadow primary-focus-ring',
        };
      case 'textarea':
        return {
          className:
            'w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-2.5 transition-shadow resize-none primary-focus-ring',
        };
      case 'phoneContainer':
        return {
          className:
            'relative flex items-center border rounded-lg w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 phone-container-focus',
        };
      default:
        return {};
    }
  };

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
        primaryColor={primaryColor}
        backgroundColor={backgroundColor}
        isDarkMode={isDarkMode}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Inject our custom focus styles */}
      <FocusStyle primaryColor={primaryColor} />

      <div className="grid grid-cols-2 gap-3">
        {settings?.canDeliver && (
          <button
            type="button"
            onClick={() => setDiningOption('delivery')}
            className={
              getStyle('delivery', diningOption === 'delivery').className
            }
            style={getStyle('delivery', diningOption === 'delivery').style}
          >
            <Truck
              className={
                getStyle('icon', diningOption === 'delivery').className
              }
              style={getStyle('icon', diningOption === 'delivery').style}
            />
            <span className="font-medium text-sm">{t('delivery')}</span>
          </button>
        )}

        {settings?.canDineIn && (
          <button
            type="button"
            onClick={() => setDiningOption('dine-in')}
            className={getStyle('dineIn', diningOption === 'dine-in').className}
            style={getStyle('dineIn', diningOption === 'dine-in').style}
          >
            <Utensils
              className={getStyle('icon', diningOption === 'dine-in').className}
              style={getStyle('icon', diningOption === 'dine-in').style}
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
              className={getStyle('input').className}
              placeholder={t('order-customer-placeholder')}
            />
          </div>
          <div className="relative w-full">
            <div className={getStyle('phoneContainer').className}>
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
                className={`${getStyle('input').className} ${
                  errors.tableNumber ? 'border-red-500 dark:border-red-500' : ''
                }`}
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
                    primaryColor={primaryColor}
                    backgroundColor={backgroundColor}
                    isDarkMode={isDarkMode}
                  />
                  {deliveryZone && (
                    <div
                      className={getStyle('deliveryFees').className}
                      style={getStyle('deliveryFees').style}
                    >
                      <p
                        className={getStyle('deliveryFeesText').className}
                        style={getStyle('deliveryFeesText').style}
                      >
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
                className={`${getStyle('textarea').className} ${
                  errors.address ? 'border-red-500 dark:border-red-500' : ''
                }`}
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
            className={getStyle('textarea').className}
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
            className={getStyle('nextButton').className}
            style={getStyle('nextButton').style}
          >
            {t('common:next')}
          </Button>
        </div>
      </form>
    </div>
  );
}
