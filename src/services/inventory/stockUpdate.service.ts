import { Order, CartItem } from '../../types';
import { db } from '../../lib/firebase/config';
import { runTransaction, doc, getDoc } from 'firebase/firestore';
import { StockUpdateError } from './errors';
import { stockHistoryService } from './stockHistory.service';
import toast from 'react-hot-toast';
import { variantService } from '../variants/variant.service';

interface InventoryConnection {
  itemId: string;
  ratio: number;
}

class StockUpdateService {
  private getBaseItemId(itemId: string): string {
    const parts = itemId.split('-');
    return parts[0];
  }

  private consolidateOrderItems(items: CartItem[]): { [key: string]: number } {
    return items.reduce((acc, item) => {
      const baseId = this.getBaseItemId(item.id);
      if (!baseId) {
        throw new StockUpdateError(
          'Invalid item ID format',
          'stock/invalid-id',
          { itemId: item.id }
        );
      }
      acc[baseId] = (acc[baseId] || 0) + item.quantity;
      return acc;
    }, {} as { [key: string]: number });
  }

  private parseVariantInventory(
    inventoryStr: string | undefined
  ): InventoryConnection[][] {
    if (!inventoryStr) return [];
    try {
      return JSON.parse(inventoryStr);
    } catch (error) {
      console.error('Error parsing variant inventory:', error);
      return [];
    }
  }

  private findSelectedVariantValues(
    itemId: string,
    variantValues: string[]
  ): number[] {
    return variantValues
      .map((value, index) => {
        const regex = new RegExp(`\\b${value}\\b`);
        return regex.test(itemId) ? index : -1;
      })
      .filter(index => index !== -1);
  }

  async updateStockOnDelivery(order: Order): Promise<void> {
    try {
      await runTransaction(db, async transaction => {
        // Consolidate quantities by base item ID
        const consolidatedItems = this.consolidateOrderItems(order.items);

        // Get all menu items first
        const menuItemDocs = await Promise.all(
          Object.entries(consolidatedItems).map(async ([baseId]) => {
            const docRef = doc(db, 'menu_items', baseId);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
              toast.error('Produit de menu introuvable...');
              throw new StockUpdateError(
                `Menu item not found: ${baseId}`,
                'stock/item-not-found'
              );
            }

            const variants = await variantService.getAllVariantsByCategory(
              docSnap.data().categoryId
            );

            // Process variants with their inventory connections
            const processedVariants = variants
              .filter(variant => variant.inventory) // Only variants with inventory
              .map(variant => {
                // Parse the stringified inventory
                const parsedInventory = this.parseVariantInventory(
                  variant.inventory as any
                );

                // Find selected variant values for this menu item in the order
                const selectedIndexes = order.items
                  .filter(item => item.id.startsWith(baseId))
                  .map(item =>
                    this.findSelectedVariantValues(item.id, variant.values)
                  )
                  .flat()
                  .filter(index => {
                    // Ensure the index has valid inventory connections
                    return parsedInventory[index]?.some(conn => conn.itemId);
                  });

                return {
                  ...variant,
                  parsedInventory,
                  selectedIndexes,
                };
              })
              .filter(variant => variant.selectedIndexes.length > 0);

            return {
              id: docSnap.id,
              ref: docRef,
              data: docSnap.data(),
              exists: true,
              variants: processedVariants,
            };
          })
        );

        // Track inventory updates
        const inventoryUpdates = new Map<
          string,
          {
            deduction: number;
            currentStock: number;
            ref: any;
            itemName: string;
            cost: number;
          }
        >();

        // Calculate inventory deductions
        for (const menuDoc of menuItemDocs) {
          const orderQuantity = consolidatedItems[menuDoc.id];
          const connections = menuDoc.data.inventoryConnections || [];

          // Update menu item stock
          const currentMenuStock = menuDoc.data.stockQuantity || 0;
          if (currentMenuStock < orderQuantity) {
            toast.error('Quantité insuffisante...');
            throw new StockUpdateError(
              `Insufficient menu item stock for ${menuDoc.data.name}`,
              'stock/insufficient-menu',
              {
                itemId: menuDoc.id,
                required: orderQuantity,
                available: currentMenuStock,
              }
            );
          }

          // Process variant inventory connections
          for (const variant of menuDoc.variants) {
            for (const selectedIndex of variant.selectedIndexes) {
              // Get all inventory connections for this variant value
              const connections = variant.parsedInventory[selectedIndex] || [];

              for (const connection of connections) {
                if (!connection.itemId || !connection.ratio) continue;

                const currentUpdate = inventoryUpdates.get(connection.itemId);
                const currentVariantCartItem = order.items.find(item => {
                  const v = variant.values[selectedIndex];
                  const regex = new RegExp(`\\b${v}\\b`);
                  return regex.test(item.id);
                });

                const deduction =
                  connection.ratio * (currentVariantCartItem?.quantity || 1);

                if (currentUpdate) {
                  currentUpdate.deduction += deduction;
                } else {
                  const inventoryRef = doc(db, 'inventory', connection.itemId);
                  const inventorySnap = await getDoc(inventoryRef);

                  if (!inventorySnap.exists()) {
                    toast.error(
                      "Produit Connexion d'inventaire introuvable..."
                    );
                    throw new StockUpdateError(
                      `Inventory item not found: ${connection.itemId}`,
                      'stock/inventory-not-found'
                    );
                  }

                  const inventoryData = inventorySnap.data();
                  inventoryUpdates.set(connection.itemId, {
                    deduction: deduction,
                    currentStock: inventoryData.quantity || 0,
                    ref: inventoryRef,
                    itemName: inventoryData.name,
                    cost: inventoryData.price * deduction,
                  });
                }
              }
            }
          }

          // Process base menu item inventory connections
          for (const connection of connections) {
            if (!connection.itemId || !connection.ratio) continue;

            const inventoryNeeded = orderQuantity * connection.ratio;
            const currentUpdate = inventoryUpdates.get(connection.itemId);

            if (currentUpdate) {
              currentUpdate.deduction += inventoryNeeded;
            } else {
              const inventoryRef = doc(db, 'inventory', connection.itemId);
              const inventorySnap = await getDoc(inventoryRef);

              if (!inventorySnap.exists()) {
                toast.error("Produit Connexion d'inventaire introuvable...");
                throw new StockUpdateError(
                  `Inventory item not found: ${connection.itemId}`,
                  'stock/inventory-not-found'
                );
              }

              const inventoryData = inventorySnap.data();
              inventoryUpdates.set(connection.itemId, {
                deduction: inventoryNeeded,
                currentStock: inventoryData.quantity || 0,
                ref: inventoryRef,
                itemName: inventoryData.name,
                cost: inventoryData.price * inventoryNeeded,
              });
            }
          }

          // Update menu item stock
          transaction.update(menuDoc.ref, {
            stockQuantity: currentMenuStock - orderQuantity,
            updatedAt: new Date().toISOString(),
          });
        }

        // Validate and update inventory
        for (const [itemId, update] of inventoryUpdates) {
          if (update.currentStock < update.deduction) {
            toast.error('Quantité insuffisante...');
            throw new StockUpdateError(
              'Insufficient inventory',
              'stock/insufficient-inventory',
              {
                itemId,
                required: update.deduction,
                available: update.currentStock,
              }
            );
          }

          // Update inventory
          transaction.update(update.ref, {
            quantity: update.currentStock - update.deduction,
            updatedAt: new Date().toISOString(),
          });

          // Add to stock history
          await stockHistoryService.addUpdate({
            itemId,
            itemName: update.itemName,
            quantity: update.deduction,
            reason: `Commande #${order.id.slice(0, 8)}`,
            cost: update.cost,
            type: 'order',
            orderId: order.id,
            date: new Date().toISOString(),
          });
        }
      });
    } catch (error) {
      console.error('Stock update error:', error);
      if (error instanceof StockUpdateError) {
        throw error;
      }
      toast.error('Une erreur est survenue...');
      throw new StockUpdateError(
        'Failed to update stock levels',
        'stock/update-failed',
        error
      );
    }
  }
}

export const stockUpdateService = new StockUpdateService();
