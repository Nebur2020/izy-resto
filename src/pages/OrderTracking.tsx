import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Home, Star, XCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useOrders } from '../context/OrderContext';
import { OrderTrackingDetails } from '../components/orders/tracking/OrderTrackingDetails';
import { OrderTrackingHeader } from '../components/orders/tracking/OrderTrackingHeader';
import { OrderTrackingTimeline } from '../components/orders/tracking/OrderTrackingTimeline';
import { OrderRating } from '../components/orders/rating/OrderRating';
import { orderService } from '../services/orders/order.service';
import { LoadingScreen } from '../components/ui/LoadingScreen';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Order } from '../types';
import { db } from '../lib/firebase/config';
import { doc, onSnapshot } from 'firebase/firestore';

export default function OrderTracking() {
  const { t } = useTranslation('order');
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { getOrderById } = useOrders();
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [order, setOrder] = useState<Order | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  // Memoize the fetchInitialOrder function to prevent recreation on each render
  const fetchInitialOrder = useCallback(
    async (id: string) => {
      try {
        return await getOrderById(id);
      } catch (error) {
        console.error('Error fetching initial order:', error);
        return undefined;
      }
    },
    [getOrderById]
  );

  // Fetch initial order data and set up real-time listener
  useEffect(() => {
    let unsubscribe: () => void = () => {};
    let isMounted = true;

    async function setupOrderListener() {
      if (!orderId) {
        if (isMounted) setIsLoading(false);
        return;
      }

      try {
        // Initial fetch to quickly display something
        const initialOrder = await fetchInitialOrder(orderId);
        if (isMounted) {
          setOrder(initialOrder);
        }

        // Set up real-time listener
        const orderRef = doc(db, 'orders', orderId);
        unsubscribe = onSnapshot(
          orderRef,
          docSnapshot => {
            if (!isMounted) return;

            if (docSnapshot.exists()) {
              const orderData = {
                id: docSnapshot.id,
                ...docSnapshot.data(),
              } as Order;
              setOrder(orderData);
            } else {
              setOrder(undefined);
              toast.error(t('order-no-longer-exists'));
            }
            setIsLoading(false);
          },
          error => {
            if (!isMounted) return;
            console.error('Error listening to order updates:', error);
            toast.error(t('error-tracking-order'));
            setIsLoading(false);
          }
        );
      } catch (error) {
        if (!isMounted) return;
        console.error('Error setting up order listener:', error);
        toast.error(t('error-loading-order'));
        setIsLoading(false);
      }
    }

    setupOrderListener();

    // Clean up listener on unmount
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [orderId, fetchInitialOrder, t]);

  const handleSubmitRating = useCallback(async () => {
    if (!orderId || rating === 0) return;

    try {
      setIsSubmitting(true);
      await orderService.updateOrderRating(orderId, rating, feedback);

      // The order will update automatically via the real-time listener
      toast.success(t('common:thank-you-for-your-opinion'));
    } catch (error: any) {
      console.error('Error submitting rating:', error);
      toast.error(t('error-submitting-rating'));
    } finally {
      setIsSubmitting(false);
    }
  }, [orderId, rating, feedback, t]);

  if (isLoading) {
    return <LoadingScreen isLoading={true} />;
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">{t('order-not-exist')}</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
          {t('this-order-no-longer-exist')}
        </p>
        <div className="flex gap-4">
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common:back')}
          </Button>
          <Link to="/">
            <Button variant="secondary">
              <Home className="w-4 h-4 mr-2" />
              {t('common:home')}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common:back')}
          </Button>
          <Link to="/">
            <Button variant="secondary">
              <Home className="w-4 h-4 mr-2" />
              {t('common:home')}
            </Button>
          </Link>
        </div>
        <div className="space-y-6">
          <div>
            <div
              className={`p-6 text-white rounded-t-2xl shadow-xl overflow-hidden ${
                order.status === 'cancelled'
                  ? 'bg-red-600'
                  : 'bg-gradient-to-r from-emerald-500 to-green-600'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  {order.status === 'cancelled' ? (
                    <XCircle className="w-8 h-8" />
                  ) : (
                    <CheckCircle className="w-8 h-8" />
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold mb-1">
                    {order.status === 'cancelled'
                      ? t('order-canceled')
                      : t('order-confirmed')}
                  </h1>
                  <p className="text-white/80">
                    {order.status === 'cancelled'
                      ? t('this-order-is-canceled')
                      : t('order-successfully-saved')}
                  </p>
                </div>
              </div>
            </div>
            <OrderTrackingHeader order={order} />
          </div>

          <OrderTrackingTimeline order={order} />

          <OrderTrackingDetails order={order} />

          {(order.status === 'delivered' || order.status === 'cancelled') &&
            !order.rating && (
              <OrderRating
                rating={rating}
                onRatingChange={setRating}
                feedback={feedback}
                onFeedbackChange={setFeedback}
                onSubmit={handleSubmitRating}
                isSubmitting={isSubmitting}
              />
            )}

          {/* Show rating if exists */}
          {order.rating && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">
                {t('your-feedback')}
              </h3>
              <div className="flex items-center gap-2 mb-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= (order?.rating?.rating || 0)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                ))}
              </div>
              {order.rating.feedback && (
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  {order.rating.feedback}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
