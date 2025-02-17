import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Check,
  ExternalLink,
  X,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { useSettings } from '../../hooks/useSettings';
import { formatCurrency } from '../../utils/currency';
import { useCart } from '../../context/CartContext';
import { usePayments } from '../../hooks/usePayments';
import { QRCodeModal } from './QRCodeModal';
import { CartItem } from '../../types';
import { PaymentMethod } from '../../types/payment';
import { usePaytech } from '../../hooks/usePaytech';
import { getOrderByRef } from '../../services/payments/paytech.service';
import { StripePayment } from './StripePayment';
import { getCurrencyObject } from '../../constants/defaultSettings';
import { CinetPayPayment } from './CinetPayPayment';
import { formatTaxRate } from '../../utils/tax';
import { MoneyFusionPaymentButton } from './MoneyFusionPaymentButton';
import { useTranslation } from 'react-i18next';

interface IOrderConfirmationProps {
  customerData: {
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
    tableNumber?: string;
    diningOption: 'delivery' | 'dine-in';
  };
  onConfirm: () => void | Promise<void>;
  onBack: () => void;
  showPaymentMethods?: boolean;
  setSelectedPaymentMethod: React.Dispatch<
    React.SetStateAction<PaymentMethod | null>
  >;
}

export function OrderConfirmation(props: IOrderConfirmationProps) {
  const { t } = useTranslation('order');

  // console.log(t('days.monday'));
  const {
    customerData,
    onConfirm,
    onBack,
    showPaymentMethods,
    setSelectedPaymentMethod,
  } = props;
  const { settings } = useSettings();
  const { subtotal, taxes, tip, total, cart, setTipPercentage, deliveryZone } =
    useCart();

  const { paymentMethods } = usePayments();
  const [selectedPayment, setSelectedPayment] = useState(
    paymentMethods[0]?.id || ''
  );
  const [showQRCode, setShowQRCode] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);
  const [hasClickedPaymentLink, setHasClickedPaymentLink] = useState(false);
  const [isConfirmingOrder, setIsConfirmingOrder] = useState(false);

  const selectedPaymentMethod = paymentMethods.find(
    method => method.id === selectedPayment
  );

  const getPaymentUrl = () => {
    if (!selectedPaymentMethod?.url) return '';
    return selectedPaymentMethod.name?.toLowerCase() === 'wave'
      ? `${selectedPaymentMethod.url}?amount=${total}`
      : '#';
  };

  const currencyObject = settings
    ? getCurrencyObject(settings.currency!)
    : null;

  const handleConfirm = async () => {
    try {
      if (selectedPaymentMethod?.url && !hasPaid) {
        window.open(getPaymentUrl(), '_blank', 'noopener,noreferrer');
        setHasClickedPaymentLink(true);
        return;
      }

      if (selectedPaymentMethod?.qrCode && !hasPaid) {
        setShowQRCode(true);
        return;
      }

      setIsConfirmingOrder(true);
      await onConfirm();
    } catch (error) {
      setIsConfirmingOrder(false);
    }
  };

  const handleOrderConfirm = async () => {
    try {
      setIsConfirmingOrder(true);
      await onConfirm();
    } catch (error) {
      setIsConfirmingOrder(false);
    }
  };

  useEffect(() => {
    if (selectedPaymentMethod) {
      setSelectedPaymentMethod(selectedPaymentMethod);
    }
  }, [selectedPaymentMethod]);

  useEffect(() => {
    setHasPaid(false);
    setShowQRCode(false);
    setHasClickedPaymentLink(false);
  }, [selectedPayment]);

  const renderPaymentButton = () => {
    const isDineInPaymentActivated = settings?.paymentOnDineInActivated;

    if (customerData.diningOption === 'dine-in' && !isDineInPaymentActivated) {
      return (
        <span className="flex align-items justify-between text-white">
          <Check className="w-4 h-4 mr-2" />
          {t('order:confirm-order')}
        </span>
      );
    }

    if (!selectedPaymentMethod) return t('order:confirm-order');

    if (
      hasPaid ||
      selectedPaymentMethod.name.toLowerCase() === 'paiement à la livraison'
    ) {
      return (
        <span className="flex align-items justify-between text-white">
          <Check className="w-4 h-4 mr-2" />
          {t('order:confirm-order')}
        </span>
      );
    }

    if (selectedPaymentMethod.name.toLowerCase() === 'wave') {
      return (
        <span className="flex align-items justify-between text-white">
          <ExternalLink className="w-4 h-4 mr-2" />
          {t('order:pay-with-wave')}
        </span>
      );
    }

    if (selectedPaymentMethod.name.toLowerCase() === 'paytech') {
      return (
        <p className="flex align-items justify-between text-white">
          {t('pay-with-paytech')}
        </p>
      );
    }

    if (selectedPaymentMethod.name.toLowerCase() === 'stripe') {
      return (
        <span className="flex align-items justify-between text-white">
          {t('pay-with-stripe')}
        </span>
      );
    }

    if (selectedPaymentMethod.name.toLowerCase() === 'cinetpay') {
      return (
        <span className="flex align-items justify-between text-white">
          {t('pay-with-cinetpay')}
        </span>
      );
    }

    if (selectedPaymentMethod.qrCode) {
      return (
        <span className="flex items-center justify-between text-white">
          <CreditCard className="w-4 h-4 mr-2" />
          {t('order:scan-and-pay')}
        </span>
      );
    }

    return t('order:confirm-order');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-blue-500" />
          {t('confirm-order')}
        </h2>
      </div>
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 space-y-4">
        <div className="space-y-2">
          <h3 className="font-medium">{t('client-details')}</h3>
          <div className="space-y-2">
            {customerData.name && (
              <p className="text-gray-600 dark:text-gray-300">
                {customerData.name}
              </p>
            )}
            {customerData.phone && (
              <p className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <Phone className="w-4 h-4" />
                {customerData.phone}
              </p>
            )}
            {customerData.email && (
              <p className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <Mail className="w-4 h-4" />
                {customerData.email}
              </p>
            )}
            {customerData.diningOption === 'delivery' &&
              customerData.address && (
                <p className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <MapPin className="w-4 h-4" />
                  {customerData.address}
                </p>
              )}
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="font-medium">{t('common:item-ordered')}</h3>
          {cart.map((item: CartItem) => (
            <div key={item.id} className="flex justify-between items-center">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formatCurrency(item.price, settings?.currency)} ×{' '}
                  {item.quantity}
                </p>
              </div>
              <p className="font-medium">
                {formatCurrency(item.price * item.quantity, settings?.currency)}
              </p>
            </div>
          ))}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>{`${t('cart:sub-total')}`}</span>
              <span>{formatCurrency(subtotal, settings?.currency)}</span>
            </div>
            {taxes.map(tax => (
              <div
                key={tax.id}
                className="flex justify-between text-sm text-gray-600 dark:text-gray-400"
              >
                <span>
                  {tax.name} ({formatTaxRate(tax.rate)})
                </span>
                <span>{formatCurrency(tax.amount, settings?.currency)}</span>
              </div>
            ))}
            {settings?.tips.enabled && (
              <div className="pt-2 border-t dark:border-gray-700">
                <span className="mb-2 block">{settings.tips.label}</span>
                <div className="flex flex-wrap gap-2 mb-2">
                  {settings?.tips?.defaultPercentages
                    .map(Number)
                    ?.map(percentage => (
                      <button
                        key={percentage}
                        onClick={() => setTipPercentage(percentage)}
                        className={`
                              px-3 py-1 text-sm rounded-full transition-colors
                              ${
                                tip?.percentage === percentage
                                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                              }
                            `}
                      >
                        {percentage}%
                      </button>
                    ))}
                  <button
                    onClick={() => setTipPercentage(null)}
                    className="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                  >
                    {t('no-tip')}
                  </button>
                </div>

                {tip && (
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>
                      {settings.tips.label} ({tip.percentage}%)
                    </span>
                    <span>
                      {formatCurrency(tip.amount, settings?.currency)}
                    </span>
                  </div>
                )}
              </div>
            )}
            {deliveryZone && (
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-4">
                <span>{t('delivery')}</span>
                <span>
                  {formatCurrency(deliveryZone.price, settings?.currency)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-lg font-semibold border-t dark:border-gray-700 pt-2">
              <span>{t('total')}</span>
              <span className="text-blue-600 dark:text-blue-400">
                {formatCurrency(total, settings?.currency)}
              </span>
            </div>
          </div>
          {selectedPaymentMethod?.instruction && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-900/20"
            >
              <div className="flex items-center gap-3">
                <p className="text-amber-800 dark:text-amber-400 text-sm">
                  {selectedPaymentMethod?.instruction}
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
      {(showPaymentMethods ||
        (customerData.diningOption === 'dine-in' &&
          settings?.paymentOnDineInActivated)) && (
        <div className="space-y-4">
          <h3 className="font-medium flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            {t('common:payment-method')}
          </h3>
          <div className="space-y-3">
            {paymentMethods
              .filter(
                method =>
                  currencyObject?.acceptedPaymentMethods.includes(
                    method.name as any
                  ) ||
                  ![
                    'paytech',
                    'cinetpay',
                    'wave',
                    'stripe',
                    'money fusion',
                  ].includes(method.name?.toLowerCase())
              )
              .filter(method => {
                if (
                  customerData.diningOption === 'dine-in' &&
                  settings?.paymentOnDineInActivated &&
                  method.name?.toLowerCase() === 'paiement à la livraison'
                ) {
                  return false;
                }
                return true;
              })
              .map(method => (
                <label
                  key={method.id}
                  className={`
                  relative flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all
                  ${
                    selectedPayment === method.id
                      ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                  }
                `}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.id}
                    checked={selectedPayment === method.id}
                    onChange={e => {
                      setSelectedPayment(e.target.value);
                      setHasPaid(false);
                    }}
                    className="sr-only"
                  />
                  {method.qrCode ? (
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
                      <img
                        src={method.qrCode}
                        alt={method.name}
                        className="w-full h-full object-contain p-2"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium">
                      {t(`payment-method-names.${method.name}`) ===
                      `payment-method-names.${method.name}`
                        ? method.name
                        : t(`payment-method-names.${method.name}`)}
                    </p>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center
                    transition-colors duration-200 ${
                      selectedPayment === method.id
                        ? 'border-blue-500 bg-blue-500 dark:border-blue-400 dark:bg-blue-400'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <AnimatePresence>
                      {selectedPayment === method.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="w-2.5 h-2.5 rounded-full bg-white"
                        />
                      )}
                    </AnimatePresence>
                  </div>
                </label>
              ))}
            {(selectedPaymentMethod?.url ||
              selectedPaymentMethod?.qrCode ||
              selectedPaymentMethod?.name.toLowerCase() === 'cinetpay') &&
              hasClickedPaymentLink &&
              !hasPaid && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800"
                >
                  <div className="flex flex-col items-center gap-3">
                    <p className="text-center text-sm text-gray-600 dark:text-gray-300">
                      {t('payment-confirmation')}
                    </p>
                    <Button
                      onClick={() => setHasPaid(true)}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      {t('i-have-paid')}
                    </Button>
                  </div>
                </motion.div>
              )}
          </div>
        </div>
      )}
      <div className="flex flex-col justify-end gap-4">
        {(!['paytech', 'stripe', 'cinetpay', 'money fusion'].includes(
          selectedPaymentMethod?.name.toLowerCase() || ''
        ) ||
          hasPaid) && (
          <Button
            onClick={handleConfirm}
            disabled={
              (showPaymentMethods && !selectedPayment) ||
              (customerData.diningOption === 'dine-in' &&
                settings?.paymentOnDineInActivated &&
                !selectedPayment) ||
              isConfirmingOrder
            }
            className={`
            flex items-center bg-gradient-to-r from-blue-600 to-indigo-600
            hover:from-blue-700 hover:to-indigo-700
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
            spanClassName="text-white"
          >
            <span className="text-white">{renderPaymentButton()}</span>
          </Button>
        )}

        {selectedPaymentMethod?.name.toLowerCase() === 'cinetpay' &&
          !hasPaid &&
          settings?.currency && (
            <CinetPayPayment
              onConfirm={() => {
                setHasClickedPaymentLink(true);
              }}
              paymentMethod={{
                apiKey: `${selectedPaymentMethod.apiKey}`,
                apiSecret: `${selectedPaymentMethod.apiSecret}`,
              }}
              settings={settings as any}
              amount={Math.round(total)}
            />
          )}

        {selectedPaymentMethod?.name.toLowerCase() === 'stripe' &&
          settings?.currency && (
            <StripePayment
              apiKey={selectedPaymentMethod.apiKey!}
              apiSecret={selectedPaymentMethod.apiSecret!}
              amount={total}
              currency={settings.currency.toLowerCase()}
              onConfirm={handleOrderConfirm}
            />
          )}
        {selectedPaymentMethod?.name.toLowerCase() === 'paytech' &&
          settings?.currency && (
            <PayTechPaymentButton
              onConfirm={handleOrderConfirm}
              total={total}
              cart={cart}
              paymentMethod={{
                apiKey: `${selectedPaymentMethod.apiKey}`,
                apiSecret: `${selectedPaymentMethod.apiSecret}`,
              }}
              currency={settings.currency}
            />
          )}
        {selectedPaymentMethod?.name.toLowerCase() === 'money fusion' &&
          !hasPaid &&
          settings?.currency && (
            <MoneyFusionPaymentButton
              onConfirm={handleOrderConfirm}
              total={total}
              cart={cart}
              paymentMethod={{
                apiKey: `${selectedPaymentMethod.apiKey}`,
                url: `${selectedPaymentMethod.url}`,
              }}
              currency={settings.currency}
              customerData={{
                name: customerData.name,
                phone: customerData.phone,
                email: customerData.email,
              }}
            />
          )}

        <Button variant="secondary" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('common:back')}
        </Button>
      </div>
      <AnimatePresence>
        {showQRCode && selectedPaymentMethod?.qrCode && (
          <QRCodeModal
            qrCode={selectedPaymentMethod.qrCode}
            onClose={() => {
              setShowQRCode(false);
              setHasClickedPaymentLink(true);
              setHasPaid(false);
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const PayTechModal = ({
  onClose,
  iframeUrl,
}: {
  onClose: () => void;
  iframeUrl: string;
}) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        onClick={e => e.stopPropagation()}
        className="relative aspect-square bg-white dark:bg-gray-800 rounded-2xl overflow-hidden min-h-[600px]"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 p-2 rounded-full bg-white/90 dark:bg-gray-800/90 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <iframe src={iframeUrl} width={`100%`} height={'100%'}></iframe>
      </motion.div>
    </div>
  );
};

const PayTechPaymentButton = ({
  total,
  paymentMethod,
  cart,
  onConfirm,
  currency,
}: {
  paymentMethod: {
    apiKey: string;
    apiSecret: string;
  };
  total: number;
  cart: CartItem[];
  currency: string;
  onConfirm: () => void;
}) => {
  const { t } = useTranslation('order');
  const {
    isPaying,
    paymentSucceeded,
    paymentResponse,
    requestPayment,
    ref,
    paymentError,
  } = usePaytech({
    paymentMethod,
    total,
    cart,
    onConfirm,
    currency,
  });

  const [isClosed, setIsClosed] = useState(true);

  const handleClose = async () => {
    if (ref) {
      const order = await getOrderByRef(ref);

      if (order && order.status === 'sale_complete') {
        onConfirm();
      }
    }

    setIsClosed(false);
  };

  return (
    <>
      <AnimatePresence>
        {isClosed && paymentSucceeded && paymentResponse?.redirect_url && (
          <PayTechModal
            onClose={handleClose}
            iframeUrl={paymentResponse?.redirect_url}
          />
        )}
      </AnimatePresence>
      {paymentError && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/20"
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-sm font-medium text-red-800 dark:text-red-400">
              {paymentError}
            </p>
          </div>
        </motion.div>
      )}
      <Button
        disabled={isPaying}
        onClick={
          paymentSucceeded
            ? () => {
                setIsClosed(true);
              }
            : requestPayment
        }
        className={`
    bg-gradient-to-r from-blue-600 to-indigo-600
    hover:from-blue-700 hover:to-indigo-700
    disabled:opacity-50 disabled:cursor-not-allowed
  `}
      >
        <span className="text-white">{t('pay-with-paytech')}</span>
      </Button>
    </>
  );
};
