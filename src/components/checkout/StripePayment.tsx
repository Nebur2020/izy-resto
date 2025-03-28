import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui';
import { useState, useEffect } from 'react';
import { AlertCircle, X, CreditCard, Lock } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import {
  CardElement,
  useElements,
  useStripe,
  Elements,
} from '@stripe/react-stripe-js';
import { processPayment } from '../../services/payments/stripe.service';
import { AxiosError } from 'axios';

// Helper function to get lighter/darker variations of a color
const getLighterColor = (hexColor: string, opacity = 0.1) => {
  // For simplicity using opacity, but could be improved with actual color manipulation
  return `${hexColor}${Math.round(opacity * 255)
    .toString(16)
    .padStart(2, '0')}`;
};

const useCardElementStyle = (isDarkModeFromProps?: boolean) => {
  const [isDarkMode, setIsDarkMode] = useState(isDarkModeFromProps || false);

  useEffect(() => {
    if (isDarkModeFromProps !== undefined) {
      setIsDarkMode(isDarkModeFromProps);
      return;
    }

    // Check initial dark mode
    setIsDarkMode(document.documentElement.classList.contains('dark'));

    // Create observer for dark mode changes
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.attributeName === 'class') {
          setIsDarkMode(document.documentElement.classList.contains('dark'));
        }
      });
    });

    // Start observing
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, [isDarkModeFromProps]);

  return {
    style: {
      base: {
        fontSize: '16px',
        color: isDarkMode ? '#ffffff' : '#000000',
        '::placeholder': {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.4)',
        },
        iconColor: isDarkMode ? '#ffffff' : '#000000',
      },
    },
  };
};

interface PaymentModalProps {
  onClose: () => void;
  onConfirm: () => void;
  amount: number;
  currency: string;
  apiSecret: string;
  primaryColor?: string;
  backgroundColor?: string;
  isDarkMode?: boolean;
}

const PaymentModal = ({
  onClose,
  amount,
  currency,
  onConfirm,
  apiSecret,
  primaryColor = '#3b82f6',
  backgroundColor = '#f3f4f6',
  isDarkMode = false,
}: PaymentModalProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const cardElementStyle = useCardElementStyle(isDarkMode);

  // Function to get styles with dynamic colors
  const getStyle = (element: string) => {
    switch (element) {
      case 'header':
        return {
          className: 'px-6 py-4 text-white',
          style: {
            background: `linear-gradient(to right, ${primaryColor}, ${
              isDarkMode ? '#4B5563' : getLighterColor(primaryColor, 0.8)
            })`,
          },
        };
      case 'payButton':
        return {
          className:
            'w-full text-white font-medium py-2.5 disabled:opacity-50 disabled:cursor-not-allowed',
          style: {
            background: `linear-gradient(to right, ${primaryColor}, ${
              isDarkMode ? '#4B5563' : getLighterColor(primaryColor, 0.8)
            })`,
          },
        };
      case 'errorAlert':
        return {
          className: 'rounded-lg border p-4',
          style: {
            backgroundColor: isDarkMode
              ? 'rgba(220, 38, 38, 0.1)'
              : 'rgba(254, 226, 226, 1)',
            borderColor: isDarkMode
              ? 'rgba(185, 28, 28, 0.3)'
              : 'rgba(248, 113, 113, 0.5)',
          },
        };
      case 'cardInfoBox':
        return {
          className: 'rounded-lg p-4 border',
          style: {
            backgroundColor: isDarkMode ? '#1f2937' : '#f9fafb', // gray-800 or gray-50
            borderColor: isDarkMode ? '#374151' : '#e5e7eb', // gray-700 or gray-200
          },
        };
      default:
        return {};
    }
  };

  const handleSubmit = async (event: any) => {
    try {
      event.preventDefault();
      setLoading(true);

      if (!elements) {
        throw new Error('elements not exist');
      }

      const card = elements.getElement(CardElement);

      if (!card) throw new Error('card not exists');

      if (!stripe) {
        throw new Error('Stripe not exist');
      }

      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card,
      });

      if (error) {
        throw new Error(error.message || 'Error');
      }

      const result: any = await processPayment({
        amount,
        currency,
        apiSecret,
        paymentMethodId: paymentMethod.id,
        return_url: window.location.href,
      });

      if (!result) {
        throw new Error('Error');
      }

      if (result.success) {
        onClose();
        onConfirm();
        return;
      }

      if (result.requiresAction) {
        const { error } = await stripe.confirmCardPayment(
          result.paymentIntentClientSecret
        );

        if (error) {
          console.error('Payment Confirmation Error:', error.message);
          setErrorMessage(
            error.message || 'Une erreur de paiement est survenue'
          );
          throw new Error('Error');
        } else {
          onClose();
          onConfirm();
          return;
        }
      }

      throw new Error('Error');
    } catch (error: any) {

      if (error instanceof AxiosError) {
        setErrorMessage(
          error.response?.data?.message || 'Erreur de paiement...'
        );
        return;
      }

      setErrorMessage(error.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const formattedAmount = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
  }).format(amount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden"
      >
        <div
          className={getStyle('header').className}
          style={getStyle('header').style}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Paiement sécurisé</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="mt-2 text-white/90">
            Montant à payer: {formattedAmount}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            <div
              className={getStyle('cardInfoBox').className}
              style={getStyle('cardInfoBox').style}
            >
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Informations de carte
                </span>
              </div>
              <CardElement options={cardElementStyle} />
            </div>

            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className={getStyle('errorAlert').className}
                style={getStyle('errorAlert').style}
              >
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <p className="text-sm font-medium text-red-800 dark:text-red-400">
                    {errorMessage}
                  </p>
                </div>
              </motion.div>
            )}

            <div>
              <Button
                className={getStyle('payButton').className}
                style={getStyle('payButton').style}
                type="submit"
                disabled={!stripe || !elements || loading}
              >
                {loading ? (
                  'Traitement en cours...'
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Lock className="w-4 h-4" />
                    Payer {formattedAmount}
                  </span>
                )}
              </Button>
            </div>

            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              Paiement sécurisé via Stripe
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

interface StripePaymentProps {
  amount: number;
  currency: string;
  apiSecret: string;
  apiKey: string;
  onConfirm: () => void;
  primaryColor?: string;
  backgroundColor?: string;
  isDarkMode?: boolean;
}

export const StripePayment = ({
  amount,
  currency,
  onConfirm,
  apiKey,
  apiSecret,
  primaryColor = '#3b82f6',
  backgroundColor = '#f3f4f6',
  isDarkMode = false,
}: StripePaymentProps) => {
  const [isClosed, setIsClosed] = useState(true);

  const handleClose = () => {
    setIsClosed(true);
  };

  const stripePromise = loadStripe(apiKey);

  // Function to get button style
  const getButtonStyle = () => {
    return {
      className: 'text-white font-medium py-2.5',
      style: {
        background: `linear-gradient(to right, ${primaryColor}, ${
          isDarkMode ? '#4B5563' : getLighterColor(primaryColor, 0.8)
        })`,
      },
    };
  };

  return (
    <>
      <AnimatePresence>
        {!isClosed && (
          <Elements
            stripe={stripePromise}
            options={{
              mode: 'payment',
              amount: Math.round(amount * 100),
              currency,
            }}
          >
            <PaymentModal
              apiSecret={apiSecret}
              amount={amount}
              currency={currency}
              onClose={handleClose}
              onConfirm={onConfirm}
              primaryColor={primaryColor}
              backgroundColor={backgroundColor}
              isDarkMode={isDarkMode}
            />
          </Elements>
        )}
      </AnimatePresence>

      <Button
        onClick={() => setIsClosed(false)}
        className={getButtonStyle().className}
        style={getButtonStyle().style}
      >
        <span className="flex items-center gap-2">
          <CreditCard className="w-4 h-4" />
          Payer avec Stripe
        </span>
      </Button>
    </>
  );
};

export default StripePayment;
