import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useSettings } from '../hooks/useSettings';
import { useTranslation } from 'react-i18next';

export function TermsOfService() {
  const { settings } = useSettings();
  const { t } = useTranslation('common');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <Link to="/">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('back-home')}
          </Button>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold">{t('terms-and-conditions')}</h1>
          </div>

          <div className="prose dark:prose-invert max-w-none">
            {settings?.termsOfService ? (
              <div
                dangerouslySetInnerHTML={{ __html: settings.termsOfService }}
              />
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>
                  Les conditions générales d'utilisation ne sont pas encore
                  disponibles.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
