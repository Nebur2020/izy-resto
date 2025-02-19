import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  ArrowUpDown,
  Loader2,
  LayoutGrid,
  RefreshCw,
  X,
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
    refreshCategories,
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

  // Handle search with debounce
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
            <LayoutGrid className="w-6 h-6 text-blue-500" />
            {t('category:category-title')}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t('category:category-description')}
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} type="button">
          <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
          <span className="relative">{t('category:new-category')}</span>
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
              className="w-full pl-10 pr-10 py-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500/20 transition-shadow"
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
            variant="secondary"
            onClick={() =>
              setSortOrder(current => (current === 'asc' ? 'desc' : 'asc'))
            }
            className="min-w-[140px]"
          >
            <ArrowUpDown className="w-4 h-4 mr-2" />
            {sortOrder === 'asc'
              ? t('common:ascending')
              : t('common:descending')}
          </Button>
        </div>
        {isSearching && (
          <div className="mt-2 text-sm text-blue-600 dark:text-blue-400">
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
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
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
                          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-medium">
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
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="ghost"
                          onClick={() => handleEdit(category)}
                          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                        >
                          {t('common:edit')}
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => handleDelete(category)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          {t('common:delete')}
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

      {/* Load More Button */}
      {showLoadMore && (
        <div className="flex justify-center mt-6">
          <Button onClick={loadMoreCategories} className="px-4 py-2">
            <RefreshCw className="w-4 h-4 mr-2" />
            {t('common:load-more')}
          </Button>
        </div>
      )}

      {/* Loading Indicator for Load More */}
      {!isSearching && isLoading && categories.length > 0 && (
        <div className="flex justify-center mt-6">
          <div className="animate-spin">
            <RefreshCw className="w-6 h-6 text-blue-500" />
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
