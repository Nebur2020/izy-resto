import { motion } from 'framer-motion';
import { Star, MessageSquare, User, Phone } from 'lucide-react';
import { Language, Order } from '../../../../types';
import { useSettings } from '../../../../hooks/useSettings';
import {
  formatCurrency,
  formatNumberByLanguage,
} from '../../../../utils/currency';
import { formatFirestoreTimestamp } from '../../../../utils/date';
import { Pagination } from '../../../ui/Pagination';
import { useTranslation } from 'react-i18next';

interface FeedbackAnalyticsProps {
  orders: Order[];
  currentPage: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
}

export function FeedbackAnalytics(props: FeedbackAnalyticsProps) {
  const { orders, currentPage, onPageChange, itemsPerPage = 10 } = props;
  const { settings } = useSettings();
  const { t, i18n } = useTranslation('common');
  const lng = i18n.language as Language;

  const ratedOrders = orders.filter(order => order.rating);

  const averageRating =
    ratedOrders.length > 0
      ? ratedOrders.reduce(
          (sum, order) => sum + (order.rating?.rating || 0),
          0
        ) / ratedOrders.length
      : 0;

  const ratingDistribution = ratedOrders.reduce((acc, order) => {
    const rating = order.rating?.rating || 0;
    acc[rating] = (acc[rating] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const totalPages = Math.ceil(ratedOrders.length / itemsPerPage);
  const paginatedOrders = ratedOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <Star className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('average-rate')}
              </p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-semibold">
                  {formatNumberByLanguage(
                    Number(averageRating.toFixed(2)),
                    'fr-FR'
                  )}
                </p>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= Math.round(averageRating)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <MessageSquare className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('common:total-note')}
              </p>
              <p className="text-2xl font-semibold">{ratedOrders.length}</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <User className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('common:notification-rate')}
              </p>
              <p className="text-2xl font-semibold">
                {orders.length > 0
                  ? `${formatNumberByLanguage(
                      Number(
                        ((ratedOrders.length / orders.length) * 100).toFixed(1)
                      ),
                      'fr-FR'
                    )}%`
                  : '0%'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">
          {t('common:note-dispatching')}
        </h3>
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map(rating => {
            const count = ratingDistribution[rating] || 0;
            const percentage =
              ratedOrders.length > 0 ? (count / ratedOrders.length) * 100 : 0;

            return (
              <div key={rating} className="flex items-center gap-4">
                <div className="flex items-center gap-2 w-20">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-sm font-medium">{rating}</span>
                </div>
                <div className="flex-1">
                  <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      className="h-full bg-yellow-400"
                    />
                  </div>
                </div>
                <div className="w-20 text-right">
                  <span className="text-sm text-gray-500">
                    {count} ({percentage.toFixed(1)}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        <div className="p-6 border-b dark:border-gray-700">
          <h3 className="text-lg font-semibold">{t('analyse:client-note')}</h3>
        </div>
        <div className="divide-y dark:divide-gray-700">
          {paginatedOrders.length > 0 ? (
            paginatedOrders.map(order => (
              <div key={order.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{order.customerName}</h4>
                      <span className="text-sm text-gray-500">
                        • {t('order:order')} #{order.id.slice(0, 8)}
                      </span>
                    </div>
                    {order.customerPhone && (
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
                        <Phone className="w-4 h-4" />
                        {order.customerPhone}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= (order.rating?.rating || 0)
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300 dark:text-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {formatFirestoreTimestamp(
                        order.rating?.createdAt || order.createdAt,
                        lng
                      )}
                    </p>
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      {formatCurrency(order.total, settings?.currency)}
                    </p>
                  </div>
                </div>
                {order.rating?.feedback && (
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    {order.rating.feedback}
                  </p>
                )}
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <MessageSquare className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {t('analyse:no-client-feedback')}
              </p>
            </div>
          )}

          {ratedOrders.length === 0 && (
            <div className="p-12 text-center">
              <MessageSquare className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {t('analyse:no-client-feedback')}
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-6 border-t dark:border-gray-700">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}
