import { FirestoreService } from '../base/firestore.service';
import { MenuItem, MenuItemWithVariants } from '../../types';
import type { MenuFilters } from './types';
import {
  collection,
  query,
  where,
  getDocs,
  limit,
  startAfter,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from '../../lib/firebase/config';
import { MenuServiceError } from './errors';

interface PaginatedResponse<T> {
  items: T[];
  lastDoc: QueryDocumentSnapshot | null;
  hasMore: boolean;
}

interface PaginationParams {
  pageSize?: number;
  lastDoc?: QueryDocumentSnapshot;
}

class MenuService extends FirestoreService<MenuItem> {
  constructor() {
    super('menu_items');
  }

  async getMenuItems(
    filters?: MenuFilters,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<MenuItemWithVariants>> {
    try {
      const queryConstraints = [];
      const pageSize = pagination?.pageSize || 10;

      // Only add category filter if specified and not 'all'
      if (filters?.category && filters.category !== 'all') {
        queryConstraints.push(where('categoryId', '==', filters.category));
      }

      // Add pagination constraints
      queryConstraints.push(limit(pageSize + 1));

      if (pagination?.lastDoc) {
        queryConstraints.push(startAfter(pagination.lastDoc));
      }

      // Create and execute query
      const q = query(collection(db, this.collectionName), ...queryConstraints);
      const snapshot = await getDocs(q);

      if (!snapshot) {
        throw new MenuServiceError(
          'No data received from Firestore',
          'menu/no-data'
        );
      }

      // Process documents
      const docs = snapshot.docs;
      const hasMore = docs.length > pageSize;

      // Sort items in memory instead of using orderBy
      const items = docs
        .slice(0, pageSize)
        .map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<MenuItemWithVariants, 'id'>),
        }))
        .map(item => ({
          ...item,
          variantPrices:
            item?.variantPrices?.filter(
              vp => vp?.variantCombination?.length > 0
            ) || [],
        }))
        // Sort by createdAt in memory
        .sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA; // descending order
        });

      return {
        items,
        lastDoc: hasMore ? docs[docs.length - 2] : null,
        hasMore,
      };
    } catch (error) {
      console.error('MenuService Error:', error);
      throw new MenuServiceError(
        'Failed to fetch menu items',
        'menu/fetch-error',
        error as Error
      );
    }
  }
}

export const menuService = new MenuService();
