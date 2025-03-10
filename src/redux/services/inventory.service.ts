import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { db } from '../../lib/firebase/config';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  runTransaction,
} from 'firebase/firestore';
import { InventoryItem } from '../../types';

export const inventoryApi = createApi({
  reducerPath: 'inventoryApi',
  baseQuery: fakeBaseQuery(),
  endpoints: builder => ({
    createInventoryItem: builder.mutation<string, Omit<InventoryItem, 'id'>>({
      async queryFn(item) {
        try {
          const id = await runTransaction(db, async transaction => {
            const docRef = doc(collection(db, 'inventory'));
            const newItem = {
              ...item,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

            transaction.set(docRef, newItem);

            //const totalCost = item.price * item.quantity;
            // await accountingService.createTransaction({
            //   date: new Date().toISOString(),
            //   source: 'inventory',
            //   description: `Stock initial: ${item.name} (${item.quantity} ${item.unit})`,
            //   reference: docRef.id,
            //   debit: totalCost,
            //   credit: 0,
            //   gross: -totalCost,
            // });

            return docRef.id;
          });

          return { data: id };
        } catch (error: any) {
          console.error('Error creating inventory item:', error);
          return {
            error: {
              status: 'CREATE_ERROR',
              message: 'Failed to create inventory item',
              error: error.message,
            },
          };
        }
      },
    }),

    updateInventoryItem: builder.mutation<
      void,
      { id: string; data: Partial<InventoryItem> }
    >({
      async queryFn({ id, data }) {
        try {
          await runTransaction(db, async transaction => {
            const docRef = doc(db, 'inventory', id);
            const docSnap = await transaction.get(docRef);
            if (!docSnap.exists()) throw new Error('Item not found');

            const currentItem = docSnap.data() as InventoryItem;

            transaction.update(docRef, {
              ...data,
              updatedAt: new Date().toISOString(),
            });

            if (
              data.quantity !== undefined &&
              data.quantity !== currentItem.quantity
            ) {
              //const quantityDiff = data.quantity - currentItem.quantity;
              //const price = data.price || currentItem.price;
              //const totalCost = Math.abs(quantityDiff * price);
              //   if (quantityDiff > 0) {
              //     await accountingService.createTransaction({
              //       date: new Date().toISOString(),
              //       source: 'inventory',
              //       description: `Ajustement stock: ${currentItem.name} (${
              //         quantityDiff > 0 ? '+' : ''
              //       }${quantityDiff} ${currentItem.unit})`,
              //       reference: id,
              //       debit: quantityDiff > 0 ? totalCost : 0,
              //       credit: quantityDiff < 0 ? totalCost : 0,
              //       gross: quantityDiff > 0 ? -totalCost : totalCost,
              //     });
              //   }
            }
          });

          return { data: undefined };
        } catch (error: any) {
          console.error('Error updating inventory item:', error);
          return {
            error: {
              status: 'UPDATE_ERROR',
              message: 'Failed to update inventory item',
              error: error.message,
            },
          };
        }
      },
    }),

    getLowStockItems: builder.query<InventoryItem[], void>({
      async queryFn() {
        try {
          const q = query(
            collection(db, 'inventory'),
            where('quantity', '<=', 'minQuantity')
          );
          const snapshot = await getDocs(q);
          const items = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as InventoryItem[];

          return { data: items };
        } catch (error: any) {
          console.error('Error fetching low stock items:', error);
          return {
            error: {
              status: 'FETCH_ERROR',
              message: 'Failed to fetch low stock items',
              error: error.message,
            },
          };
        }
      },
    }),

    getExpiringItems: builder.query<InventoryItem[], number>({
      async queryFn(daysThreshold) {
        try {
          const thresholdDate = new Date();
          thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

          const q = query(
            collection(db, 'inventory'),
            where('expiryDate', '<=', thresholdDate.toISOString())
          );
          const snapshot = await getDocs(q);
          const items = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as InventoryItem[];

          return { data: items };
        } catch (error: any) {
          console.error('Error fetching expiring items:', error);
          return {
            error: {
              status: 'FETCH_ERROR',
              message: 'Failed to fetch expiring items',
              error: error.message,
            },
          };
        }
      },
    }),
  }),
});

export const {
  useCreateInventoryItemMutation,
  useUpdateInventoryItemMutation,
  useGetLowStockItemsQuery,
  useGetExpiringItemsQuery,
} = inventoryApi;
