
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { Button } from '../../ui/Button';
import { useTranslation } from 'react-i18next';

interface OrderRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  feedback: string;
  onFeedbackChange: (feedback: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function OrderRating({
  rating,
  onRatingChange,
  feedback,
  onFeedbackChange,
  onSubmit,
  isSubmitting
}: OrderRatingProps) {
  const { t } = useTranslation(['order']);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
    >
      <h3 className="text-lg font-semibold mb-6">{t('order:rating.your-feedback')}</h3>

      <div className="space-y-6">
        {/* Star Rating */}
        <div>
          <p className="text-sm font-medium mb-3">{t('order:rating.how-would-you-rate')}</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => onRatingChange(star)}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star
                  className={`w-8 h-8 ${star <= rating
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300 dark:text-gray-600'
                    }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Feedback */}
        <div>
          <label className="block text-sm font-medium mb-2">
            {t('order:rating.add-comment')}
          </label>
          <textarea
            value={feedback}
            onChange={(e) => onFeedbackChange(e.target.value)}
            rows={3}
            className="w-full rounded-lg border dark:border-gray-600 p-3 dark:bg-gray-700"
            placeholder={t('order:rating.share-experience')}
          />
        </div>

        {/* Submit Button */}
        <Button
          onClick={onSubmit}
          disabled={rating === 0 || isSubmitting}
          className="w-full"
        >
          {isSubmitting ? t('order:rating.sending') : t('order:rating.send-feedback')}
        </Button>
      </div>
    </motion.div>
  );
}
