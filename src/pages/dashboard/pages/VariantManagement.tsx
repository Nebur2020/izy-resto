import { useState, useEffect } from 'react';
import { Plus, Search, RefreshCw, X } from 'lucide-react';
import { useVariants } from '../../../hooks/useVariants';
import { useCategories } from '../../../hooks/useCategories';
import { Button } from '../../../components/ui/Button';
import { VariantList } from '../../../components/dashboard/components/variants/VariantList';
import { VariantForm } from '../../../components/dashboard/components/variants/VariantForm';
import { ConfirmationModal } from '../../../components/ui/ConfirmationModal';
import { useTranslation } from 'react-i18next';
import { variantService } from '../../../services/variants/variant.service';
import { useSettings } from '../../../hooks';
import { Variant } from '../../../types';

export function VariantManagement() {
  const { t } = useTranslation();
  const {
    variants,
    isLoading,
    hasMore,
    loadMoreVariants,
    addVariant,
    updateVariant,
    deleteVariant,
  } = useVariants();

  const {
    categories,
    loadMoreCategories,
    hasMore: hasMoreCategories,
  } = useCategories();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    variantId: null,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Variant[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const settings = useSettings();
  const primaryColor = settings?.settings?.palette.primary;

  // Handle search
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchTerm.trim() !== '') {
        performSearch(searchTerm);
      } else {
        setIsSearching(false);
        setSearchResults([]);
      }
    }, 500); // Debounce search for 500ms

    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

  const performSearch = async term => {
    if (term.trim().length < 2) return;

    setSearchLoading(true);
    setIsSearching(true);

    try {
      // This assumes you've added a search method to your service
      // If not, you'll need to implement it
      const results = await variantService.searchVariants(term);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching variants:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setIsSearching(false);
    setSearchResults([]);
  };

  const handleSave = async (data: any) => {
    try {
      if (editingVariant) {
        await updateVariant((editingVariant as any).id, data);
      } else {
        await addVariant(data);
      }
      setIsFormOpen(false);
      setEditingVariant(null);

      // If user was searching, refresh search results
      if (isSearching && searchTerm.trim() !== '') {
        performSearch(searchTerm);
      }
    } catch (error) {
      console.error('Error saving variant:', error);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirmation.variantId) {
      await deleteVariant(deleteConfirmation.variantId);
      setDeleteConfirmation({ isOpen: false, variantId: null });

      if (isSearching && searchTerm.trim() !== '') {
        performSearch(searchTerm);
      }
    }
  };

  const handleLoadMore = () => {
    if (!isSearching && hasMore && !isLoading) {
      loadMoreVariants();
    }
  };

  const displayedVariants = isSearching ? searchResults : variants;
  const showLoadMore = !isSearching && hasMore && !isLoading;
  const currentLoading = isSearching ? searchLoading : isLoading;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{t('variant:variant-title')}</h1>
          <p className="text-gray-500 dark:text-gray-400">
            {t('variant:variant-description')}
          </p>
        </div>
        <Button
          onClick={() => setIsFormOpen(true)}
          variant="custom"
          style={{ backgroundColor: primaryColor }}
          spanClassName="text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('variant:add-variant')} sjhdzb
        </Button>
      </div>

      <div className="relative">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder={t('variant:search-placeholder')}
            className="w-full pl-10 pr-10 py-2 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        {isSearching && (
          <div className="mt-2 text-sm text-blue-600 dark:text-blue-400">
            {searchLoading ? (
              <span className="flex items-center">
                <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
                {t('variant:searching')}
              </span>
            ) : (
              <span>
                {t('common:search-results', { count: searchResults.length })}
              </span>
            )}
          </div>
        )}
      </div>

      <VariantList
        variants={displayedVariants}
        categories={categories}
        isLoading={currentLoading && displayedVariants.length === 0}
        onEdit={setEditingVariant}
        onDelete={id => setDeleteConfirmation({ isOpen: true, variantId: id })}
        primaryColor={primaryColor}
      />

      {isSearching && !searchLoading && searchResults.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-500 dark:text-gray-400">
            {t('common:no-search-results')}
          </p>
          <Button variant="outline" onClick={clearSearch} className="mt-4">
            {t('variant:clear-search')}
          </Button>
        </div>
      )}

      {/* Load More Button */}
      {showLoadMore && (
        <div className="flex justify-center mt-6">
          <Button onClick={handleLoadMore} className="px-4 py-2">
            <RefreshCw className="w-4 h-4 mr-2" />
            {t('common:load-more')}
          </Button>
        </div>
      )}

      {/* Loading Indicator for Load More */}
      {!isSearching && isLoading && variants.length > 0 && (
        <div className="flex justify-center mt-6">
          <div className="animate-spin">
            <RefreshCw className="w-6 h-6 text-blue-500" />
          </div>
        </div>
      )}

      {(isFormOpen || editingVariant) && (
        <VariantForm
          variant={editingVariant}
          categories={categories}
          loadMoreCategories={loadMoreCategories}
          hasMoreCategories={hasMoreCategories}
          onSave={handleSave}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingVariant(null);
          }}
          primaryColor={primaryColor}
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
