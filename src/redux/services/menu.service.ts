import {
  createApi,
  fakeBaseQuery,
  FetchBaseQueryError,
  FetchBaseQueryMeta,
  QueryReturnValue,
} from '@reduxjs/toolkit/query/react';
import {
  MenuFilters,
  MenuItemWithVariants,
  PaginatedResult,
} from '../../types';
import { db } from '../../lib/firebase/config';
import {
  addDoc,
  collection,
  doc,
  DocumentData,
  getDocs,
  limit,
  orderBy,
  query,
  QueryDocumentSnapshot,
  runTransaction,
  startAfter,
  where,
} from 'firebase/firestore';

export const menuItemApi = createApi({
  reducerPath: 'menuItemApi',
  baseQuery: fakeBaseQuery(),
  endpoints: builder => ({
    getAllMenuItems: builder.query<MenuItemWithVariants[], void>({
      async queryFn() {
        try {
          const collectionRef = collection(db, 'menu_items');
          const snapshot = await getDocs(collectionRef);

          const menuItems = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              variantPrices: (data.variantPrices || []).filter(
                (vp: any) =>
                  Array.isArray(vp?.variantCombination) &&
                  vp.variantCombination.length > 0
              ),
            } as MenuItemWithVariants;
          });

          return { data: menuItems };
        } catch (error: any) {
          console.error('Error fetching all menu items:', error);
          return {
            error: {
              status: 'FETCH_ERROR',
              message: 'Failed to fetch all menu items',
              error: error.message,
            },
          };
        }
      },
    }),

    getFilteredMenuItems: builder.query<MenuItemWithVariants[], MenuFilters>({
      async queryFn(filters) {
        try {
          const collectionRef = collection(db, 'menu_items');
          let baseQuery = query(collectionRef);

          if (filters?.category && filters.category !== 'all') {
            baseQuery = query(
              baseQuery,
              where('categoryId', '==', filters.category)
            );
          }

          const snapshot = await getDocs(baseQuery);

          const data = snapshot.docs
            .map(doc => ({
              id: doc.id,
              ...(doc.data() as Omit<MenuItemWithVariants, 'id'>),
            }))
            .map(item => ({
              ...item,
              variantPrices: (item?.variantPrices || []).filter(
                vp =>
                  Array.isArray(vp?.variantCombination) &&
                  vp.variantCombination.length > 0
              ),
            }));

          return { data };
        } catch (error: any) {
          console.error('Error fetching filtered menu items:', error);
          return {
            error: {
              status: 'FETCH_ERROR',
              message: 'Failed to fetch filtered menu items',
              error: error.message,
            },
          };
        }
      },
    }),

    getMenuItemsByCategory: builder.query<MenuItemWithVariants[], string>({
      async queryFn(category) {
        try {
          const collectionRef = collection(db, 'menu_items');

          let q;
          if (category === 'all') {
            q = query(collectionRef);
          } else {
            q = query(collectionRef, where('categoryId', '==', category));
          }

          const snapshot = await getDocs(q);

          const data = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              variantPrices: (data.variantPrices || []).filter(
                (vp: any) =>
                  Array.isArray(vp?.variantCombination) &&
                  vp.variantCombination.length > 0
              ),
            } as MenuItemWithVariants;
          });

          return { data };
        } catch (error: any) {
          console.error('Error fetching menu items by category:', error);
          return {
            error: {
              status: 'FETCH_ERROR',
              message: 'Failed to fetch menu items by category',
              error: error.message,
            },
          };
        }
      },
    }),

    getMenuItemsPaginated: builder.query<
      PaginatedResult<MenuItemWithVariants>,
      {
        pageSize: number;
        lastDoc: QueryDocumentSnapshot<DocumentData> | null;
        filters?: MenuFilters;
      }
    >({
      async queryFn({ pageSize, lastDoc, filters }) {
        try {
          const collectionRef = collection(db, 'menu_items');

          const constraints = [];

          if (filters?.category && filters.category !== 'all') {
            constraints.push(where('categoryId', '==', filters.category));
          }

          constraints.push(orderBy('createdAt', 'desc'));

          constraints.push(limit(pageSize + 1));

          let baseQuery = query(collectionRef, ...constraints);

          if (lastDoc) {
            baseQuery = query(baseQuery, startAfter(lastDoc));
          }

          const snapshot = await getDocs(baseQuery);

          const items: MenuItemWithVariants[] = [];
          let newLastDoc: QueryDocumentSnapshot<DocumentData> | null = null;

          const hasMore = snapshot.docs.length > pageSize;

          const docsToProcess = hasMore
            ? snapshot.docs.slice(0, pageSize)
            : snapshot.docs;

          for (const doc of docsToProcess) {
            if (doc.exists()) {
              const itemData = doc.data() as Omit<MenuItemWithVariants, 'id'>;

              const item = {
                id: doc.id,
                ...itemData,
                variantPrices: (itemData.variantPrices || []).filter(
                  vp =>
                    Array.isArray(vp?.variantCombination) &&
                    vp.variantCombination.length > 0
                ),
              };

              items.push(item);
              newLastDoc = doc;
            }
          }

          return { data: { items, lastDoc: newLastDoc, hasMore } };
        } catch (error: any) {
          console.error('Error fetching paginated menu items:', error);
          return {
            error: {
              status: 'FETCH_ERROR',
              message: 'Failed to fetch paginated menu items',
              error: error.message,
            },
          };
        }
      },
    }),

    updateMenuItem: builder.mutation<
      void,
      { id: string; data: Partial<MenuItemWithVariants> }
    >({
      async queryFn(
        { id, data },
        _api,
        _extraOptions,
        _baseQuery
      ): Promise<
        QueryReturnValue<
          void,
          FetchBaseQueryError,
          FetchBaseQueryMeta | undefined
        >
      > {
        try {
          await runTransaction(db, async transaction => {
            const docRef = doc(db, 'menu_items', id);
            const docSnap = await transaction.get(docRef);

            if (!docSnap.exists()) {
              throw new Error('Menu item not found');
            }

            if (data.variantPrices) {
              const combinations = data.variantPrices.map(vp =>
                [...vp.variantCombination].sort().join('|')
              );
              const uniqueCombinations = new Set(combinations);

              if (combinations.length !== uniqueCombinations.size) {
                throw new Error('Duplicate variant combinations found');
              }

              data.variantPrices = data.variantPrices.map(vp => ({
                variantCombination: [...vp.variantCombination]
                  .filter(item => !!item && !item.includes('null'))
                  .sort(),
                price: Number(vp.price),
                image: vp?.image,
              }));
            }

            const updateData = {
              ...data,
              updatedAt: new Date().toISOString(),
            };

            transaction.update(docRef, updateData);
          });

          return { data: undefined };
        } catch (error: any) {
          console.error('Error updating menu item:', error);
          return {
            error: {
              status: 'FETCH_ERROR',
              error: error.message,
            },
          };
        }
      },
    }),

    createMenuItem: builder.mutation<string, Omit<MenuItemWithVariants, 'id'>>({
      async queryFn(data, _api, _extraOptions, _baseQuery) {
        try {
          if (data.variantPrices) {
            const combinations = data.variantPrices.map(vp =>
              [...vp.variantCombination].sort().join('|')
            );
            const uniqueCombinations = new Set(combinations);

            if (combinations.length !== uniqueCombinations.size) {
              throw new Error('Duplicate variant combinations found');
            }

            data.variantPrices = data.variantPrices.map(vp => ({
              variantCombination: [...vp.variantCombination]
                .filter(item => !!item && !item.includes('null'))
                .sort(),
              price: Number(vp.price),
              image: vp?.image,
            }));
          }

          const createData = {
            ...data,
            price: Number(data.price),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          const docRef = await addDoc(collection(db, 'menu_items'), createData);
          return { data: docRef.id };
        } catch (error: any) {
          console.error('Error creating menu item:', error);
          return {
            error: {
              status: 'CUSTOM_ERROR',
              data: undefined,
              error: 'Failed to create menu item: ' + error.message,
            },
          };
        }
      },
    }),
  }),
});

export const {
  useGetAllMenuItemsQuery,
  useUpdateMenuItemMutation,
  useCreateMenuItemMutation,
  useGetFilteredMenuItemsQuery,
  useGetMenuItemsPaginatedQuery,
} = menuItemApi;
