import { FirestoreService } from '../base/firestore.service';
import { MenuItem, MenuItemWithVariants } from '../../types';
import type { MenuFilters } from './types';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  runTransaction,
  limit,
  startAfter,
  orderBy,
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore';
import { db } from '../../lib/firebase/config';
import { MenuServiceError } from './errors';

interface PaginatedResult<T> {
  items: T[];
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}

class MenuService extends FirestoreService<MenuItem> {
  constructor() {
    super('menu_items');
  }

  // Add these methods to your MenuService class

  // Simple method to get items by category
  async getMenuItemsByCategory(
    category: string
  ): Promise<MenuItemWithVariants[]> {
    try {
      const collectionRef = collection(db, this.collectionName);
      let q;

      if (category === 'all') {
        q = query(collectionRef);
      } else {
        q = query(collectionRef, where('categoryId', '==', category));
      }

      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          variantPrices: (data.variantPrices || []).filter(
            vp =>
              Array.isArray(vp?.variantCombination) &&
              vp.variantCombination.length > 0
          ),
        } as MenuItemWithVariants;
      });
    } catch (error) {
      console.error('Error fetching menu items by category:', error);
      throw new MenuServiceError(
        'Failed to fetch menu items by category',
        'menu/fetch-category-error',
        error
      );
    }
  }

  // Method to get all menu items
  async getAll() {
    try {
      const collectionRef = collection(db, this.collectionName);
      const snapshot = await getDocs(collectionRef);

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          variantPrices: (data.variantPrices || []).filter(
            vp =>
              Array.isArray(vp?.variantCombination) &&
              vp.variantCombination.length > 0
          ),
        } as MenuItemWithVariants;
      });
    } catch (error) {
      console.error('Error fetching all menu items:', error);
      throw new MenuServiceError(
        'Failed to fetch all menu items',
        'menu/fetch-all-error',
        error
      );
    }
  }
  // Helper method to get all menu items

  async getMenuItemsPaginated(
    pageSize: number = 10,
    lastDoc: QueryDocumentSnapshot<DocumentData> | null = null,
    filters?: MenuFilters
  ): Promise<PaginatedResult<MenuItemWithVariants>> {
    try {
      // Create the base collection reference
      const collectionRef = collection(db, this.collectionName);

      // Build constraints array
      const constraints = [];

      // Only add category filter if it's provided and not 'all'
      if (filters?.category && filters.category !== 'all') {
        constraints.push(where('categoryId', '==', filters.category));
      }

      // Add ordering constraint
      constraints.push(orderBy('createdAt', 'desc'));

      // Add pagination limit - fetch one extra to determine if there are more
      constraints.push(limit(pageSize + 1));

      // Construct the initial query with constraints
      let baseQuery = query(collectionRef, ...constraints);

      // If we have a last document reference, add the startAfter constraint
      if (lastDoc) {
        baseQuery = query(baseQuery, startAfter(lastDoc));
      }

      // Execute the query
      const snapshot = await getDocs(baseQuery);

      // Process query results
      const items: MenuItemWithVariants[] = [];
      let newLastDoc: QueryDocumentSnapshot<DocumentData> | null = null;

      // Determine if there are more results
      const hasMore = snapshot.docs.length > pageSize;

      // Process only up to pageSize documents
      const docsToProcess = hasMore
        ? snapshot.docs.slice(0, pageSize)
        : snapshot.docs;

      // Process each document
      for (const doc of docsToProcess) {
        // Check that the document exists
        if (doc.exists()) {
          const itemData = doc.data() as Omit<MenuItemWithVariants, 'id'>;

          // Create the menu item with proper processing
          const item = {
            id: doc.id,
            ...itemData,
            // Ensure variantPrices is properly filtered
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

      return {
        items,
        lastDoc: newLastDoc,
        hasMore,
      };
    } catch (error) {
      // Enhanced error logging
      console.error('Error fetching paginated menu items:', error);

      // Add more detailed error info when available
      if (error instanceof Error) {
        console.error(`Error details: ${error.name} - ${error.message}`);
        console.error('Stack:', error.stack);
      }

      throw new MenuServiceError(
        'Failed to fetch menu items',
        'menu/fetch-paginated-error',
        error
      );
    }
  }

  // Search menu items across the entire collection
  async searchMenuItems(
    searchTerm: string,
    pageSize: number = 10,
    lastDoc: QueryDocumentSnapshot<DocumentData> | null = null,
    categoryId?: string
  ): Promise<PaginatedResult<MenuItemWithVariants>> {
    try {
      // For searching, we need to get all items from Firebase since they don't support text search
      console.log(
        'Searching for menu items with term:',
        searchTerm,
        'category:',
        categoryId
      );

      // Create the base collection reference
      const collectionRef = collection(db, this.collectionName);
      let constraints = [];
      let useClientSideFiltering = false;

      // If we have a category, we'll need an index for the combined query
      // As a fallback, we'll get all items and filter on the client side
      if (categoryId && categoryId !== 'all') {
        try {
          // First try with where + orderBy (requires composite index)
          constraints.push(where('categoryId', '==', categoryId));
          constraints.push(orderBy('createdAt', 'desc'));

          // Build the query
          const menuQuery = query(collectionRef, ...constraints);

          // Test if the query works (if no index, this will throw)
          await getDocs(menuQuery);

          // If we get here, the index exists and we can use the query
          console.log(
            'Using database filtering with index for category + ordering'
          );
          useClientSideFiltering = false;
        } catch (indexError) {
          console.log(
            'Composite index not found, falling back to client-side filtering'
          );
          // Reset constraints and use client-side filtering
          constraints = [orderBy('createdAt', 'desc')];
          useClientSideFiltering = true;
        }
      } else {
        // No category filter, just order by createdAt
        constraints.push(orderBy('createdAt', 'desc'));
      }

      // Build the query
      const menuQuery = query(collectionRef, ...constraints);

      // Execute the query to get all items for searching
      const snapshot = await getDocs(menuQuery);
      console.log(`Retrieved ${snapshot.docs.length} items from Firebase`);

      let allItems: MenuItemWithVariants[] = [];

      // Process each document
      snapshot.docs.forEach(doc => {
        if (doc.exists()) {
          const data = doc.data();
          const item: MenuItemWithVariants = {
            id: doc.id,
            ...(data as Omit<MenuItemWithVariants, 'id'>),
            variantPrices: (data.variantPrices || []).filter(
              (vp: any) =>
                Array.isArray(vp?.variantCombination) &&
                vp.variantCombination.length > 0
            ),
          };
          allItems.push(item);
        }
      });

      // Apply client-side category filtering if needed
      if (useClientSideFiltering && categoryId && categoryId !== 'all') {
        allItems = allItems.filter(item => item.categoryId === categoryId);
        console.log(
          `After category filtering (${categoryId}): ${allItems.length} items remain`
        );
      }

      // Filter by search term
      let filteredItems = allItems;
      if (searchTerm && searchTerm.trim() !== '') {
        const normalizedTerm = searchTerm.toLowerCase().trim();
        filteredItems = allItems.filter(
          item =>
            item.name.toLowerCase().includes(normalizedTerm) ||
            (item.description &&
              item.description.toLowerCase().includes(normalizedTerm))
        );
        console.log(
          `Found ${filteredItems.length} items matching search term '${searchTerm}'`
        );
      }

      // Handle pagination
      let startIndex = 0;

      // If lastDoc is provided, find its index in the filtered items
      if (lastDoc) {
        const lastItemIndex = filteredItems.findIndex(
          item => item.id === lastDoc.id
        );
        if (lastItemIndex !== -1) {
          startIndex = lastItemIndex + 1;
        }
      }

      // Get the items for this page
      const paginatedItems = filteredItems.slice(
        startIndex,
        startIndex + pageSize
      );
      const hasMore = startIndex + pageSize < filteredItems.length;

      // Find the last document reference for the next page
      let newLastDoc = null;
      if (paginatedItems.length > 0) {
        const lastItemId = paginatedItems[paginatedItems.length - 1].id;
        newLastDoc = snapshot.docs.find(doc => doc.id === lastItemId) || null;
      }

      return {
        items: paginatedItems,
        lastDoc: newLastDoc,
        hasMore,
      };
    } catch (error) {
      // Enhanced error logging
      console.error('Error searching menu items:', error);

      // Add more detailed error info when available
      if (error instanceof Error) {
        console.error(`Error details: ${error.name} - ${error.message}`);
        console.error('Stack:', error.stack);
      }

      throw new MenuServiceError(
        'Failed to search menu items',
        'menu/search-error',
        error
      );
    }
  }

  async getMenuItems(filters?: MenuFilters): Promise<MenuItemWithVariants[]> {
    try {
      // Create collection reference
      const collectionRef = collection(db, this.collectionName);
      let baseQuery = query(collectionRef);

      // Add category filter if specified
      if (filters?.category && filters?.category !== 'all') {
        baseQuery = query(
          baseQuery,
          where('categoryId', '==', filters.category)
        );
      }

      const snapshot = await getDocs(baseQuery);

      // Map documents to menu items
      const data = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<MenuItemWithVariants, 'id'>),
        }))
        .map(item => {
          return {
            ...item,
            // Filter variant prices
            variantPrices: (item?.variantPrices || []).filter(
              vp =>
                Array.isArray(vp?.variantCombination) &&
                vp.variantCombination.length > 0
            ),
          };
        });

      return data;
    } catch (error) {
      console.error('Error fetching menu items:', error);
      throw new MenuServiceError(
        'Failed to fetch menu items',
        'menu/fetch-error',
        error
      );
    }
  }

  async update(id: string, data: Partial<MenuItemWithVariants>): Promise<void> {
    try {
      await runTransaction(db, async transaction => {
        // Get current item state
        const docRef = doc(db, this.collectionName, id);
        const docSnap = await transaction.get(docRef);

        if (!docSnap.exists()) {
          throw new MenuServiceError('Menu item not found', 'menu/not-found');
        }

        const currentItem = docSnap.data() as MenuItemWithVariants;

        // Validate variant combinations if updating them
        if (data.variantPrices) {
          // Check for duplicate combinations
          const combinations = data.variantPrices.map(vp =>
            [...vp.variantCombination].sort().join('|')
          );
          const uniqueCombinations = new Set(combinations);

          if (combinations.length !== uniqueCombinations.size) {
            throw new MenuServiceError(
              'Duplicate variant combinations found',
              'menu/duplicate-variants'
            );
          }

          // Format variant prices
          data.variantPrices = data?.variantPrices.map(vp => ({
            variantCombination: [...vp.variantCombination]
              .filter(item => {
                return !!item && !item.includes('null');
              })
              .sort(),
            price: Number(vp.price),
            image: vp?.image,
          }));
        }

        // Update the document
        const updateData = {
          ...data,
          updatedAt: new Date().toISOString(),
        };

        transaction.update(docRef, updateData);
      });
    } catch (error) {
      if (error instanceof MenuServiceError) {
        throw error;
      }

      throw new MenuServiceError(
        'Failed to update menu item',
        'menu/update-error',
        error
      );
    }
  }

  async create(data: Omit<MenuItemWithVariants, 'id'>): Promise<string> {
    try {
      // Check if a menu item with the same name already exists
      const collectionRef = collection(db, this.collectionName);
      const nameQuery = query(
        collectionRef,
        where('name', '==', data.name.trim())
      );
      const nameSnapshot = await getDocs(nameQuery);

      if (!nameSnapshot.empty) {
        throw new MenuServiceError(
          'A menu item with this name already exists',
          'menu/duplicate-name'
        );
      }

      // Validate variant combinations if present
      if (data.variantPrices) {
        const combinations = data.variantPrices.map(vp =>
          [...vp.variantCombination].sort().join('|')
        );
        const uniqueCombinations = new Set(combinations);

        if (combinations.length !== uniqueCombinations.size) {
          throw new MenuServiceError(
            'Duplicate variant combinations found',
            'menu/duplicate-variants'
          );
        }

        // Format variant prices
        data.variantPrices = data.variantPrices.map(vp => ({
          variantCombination: [...vp.variantCombination].sort().filter(item => {
            return !!item && !item.includes('null');
          }),
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

      const docRef = await super.create(createData);
      return docRef;
    } catch (error) {
      if (error instanceof MenuServiceError) {
        throw error;
      }
      throw new MenuServiceError(
        'Failed to create menu item',
        'menu/create-error',
        error
      );
    }
  }
}

export const menuService = new MenuService();
