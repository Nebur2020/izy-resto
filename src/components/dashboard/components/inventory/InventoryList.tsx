import { useState } from 'react';
import { Edit2, Trash2, AlertTriangle, PackageX } from 'lucide-react';
import { InventoryItem } from '../../../../types/inventory';
import { Button } from '../../../ui/Button';
import {
  formatCurrency,
  formatNumberByLanguage,
} from '../../../../utils/currency';
import { formatDate } from '../../../../utils/date';
import { useSettings } from '../../../../hooks/useSettings';
import { Pagination } from '../../../ui/Pagination';
import { useTranslation } from 'react-i18next';
import { Language } from '../../../../types';

interface IInventoryListProps {
  items: InventoryItem[];
  isLoading: boolean;
  onEdit: (item: InventoryItem) => void;
  onDelete: (id: string) => void;
}

const ITEMS_PER_PAGE = 9;

export function InventoryList(props: IInventoryListProps) {
  const { items, isLoading, onEdit, onDelete } = props;
  const { settings } = useSettings();
  const [currentPage, setCurrentPage] = useState(1);
  const { t, i18n } = useTranslation();
  const lang = i18n.language as Language;

  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedItems = items.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-16 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg"
          />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gray-100 dark:bg-gray-700 rounded-full">
            <PackageX className="w-8 h-8 text-gray-500 dark:text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {t('common:no-product-in-stock')}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {t('common:no-product-in-stock-description')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b dark:border-gray-700">
              <th className="px-4 py-3 text-left">{t('inventory:product')}</th>
              <th className="px-4 py-3 text-left">{t('inventory:category')}</th>
              <th className="px-4 py-3 text-right">
                {t('inventory:quantity')}
              </th>
              <th className="px-4 py-3 text-right">
                {t('inventory:unit-price')}
              </th>
              <th className="px-4 py-3 text-left">
                {t('inventory:expiry-date')}
              </th>
              <th className="px-4 py-3 text-right">{t('inventory:actions')}</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map(item => {
              const isLowStock =
                Number(item.quantity) <= Number(item.minQuantity);
              const numericPrice =
                typeof item.price === 'string'
                  ? parseFloat(item.price)
                  : item.price;

              return (
                <tr key={item.id} className="border-b dark:border-gray-700">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {isLowStock && (
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                      )}
                      <div>
                        <div className="font-medium">{item.name}</div>
                        {item.description && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {item.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-sm dark:bg-gray-800">
                      {t(`common:category-names.${item.category}`)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`font-medium ${
                        isLowStock ? 'text-red-500' : ''
                      }`}
                    >
                      {formatNumberByLanguage(
                        Number(Number(item.quantity).toFixed(2)),
                        'fr-FR'
                      )}{' '}
                      {t(`common:units-name.${item.unit}`)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {formatCurrency(numericPrice, settings?.currency)}
                  </td>
                  <td className="px-4 py-3">
                    {item.expiryDate
                      ? formatDate(item.expiryDate, false, lang)
                      : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onEdit(item)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => onDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="px-6 py-4 border-t dark:border-gray-700">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
