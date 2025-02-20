import React, { useState, useEffect } from 'react';
import { Plus, RefreshCw, Search as SearchIcon } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../components/ui/Button';
import { MenuItemForm } from '../../../components/menu/MenuItemForm';
import { MenuItemList } from '../../../components/menu/MenuItemList';
import { MenuItem } from '../../../types';
import { menuService } from '../../../services/menu/menu.service';
import { MenuSearchBar } from '../../../components/menu/dashboard/MenuSearchBar';
import { MenuCategoryFilter } from '../../../components/menu/dashboard/MenuCategoryFilter';
import { ConfirmationModal } from '../../../components/ui/ConfirmationModal';
import { useSettings } from '../../../hooks/useSettings';
import toast from 'react-hot-toast';
import EmptySection from '../../../components/dashboard/shared/EmptySection';
import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';

export function MenuManagement() {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    itemId?: string;
  }>({ isOpen: false });

  // Load more state
  const [lastDoc, setLastDoc] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [pageSize] = useState(10); // Items per load

  // Load initial items
  useEffect(() => {
    if (!isSearching) {
      loadInitialItems();
    }
  }, [selectedCategory, isSearching]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        performSearch();
      } else if (isSearching) {
        // Clear search and load normal items when search term is empty
        setIsSearching(false);
        loadInitialItems();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory]);

  const loadInitialItems = async () => {
    try {
      setIsLoading(true);

      // When a category is selected, use direct category filtering instead of filters
      if (selectedCategory !== 'all') {
        try {
          // First try direct category filtering (simpler and more reliable)
          const categoryItems = await menuService.getMenuItemsByCategory(
            selectedCategory
          );

          // Show first pageSize items and set hasMore if there are more
          setItems(categoryItems.slice(0, pageSize));
          setHasMore(categoryItems.length > pageSize);
          setLastDoc(null); // Reset pagination for direct filtering
        } catch (error) {
          console.error('Error loading category items:', error);
          toast.error(t('common:error-loading-items'));
        }
      } else {
        // For "all" category, use standard pagination
        try {
          const result = await menuService.getMenuItemsPaginated(
            pageSize,
            null
          );
          setItems(result.items);
          setLastDoc(result.lastDoc);
          setHasMore(result.hasMore);
        } catch (error) {
          console.error('Error loading paginated items:', error);
          // Fallback to getAll if pagination fails
          const allItems = await menuService.getAll();
          setItems(allItems.slice(0, pageSize));
          setHasMore(allItems.length > pageSize);
          setLastDoc(null);
        }
      }
    } catch (error) {
      console.error('Error loading menu items:', error);
      toast.error(t('common:error-loading-items'));
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreItems = async () => {
    if (!hasMore || isLoadingMore || isSearching) return;

    try {
      setIsLoadingMore(true);

      if (selectedCategory !== 'all') {
        // If a category is selected, load more from the cached category items
        const allCategoryItems = await menuService.getMenuItemsByCategory(
          selectedCategory
        );
        const currentLength = items.length;
        const moreItems = allCategoryItems.slice(
          currentLength,
          currentLength + pageSize
        );

        setItems(prevItems => [...prevItems, ...moreItems]);
        setHasMore(currentLength + pageSize < allCategoryItems.length);
      } else {
        // For "all" category, use standard pagination
        const result = await menuService.getMenuItemsPaginated(
          pageSize,
          lastDoc
        );
        setItems(prevItems => [...prevItems, ...result.items]);
        setLastDoc(result.lastDoc);
        setHasMore(result.hasMore);
      }
    } catch (error) {
      console.error('Error loading more menu items:', error);
      toast.error(t('common:error-loading-more-items'));
    } finally {
      setIsLoadingMore(false);
    }
  };

  const performSearch = async () => {
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    setIsSearching(true);

    try {
      // For searching, get all items by category first
      let baseItems;
      if (selectedCategory === 'all') {
        baseItems = await menuService.getAll();
      } else {
        baseItems = await menuService.getMenuItemsByCategory(selectedCategory);
      }

      // Filter based on search term
      const results = baseItems.filter(
        item =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase() || '')
      );

      setItems(results);
      // No "load more" for search results
      setHasMore(false);
      setLastDoc(null);
    } catch (error) {
      console.error('Error searching menu items:', error);
      toast.error(t('common:error-searching'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchClear = () => {
    setSearchTerm('');
    setIsSearching(false);
    loadInitialItems();
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);

    // Reset pagination state
    setLastDoc(null);
    setHasMore(false);

    // If searching, clear search when changing category
    if (isSearching) {
      setSearchTerm('');
      setIsSearching(false);
    }

    // Items will be loaded by the useEffect watching selectedCategory
  };

  const handleSave = async (item: Omit<MenuItem, 'id'>) => {
    try {
      if (editingItem) {
        await menuService.update(editingItem.id, item);

        setItems(prevItems =>
          prevItems.map(i =>
            i.id === editingItem.id ? { ...item, id: editingItem.id } : i
          )
        );
      } else {
        const id = await menuService.create(item);
        setItems(prevItems => [{ ...item, id }, ...prevItems]);
      }

      setIsFormOpen(false);
      setEditingItem(null);
      toast.success(
        editingItem ? t('common:item-updated') : t('common:item-created')
      );
    } catch (error) {
      console.error('Error saving menu item:', error);
      toast.error(t('common:error'));
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    setDeleteConfirmation({ isOpen: true, itemId: id });
  };

  const confirmDelete = async () => {
    if (!deleteConfirmation.itemId) return;

    try {
      await menuService.delete(deleteConfirmation.itemId);

      setItems(prevItems =>
        prevItems.filter(item => item.id !== deleteConfirmation.itemId)
      );

      toast.success(t('common:item-deleted'));
    } catch (error) {
      console.error('Error deleting menu item:', error);
      toast.error(t('common:error-deleting'));
    } finally {
      setDeleteConfirmation({ isOpen: false });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex-1 w-full md:w-auto relative">
          <MenuSearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            onClear={handleSearchClear}
          />
          {isSearching && (
            <div className="mt-2 text-sm text-blue-600 dark:text-blue-400 flex items-center">
              <SearchIcon className="w-3 h-3 mr-2" />
              {t('common:search-results', { count: items.length })}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4 w-full md:w-auto">
          <MenuCategoryFilter
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
          />

          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="w-5 h-5 mr-2" />
            {t('variant:add-item')}
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-100 dark:bg-gray-800 rounded-lg h-72 animate-pulse"
            />
          ))}
        </div>
      )}

      {!isLoading && items.length < 1 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            <EmptySection title={t('common:no-items-found')} />
          </div>
        </div>
      )}

      {!isLoading && items.length > 0 && (
        <MenuItemList
          items={items}
          onEdit={handleEdit}
          onDelete={handleDelete}
          currency={settings?.currency}
        />
      )}

      {/* Load More Button - only show when not searching and more items exist */}
      {!isLoading && hasMore && !isSearching && (
        <div className="flex justify-center mt-6">
          <Button
            onClick={loadMoreItems}
            disabled={isLoadingMore}
            className="px-6 py-2"
          >
            {isLoadingMore ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            {t('common:load-more')}
          </Button>
        </div>
      )}

      <AnimatePresence>
        {isFormOpen && (
          <MenuItemForm
            item={editingItem}
            onSave={handleSave}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingItem(null);
            }}
            currency={settings?.currency}
          />
        )}
      </AnimatePresence>

      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false })}
        onConfirm={confirmDelete}
        title={t('common:delete-product')}
        message={t('common:delete-product-message')}
      />
    </div>
  );
}
