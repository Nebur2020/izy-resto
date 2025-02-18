import { Transaction } from '../../../../types/accounting';
import { formatCurrency } from '../../../../utils/currency';
import { formatDate } from '../../../../utils/date';
import { Building, TrendingUp, TrendingDown, FileText } from 'lucide-react';
import { Language, RestaurantSettings } from '../../../../types';
import { useTranslation } from 'react-i18next';

interface IFinancialStatementProps {
  transactions: Transaction[];
  period: { startDate: Date; endDate: Date };
  settings: RestaurantSettings;
}

export function FinancialStatement(props: IFinancialStatementProps) {
  const { t, i18n } = useTranslation();
  const lng = i18n.language as Language;
  const { transactions, period, settings } = props;
  const totals = transactions.reduce(
    (acc, t) => ({
      debit: acc.debit + (t.debit || 0),
      credit: acc.credit + (t.credit || 0),
      net: acc.net + ((t.credit || 0) - (t.debit || 0)),
    }),
    { debit: 0, credit: 0, net: 0 }
  );

  const currency = settings?.currency || 'XOF';

  return (
    <div className="p-12 bg-white text-black font-sans max-w-4xl mx-auto">
      <div className="border-b-2 border-gray-300 pb-6 mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-blue-800">
              {settings?.name || 'Restaurant'}
            </h1>
            <h2 className="text-xl font-semibold text-black">
              {t('common:financial-statement')}
            </h2>
          </div>
          <div className="text-right">
            <Building className="w-12 h-12 text-black mx-auto mb-2" />
            <p className="text-sm text-black" style={{ color: '#000' }}>
              {t('common:period')}{' '}
              {formatDate(period.startDate.toISOString(), false, lng)} -{' '}
              {formatDate(period.endDate.toISOString(), false, lng)}
            </p>
          </div>
        </div>
      </div>

      <table className="w-full mb-8 border-collapse">
        <thead>
          <tr className="bg-blue-50">
            <th className="text-left px-3 py-2 border-b border-gray-200 font-semibold text-black">
              {t('common:date')}
            </th>
            <th className="text-left px-3 py-2 border-b border-gray-200 font-semibold text-black">
              {t('common:source')}
            </th>
            <th className="text-left px-3 py-2 border-b border-gray-200 font-semibold text-black">
              {t('common:description')}
            </th>
            <th className="text-left px-3 py-2 border-b border-gray-200 font-semibold text-black">
              {t('common:reference')}
            </th>
            <th className="text-right px-3 py-2 border-b border-gray-200 font-semibold text-black">
              {t('common:debit')}
            </th>
            <th className="text-right px-3 py-2 border-b border-gray-200 font-semibold text-black">
              {t('common:credit')}
            </th>
            <th className="text-right px-3 py-2 border-b border-gray-200 font-semibold text-black">
              {t('common:gross')}
            </th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(transaction => (
            <tr
              key={transaction.id}
              className="hover:bg-gray-50 transition-colors"
            >
              <td className="px-3 py-2 border-b border-gray-100 text-black">
                {formatDate(transaction.date)}
              </td>
              <td className="px-3 py-2 border-b border-gray-100 text-black">
                {transaction.source}
              </td>
              <td className="px-3 py-2 border-b border-gray-100 text-black">
                {transaction.description}
              </td>
              <td className="px-3 py-2 border-b border-gray-100 text-black">
                {transaction.reference}
              </td>
              <td className="text-right px-3 py-2 border-b border-gray-100 text-black font-semibold	">
                {transaction.debit > 0 &&
                  formatCurrency(transaction.debit, currency)}
              </td>
              <td className="text-right px-3 py-2 border-b border-gray-100 text-black font-semibold">
                {transaction.credit > 0 &&
                  formatCurrency(transaction.credit, currency)}
              </td>
              <td className="text-right px-3 py-2 border-b border-gray-100 text-black font-bold">
                {formatCurrency(transaction.gross, currency)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 rounded-lg p-6 shadow-sm">
          <div className="flex items-center mb-3">
            <TrendingDown className="w-6 h-6 text-red-500 mr-3" />
            <p
              className="text-sm font-medium text-black"
              style={{ color: '#000' }}
            >
              {t('common:total-debit')}
            </p>
          </div>
          <p
            className="text-2xl font-bold text-black"
            style={{ color: '#000' }}
          >
            {formatCurrency(totals.debit, currency)}
          </p>
        </div>
        <div className="bg-blue-50 rounded-lg p-6 shadow-sm">
          <div className="flex items-center mb-3">
            <TrendingUp className="w-6 h-6 text-green-500 mr-3" />
            <p
              className="text-sm font-medium text-black"
              style={{ color: '#000' }}
            >
              {t('common:total-credit')}
            </p>
          </div>
          <p
            className="text-2xl font-bold text-black"
            style={{ color: '#000' }}
          >
            {formatCurrency(totals.credit, currency)}
          </p>
        </div>
        <div className="bg-blue-50 rounded-lg p-6 shadow-sm">
          <div className="flex items-center mb-3">
            <FileText className="w-6 h-6 text-blue-500 mr-3" />
            <p
              className="text-sm font-medium text-black"
              style={{ color: '#000' }}
            >
              {t('common:net-amount')}
            </p>
          </div>
          <p
            className={`text-2xl font-bold ${
              totals.net >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
            style={{ color: '#000' }}
          >
            {formatCurrency(totals.net, currency)}
          </p>
        </div>
      </div>

      <div className="border-t border-gray-300 pt-6 text-center">
        <div className="flex justify-between items-center">
          <div className="text-left">
            <p
              className="text-sm font-medium text-black"
              style={{ color: '#000' }}
            >
              {settings?.name || 'Restaurant'}
            </p>
            <p className="text-xs text-black" style={{ color: '#000' }}>
              {settings?.address || t('common:address-not-found')}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-black" style={{ color: '#000' }}>
              {t('common:genereted-date', {
                date: formatDate(new Date().toISOString(), false, lng),
              })}
            </p>
            <p className="text-xs text-black" style={{ color: '#000' }}>
              {t("common:all-right-reserved")} {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
