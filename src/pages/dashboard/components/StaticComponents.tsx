import { memo } from 'react';
import { Loader } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface LoadingStateProps {
    message?: string;
}

// Loading state component
function LoadingStateComponent({ message }: LoadingStateProps) {
    const { t } = useTranslation('dashboard');

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <Loader className="w-10 h-10 mx-auto text-blue-500 animate-spin mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                    {message || t('loading-orders')}
                </p>
            </div>
        </div>
    );
}

// Error state component
interface ErrorStateProps {
    error: Error | null;
    onRetry?: () => void;
}

function ErrorStateComponent({ error, onRetry = () => window.location.reload() }: ErrorStateProps) {
    const { t } = useTranslation('dashboard');

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center bg-red-50 dark:bg-red-900/20 p-6 rounded-xl max-w-md">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-800/30 flex items-center justify-center">
                    <span className="text-2xl">⚠️</span>
                </div>
                <h2 className="text-xl font-semibold mb-2 text-red-700 dark:text-red-400">
                    {t('error-loading-orders')}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {error?.message || t('unknown-error')}
                </p>
                <button
                    onClick={onRetry}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    {t('try-again')}
                </button>
            </div>
        </div>
    );
}

// Mobile view component
interface MobileViewProps {
    primaryColor?: string;
}

function MobileViewComponent({ primaryColor }: MobileViewProps) {
    const { t } = useTranslation(['dashboard', 'common']);

    return (
        <div className="p-4 space-y-6">
            <div className="text-center bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: primaryColor, opacity: 0.1 }}>
                    <span className="text-2xl">📱</span>
                </div>
                <h2 className="text-xl font-semibold mb-2">
                    {t('limit-view-on-mobile')}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {t('best-experience')}
                </p>
            </div>
        </div>
    );
}

// Export memoized components to prevent unnecessary re-renders
export const LoadingState = memo(LoadingStateComponent);
export const ErrorState = memo(ErrorStateComponent);
export const MobileView = memo(MobileViewComponent);
