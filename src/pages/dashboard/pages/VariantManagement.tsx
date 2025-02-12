import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useVariants } from '../../../hooks/useVariants';
import { useCategories } from '../../../hooks/useCategories';
import { Button } from '../../../components/ui/Button';
import { VariantList } from '../../../components/dashboard/components/variants/VariantList';
import { VariantForm } from '../../../components/dashboard/components/variants/VariantForm';
import { ConfirmationModal } from '../../../components/ui/ConfirmationModal';
import { useTranslation } from 'react-i18next';

export function VariantManagement() {
  const { t } = useTranslation();
  const { variants, isLoading, addVariant, updateVariant, deleteVariant } =
    useVariants();
  const { categories } = useCategories();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    variantId: null,
  });
  const [searchTerm, setSearchTerm] = useState('');

  const filteredVariants = variants.filter(
    variant =>
      variant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      variant.values.some(value =>
        value.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const handleSave = async (data: any) => {
    try {
      if (editingVariant) {
        await updateVariant(editingVariant.id, data);
      } else {
        await addVariant(data);
      }
      setIsFormOpen(false);
      setEditingVariant(null);
    } catch (error) {
      console.error('Error saving variant:', error);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirmation.variantId) {
      await deleteVariant(deleteConfirmation.variantId);
      setDeleteConfirmation({ isOpen: false, variantId: null });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{t('variant:variant-title')}</h1>
          <p className="text-gray-500 dark:text-gray-400">
            {t('variant:variant-description')}
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          {t('variant:add-variant')}
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder={t('variant:search-placeholder')}
            className="w-full pl-10 pr-4 py-2 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
          />
        </div>
      </div>

      <VariantList
        variants={filteredVariants}
        categories={categories}
        isLoading={isLoading}
        onEdit={setEditingVariant}
        onDelete={id => setDeleteConfirmation({ isOpen: true, variantId: id })}
      />

      {(isFormOpen || editingVariant) && (
        <VariantForm
          variant={editingVariant}
          categories={categories}
          onSave={handleSave}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingVariant(null);
          }}
        />
      )}

      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={() =>
          setDeleteConfirmation({ isOpen: false, variantId: null })
        }
        onConfirm={handleDelete}
        title={t('variant:delete-variant')}
        message={t('variant:confirm-delete-variant')}
      />
    </div>
  );
}
