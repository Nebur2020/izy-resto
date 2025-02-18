import React, { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
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
import { useMenu } from '../../../hooks/useMenu';
import toast from 'react-hot-toast';
import EmptySection from '../../../components/dashboard/shared/EmptySection';

const ITEMS_PER_PAGE = 10;

export function MenuManagement() {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    itemId?: string;
  }>({ isOpen: false });

  // Use the paginated menu hook - category filtering happens at query level
  const {
    items,
    isLoading,
    error,
    currentPage,
    loadPage,
    hasNextPage,
    hasPrevPage,
    nextPage,
    prevPage,
  } = useMenu(selectedCategory);

  // Only filter by search term since category is handled by the hook
  const filteredItems = useMemo(() => {
    if (!searchTerm) return items;

    return items.filter(item => {
      const searchLower = searchTerm.toLowerCase();
      return (
        item.name.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower)
      );
    });
  }, [items, searchTerm]);

  const handleSave = async (item: Omit<MenuItem, 'id'>) => {
    try {
      if (editingItem) {
        await menuService.update(editingItem.id, item);
        // Reload current page to reflect changes
        await loadPage(currentPage);
      } else {
        const id = await menuService.create(item);
        // Reload first page to show new item
        await loadPage(0);
      }
      setIsFormOpen(false);
      setEditingItem(null);
      toast.success(t('common:save-success'));
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
      // Reload current page to reflect deletion
      await loadPage(currentPage);
      toast.success(t('common:delete-success'));
    } catch (error) {
      console.error('Error deleting menu item:', error);
      toast.error(t('common:error'));
    } finally {
      setDeleteConfirmation({ isOpen: false });
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSearchTerm(''); // Reset search when changing category
  };

  // Show appropriate empty state message based on filters
  const getEmptyStateMessage = () => {
    if (searchTerm) {
      return t('menu:no-search-results');
    }
    if (selectedCategory !== 'all') {
      return t('menu:no-items-in-category');
    }
    return t('menu:no-items-found');
  };

  if (error) {
    return (
      <div className="text-center p-6">
        <p className="text-red-500">{t('common:error-loading')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex-1 w-full md:w-auto">
          <MenuSearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder={t('common:search-menu')}
          />
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

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(ITEMS_PER_PAGE)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-100 dark:bg-gray-800 rounded-lg h-72 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredItems.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <EmptySection
            title={t('menu:no-items-found')}
            description={getEmptyStateMessage()}
          />
        </div>
      )}

      {/* Menu Items List */}
      {!isLoading && filteredItems.length > 0 && (
        <>
          <MenuItemList
            items={filteredItems}
            onEdit={handleEdit}
            onDelete={handleDelete}
            currency={settings?.currency}
            hasNextPage={hasNextPage}
            hasPrevPage={hasPrevPage}
            nextPage={nextPage}
            prevPage={prevPage}
          />
        </>
      )}

      {/* Menu Item Form Modal */}
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

      {/* Delete Confirmation Modal */}
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
