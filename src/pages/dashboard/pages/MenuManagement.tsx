import { useState, useEffect } from 'react';
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

  const [lastDoc, setLastDoc] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [pageSize] = useState(10);

  useEffect(() => {
    if (!isSearching) {
      loadInitialItems();
    }
  }, [selectedCategory, isSearching]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        performSearch();
      } else if (isSearching) {
        setIsSearching(false);
        loadInitialItems();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory]);

  const loadInitialItems = async () => {
    try {
      setIsLoading(true);

      if (selectedCategory !== 'all') {
        try {
          const categoryItems = await menuService.getMenuItemsByCategory(
            selectedCategory
          );

          setItems(categoryItems.slice(0, pageSize));
          setHasMore(categoryItems.length > pageSize);
          setLastDoc(null);
        } catch (error) {
          console.error('Error loading category items:', error);
          toast.error(t('common:error-loading-items'));
        }
      } else {
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
      let baseItems;
      if (selectedCategory === 'all') {
        baseItems = await menuService.getAll();
      } else {
        baseItems = await menuService.getMenuItemsByCategory(selectedCategory);
      }

      const results = baseItems.filter(
        item =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase() || '')
      );

      setItems(results);
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

    setLastDoc(null);
    setHasMore(false);

    if (isSearching) {
      setSearchTerm('');
      setIsSearching(false);
    }

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

      {!isLoading && items.length > 0 ? (
        <MenuItemList
          items={items}
          onEdit={handleEdit}
          onDelete={handleDelete}
          currency={settings?.currency}
        />
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            <EmptySection title={t('common:no-items-found')} />
          </div>
        </div>
      )}

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
