import React, { useState } from 'react';
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
import toast from 'react-hot-toast';
import EmptySection from '../../../components/dashboard/shared/EmptySection';

export function MenuManagement() {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    itemId?: string;
  }>({ isOpen: false });

  React.useEffect(() => {
    loadMenuItems();
  }, []);

  const loadMenuItems = async () => {
    try {
      setIsLoading(true);
      const menuItems = await menuService.getMenuItems();
      setItems(menuItems);
    } catch (error) {
      console.log(error);
      console.error('Error loading menu items:', error);
    } finally {
      setIsLoading(false);
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
        setItems(prevItems => [...prevItems, { ...item, id }]);
      }
      setIsFormOpen(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving menu item:', error);
      toast.error(t('common.error'));
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
    } catch (error) {
      console.error('Error deleting menu item:', error);
    } finally {
      setDeleteConfirmation({ isOpen: false });
    }
  };

  const filteredItems = items.filter((item, index) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || item.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex-1 w-full md:w-auto">
          <MenuSearchBar value={searchTerm} onChange={setSearchTerm} />
        </div>

        <div className="flex items-center space-x-4 w-full md:w-auto">
          <MenuCategoryFilter
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
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

      {!isLoading && filteredItems.length < 1 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            <EmptySection title="Aucun menu trouvé" />
          </div>
        </div>
      )}

      {!isLoading && filteredItems.length > 0 && (
        <MenuItemList
          items={filteredItems}
          onEdit={handleEdit}
          onDelete={handleDelete}
          currency={settings?.currency}
        />
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
