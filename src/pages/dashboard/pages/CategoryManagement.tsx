import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  ArrowUpDown,
  Loader2,
  LayoutGrid,
  RefreshCw,
  X,
  Edit2,
  Trash2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../../components/ui/Button';
import { useCategories } from '../../../hooks/useCategories';
import { Category } from '../../../types';
import { CategoryForm } from '../components/CategoryForm';
import { ConfirmationModal } from '../../../components/ui/ConfirmationModal';
import toast from 'react-hot-toast';
import EmptySection from '../../../components/dashboard/shared/EmptySection';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../../../hooks';
import LoadMoreButton from '../../../components/ui/LoadMoreButton';

export function CategoryManagement() {
  const {
    categories,
    isLoading,
    hasMore,
    loadMoreCategories,
    searchCategories,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useCategories();

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Category[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    categoryId?: string;
    categoryName?: string;
  }>({ isOpen: false });
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const { t } = useTranslation();

  const settings = useSettings();
  const primaryColor = settings?.settings?.palette.primary;

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

  const performSearch = async (term: string) => {
    if (term.trim().length < 2) return;

    setSearchLoading(true);
    setIsSearching(true);

    try {
      const results = await searchCategories(term);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching categories:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setIsSearching(false);
    setSearchResults([]);
  };

  const handleSave = async (data: Omit<Category, 'id'>) => {
    try {
      setIsCreating(true);
      if (editingCategory) {
        await updateCategory(editingCategory.id, data);
        toast.success(t('category:category-updated'));
      } else {
        await addCategory(data);
        toast.success(t('category:category-created'));
      }
      setIsFormOpen(false);
      setEditingCategory(null);

      // If user was searching, refresh search results
      if (isSearching && searchTerm.trim() !== '') {
        performSearch(searchTerm);
      }
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error(t('category:category-error'));
    } finally {
      setIsCreating(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleDelete = (category: Category) => {
    setDeleteConfirmation({
      isOpen: true,
      categoryId: category.id,
      categoryName: category.name,
    });
  };

  const confirmDelete = async () => {
    if (!deleteConfirmation.categoryId) return;
    try {
      await deleteCategory(deleteConfirmation.categoryId);
      toast.success(t('category:category-deleted'));

      // If user was searching, refresh search results
      if (isSearching && searchTerm.trim() !== '') {
        performSearch(searchTerm);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error(t('category:category-error'));
    } finally {
      setDeleteConfirmation({ isOpen: false });
    }
  };

  // Determine which categories to display and apply sorting
  const displayedCategories = isSearching ? searchResults : categories;

  const sortedCategories = [...displayedCategories].sort((a, b) => {
    const orderMultiplier = sortOrder === 'asc' ? 1 : -1;
    return (a.order - b.order) * orderMultiplier;
  });

  const showLoadMore = !isSearching && hasMore && !isLoading;
  const currentLoading = isSearching ? searchLoading : isLoading;
  const isEmptyState = !currentLoading && sortedCategories.length === 0;

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-3">
            <LayoutGrid
              className="w-6 h-6"
              style={{ color: primaryColor }}
            />
            {t('category:category-title')}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t('category:category-description')}
          </p>
        </div>
        <Button
          onClick={() => setIsFormOpen(true)}
          type="button"
          variant="custom"
          style={{
            backgroundColor: primaryColor,
          }}
          spanClassName="text-white"
        >
          <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
            style={{
              backgroundImage: `linear-gradient(to right, ${primaryColor}33, transparent)`
            }}
          />
          <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
          <span className="relative text-white">
            {t('category:new-category')}
          </span>
        </Button>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder={t('category:search-placeholder')}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 focus:ring-2 transition-shadow"
              style={{
                '--tw-ring-color': primaryColor + '33',
                borderColor: searchTerm ? primaryColor : ''
              } as React.CSSProperties}
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          <Button
            variant="custom"
            onClick={() =>
              setSortOrder(current => (current === 'asc' ? 'desc' : 'asc'))
            }
            className="min-w-[140px]"
            style={{
              backgroundColor: primaryColor + '15',
              color: primaryColor
            }}
            spanClassName="text-inherit"
          >
            <ArrowUpDown className="w-4 h-4 mr-2" />
            {sortOrder === 'asc'
              ? t('common:ascending')
              : t('common:descending')}
          </Button>
        </div>
        {isSearching && (
          <div className="mt-2 text-sm" style={{ color: primaryColor }}>
            {searchLoading ? (
              <span className="flex items-center">
                <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
                {t('category:searching')}
              </span>
            ) : (
              <span>
                {t('common:search-results', { count: searchResults.length })}
              </span>
            )}
          </div>
        )}
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        {currentLoading && sortedCategories.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: primaryColor }} />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {t('common:category-loading')}
              </span>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            <AnimatePresence mode="popLayout">
              {isEmptyState ? (
                <EmptySection
                  title={t('category:no-category-found-title')}
                  description={
                    isSearching
                      ? t('category:no-category-found')
                      : t('category:no-category-description')
                  }
                />
              ) : (
                sortedCategories.map(category => (
                  <motion.div
                    key={category.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <span
                            className="flex items-center justify-center w-8 h-8 rounded-lg text-sm font-medium text-white"
                            style={{
                              backgroundColor: primaryColor,
                            }}
                          >
                            {category.order}
                          </span>
                          <div>
                            <h3 className="text-base font-medium text-gray-900 dark:text-white">
                              {category.name}
                            </h3>
                            {category.description && (
                              <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                                {category.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handleEdit(category)}
                          variant="custom"
                          size="sm"
                          style={{
                            backgroundColor: primaryColor + '20',
                            color: primaryColor
                          }}
                          spanClassName="text-inherit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(category)}
                          className="p-2"
                          variant="custom"
                          style={{
                            backgroundColor: "rgba(239, 68, 68, 0.1)",
                            color: "rgb(239, 68, 68)"
                          }}
                          spanClassName="text-inherit"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {showLoadMore && (
        <div className="flex justify-center mt-6">
          <LoadMoreButton
            handleLoadMore={loadMoreCategories}
            isLoading={false}
            primaryColor={primaryColor}
          />
        </div>
      )}

      {!isSearching && isLoading && categories.length > 0 && (
        <div className="flex justify-center mt-6">
          <div className="animate-spin">
            <RefreshCw className="w-6 h-6" style={{ color: primaryColor }} />
          </div>
        </div>
      )}

      {isFormOpen && (
        <CategoryForm
          isLoading={isCreating}
          category={editingCategory}
          onSave={handleSave}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingCategory(null);
          }}
        />
      )}

      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false })}
        onConfirm={confirmDelete}
        title={t('category:delete-category')}
        message={t('category:delete-category-message', {
          categoryName: deleteConfirmation.categoryName,
        })}
      />
    </div>
  );
}