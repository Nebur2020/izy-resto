import { useState, useEffect } from 'react';
import { Calendar, Plus, Search } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { InventoryList } from '../../../components/dashboard/components/inventory/InventoryList';
import { InventoryForm } from '../../../components/dashboard/components/inventory/InventoryForm';
import { InventoryAlerts } from '../../../components/dashboard/components/inventory/InventoryAlerts';
import { StockHistory } from '../../../components/dashboard/components/inventory/StockHistory';
import { StockUpdateForm } from '../../../components/dashboard/components/inventory/StockUpdateForm';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { Tabs } from '../../../components/ui/Tabs';
import { useInventory } from '../../../hooks/useInventory';
import { stockHistoryService } from '../../../services/inventory/stockHistory.service';
import {
  InventoryItem,
  StockUpdate,
  StockHistory as StockHistoryType,
} from '../../../types';
import { DateFilter } from '../../../components/dashboard/components/accounting/DateFilter';
import { useTranslation } from 'react-i18next';

const tabs = [
  { id: 'inventory', label: 'Inventaire' },
  { id: 'history', label: 'Historique' },
];

export function InventoryManagement() {
  const { t } = useTranslation('common');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isUpdateFormOpen, setIsUpdateFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    itemId?: string;
    itemName?: string;
  }>({ isOpen: false });
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState('inventory');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [stockHistory, setStockHistory] = useState<{
    updates: StockHistoryType[];
    totalPages: number;
  }>({
    updates: [],
    totalPages: 0,
  });
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setHours(0, 0, 0, 0)),
    endDate: new Date(),
  });

  const { items, isLoading, addItem, updateItem, deleteItem } = useInventory();

  // Load stock history when tab changes or page changes
  useEffect(() => {
    if (activeTab === 'history') {
      loadStockHistory();
    }
  }, [activeTab, currentPage, dateRange]);

  const loadStockHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const { updates, totalCount } = await stockHistoryService.getHistory({
        page: currentPage,
        pageSize: 10,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });

      setStockHistory({
        updates,
        totalPages: Math.ceil(totalCount / 10),
      });
    } catch (error) {
      console.error('Error loading stock history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleSave = async (item: Omit<InventoryItem, 'id'>) => {
    try {
      if (editingItem) {
        await updateItem(editingItem.id, item);
      } else {
        await addItem(item);
      }
      setIsFormOpen(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving inventory item:', error);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmation.itemId) return;

    try {
      setIsDeleting(true);
      await deleteItem(deleteConfirmation.itemId);
    } catch (error) {
      console.error('Error deleting inventory item:', error);
    } finally {
      setIsDeleting(false);
      setDeleteConfirmation({ isOpen: false });
    }
  };

  const handleStockUpdate = async (updates: StockUpdate[]) => {
    try {
      // Process each update
      for (const update of updates) {
        const item = items.find(i => i.id === update.itemId);
        if (!item) continue;

        // Update item stock
        await updateItem(update.itemId, {
          quantity: item.quantity - update.quantity,
        });

        // Record in history
        await stockHistoryService.addUpdate({
          itemId: update.itemId,
          itemName: item.name,
          quantity: update.quantity,
          reason: update.reason,
          cost: update.quantity * item.price,
          date: new Date().toISOString(),
          type: '',
        });
      }

      setIsUpdateFormOpen(false);

      // Refresh history if we're on that tab
      if (activeTab === 'history') {
        loadStockHistory();
      }
    } catch (error) {
      console.error('Error updating stock:', error);
    }
  };

  const handleDateChange = (start: Date, end: Date) => {
    setDateRange({ startDate: start, endDate: end });
    setCurrentPage(1); // Reset to first page when date range changes
  };

  const filteredItems = items.filter(item => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestion des Stocks
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Gérez votre inventaire et suivez vos stocks
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setIsUpdateFormOpen(true)}>
            Mise à jour des stocks
          </Button>
          <Button
            onClick={() => {
              setEditingItem(null);
              setIsFormOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un Produit
          </Button>
        </div>
      </div>

      {/* Alerts Section */}
      <InventoryAlerts items={items} />

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Date Range Filter - Always visible */}
      {activeTab !== 'inventory' && (
        <div className="flex items-center gap-4">
          <Calendar className="w-5 h-5 text-gray-500" />
          <DateFilter
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            onDateChange={handleDateChange}
          />
        </div>
      )}

      {activeTab === 'inventory' ? (
        <>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
              <input
                type="text"
                placeholder={t('search-product')}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-12 py-3 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:focus:border-blue-400 dark:focus:ring-blue-400"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-700 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:focus:border-blue-400 dark:focus:ring-blue-400"
              >
                <option value="all">Toutes les catégories</option>
                <option value="ingredients">Ingrédients</option>
                <option value="boissons">Boissons</option>
                <option value="fournitures">Fournitures</option>
                <option value="emballages">Emballages</option>
                <option value="nettoyage">Produits d'entretien</option>
              </select>
            </div>
          </div>

          {/* Inventory List */}
          <InventoryList
            items={filteredItems}
            isLoading={isLoading}
            onEdit={item => {
              setEditingItem(item);
              setIsFormOpen(true);
            }}
            onDelete={id => {
              const item = items.find(i => i.id === id);
              setDeleteConfirmation({
                isOpen: true,
                itemId: id,
                itemName: item?.name,
              });
            }}
          />
        </>
      ) : (
        <StockHistory
          updates={stockHistory.updates}
          isLoading={isLoadingHistory}
          currentPage={currentPage}
          totalPages={stockHistory.totalPages}
          onPageChange={setCurrentPage}
          dateRange={dateRange}
        />
      )}

      {/* Modals */}
      {isFormOpen && (
        <InventoryForm
          item={editingItem}
          onSave={handleSave}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingItem(null);
          }}
        />
      )}

      {isUpdateFormOpen && (
        <StockUpdateForm
          items={items}
          onSubmit={handleStockUpdate}
          onCancel={() => setIsUpdateFormOpen(false)}
          isSubmitting={false}
        />
      )}

      <ConfirmDialog
        isOpen={deleteConfirmation.isOpen}
        title="Supprimer le produit"
        message={`Êtes-vous sûr de vouloir supprimer "${deleteConfirmation.itemName}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmation({ isOpen: false })}
        isLoading={isDeleting}
      />
    </div>
  );
}
