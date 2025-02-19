import { useState, useEffect } from 'react';
import { InventoryItem } from '../types/inventory';
import { inventoryService } from '../services/inventory/inventory.service';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export function useInventory(dateRange?: { startDate: Date; endDate: Date }) {
  const { t } = useTranslation();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setIsLoading(true);
      const fetchedItems = await inventoryService.getAll(dateRange);
      setItems(fetchedItems);
    } catch (error) {
      console.error('Error loading inventory items:', error);
      toast.error(t('inventory:failed-to-load-items'));
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = async (item: Omit<InventoryItem, 'id'>) => {
    try {
      const id = await inventoryService.create(item);
      setItems(prev => [...prev, { ...item, id }]);
      toast.success(t('inventory:item-added-successfully'));
      return id;
    } catch (error) {
      console.error('Error adding inventory item:', error);
      toast.error(t('inventory:failed-to-add-item'));
      throw error;
    }
  };

  const updateItem = async (id: string, data: Partial<InventoryItem>) => {
    try {
      await inventoryService.update(id, data);
      setItems(prev =>
        prev.map(item => (item.id === id ? { ...item, ...data } : item))
      );
      toast.success(t('inventory:item-updated-successfully'));
    } catch (error) {
      console.error('Error updating inventory item:', error);
      toast.error(t('inventory:failed-to-update-item'));
      throw error;
    }
  };

  const deleteItem = async (id: string) => {
    try {
      await inventoryService.delete(id);
      setItems(prev => prev.filter(item => item.id !== id));
      toast.success(t('inventory:item-deleted-successfully'));
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      toast.error(t('inventory:failed-to-delete-item'));
      throw error;
    }
  };

  return {
    items,
    isLoading,
    addItem,
    updateItem,
    deleteItem,
    refreshItems: loadItems,
  };
}
