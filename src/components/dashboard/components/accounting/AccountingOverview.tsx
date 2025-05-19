import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, DollarSign } from 'lucide-react';
import { AccountingStats } from '../../../../types/accounting';
import { useSettings } from '../../../../hooks/useSettings';
import { formatCurrency } from '../../../../utils/currency';
import { useTranslation } from 'react-i18next';

interface AccountingOverviewProps {
  stats: AccountingStats | null;
  isLoading: boolean;
}

export function AccountingOverview({
  stats,
  isLoading,
}: AccountingOverviewProps) {
  const { t } = useTranslation();
  const { settings } = useSettings();

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Main statistics skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-32 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg"
            />
          ))}
        </div>

        {/* Additional statistics skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i + 3}
              className="h-32 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg opacity-50"
            />
          ))}
        </div>
      </div>
    );
  }

  const overviewStats = [
    {
      label: t('comptability:flow'),
      amount: stats?.totalDebit || 0,
      icon: ArrowUpRight,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      label: t('comptability:credit'),
      amount: stats?.totalCredit || 0,
      icon: ArrowDownRight,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      label: t('comptability:net-amount'),
      amount: stats?.netAmount || 0,
      icon: DollarSign,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
  ];

  // Additional statistics for taxes, tips, and delivery if available
  const additionalStats = [
    ...(stats?.totalTaxes !== undefined
      ? [
        {
          label: t('comptability:total-taxes'),
          amount: stats.totalTaxes || 0,
          icon: DollarSign,
          color: 'text-indigo-600 dark:text-indigo-400',
          bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
        },
      ]
      : []),
    ...(stats?.totalTips !== undefined
      ? [
        {
          label: t('comptability:total-tips'),
          amount: stats.totalTips || 0,
          icon: DollarSign,
          color: 'text-amber-600 dark:text-amber-400',
          bgColor: 'bg-amber-50 dark:bg-amber-900/20',
        },
      ]
      : []),
    ...(stats?.totalDelivery !== undefined
      ? [
        {
          label: t('comptability:total-delivery'),
          amount: stats.totalDelivery || 0,
          icon: DollarSign,
          color: 'text-cyan-600 dark:text-cyan-400',
          bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
        },
      ]
      : []),
  ];

  return (
    <div className="space-y-6">
      {/* Main statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {overviewStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {stat.label}
                </p>
                <p className="text-2xl font-semibold">
                  {formatCurrency(stat.amount, settings?.currency)}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Additional statistics if available */}
      {additionalStats.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {additionalStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-semibold">
                    {formatCurrency(stat.amount, settings?.currency)}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
