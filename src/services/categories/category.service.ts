import { FirestoreService } from '../base/firestore.service';
import { Category } from '../../types';
import { FirebaseError } from '../../lib/firebase/utils/errorHandling';
import {
  orderBy,
  query,
  collection,
  getDocs,
  limit,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore';
import { db } from '../../lib/firebase/config';

interface PaginatedResult<T> {
  items: T[];
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}

class CategoryService extends FirestoreService<Category> {
  constructor() {
    super('categories');
  }

  async getCategories(): Promise<Category[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        orderBy('order', 'asc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(
        doc =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Category)
      );
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw new FirebaseError(
        'Failed to fetch categories',
        'read/fetch-all',
        'categories'
      );
    }
  }

  async getCategoriesPaginated(
    pageSize: number = 20,
    lastDoc: QueryDocumentSnapshot<DocumentData> | null = null
  ): Promise<PaginatedResult<Category>> {
    try {
      let q = query(
        collection(db, this.collectionName),
        orderBy('order', 'asc'),
        limit(pageSize + 1)
      );

      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const snapshot = await getDocs(q);
      const categories: Category[] = [];
      let newLastDoc: QueryDocumentSnapshot<DocumentData> | null = null;

      // Check if we have more items
      const hasMore = snapshot.docs.length > pageSize;

      // Only process up to pageSize items
      const docsToProcess = hasMore
        ? snapshot.docs.slice(0, pageSize)
        : snapshot.docs;

      docsToProcess.forEach(doc => {
        categories.push({
          id: doc.id,
          ...doc.data(),
        } as Category);
        newLastDoc = doc;
      });

      return {
        items: categories,
        lastDoc: newLastDoc,
        hasMore,
      };
    } catch (error) {
      console.error('Error fetching paginated categories:', error);
      throw new FirebaseError(
        'Failed to fetch categories',
        'read/fetch-paginated',
        'categories'
      );
    }
  }

  async searchCategories(searchTerm: string): Promise<Category[]> {
    try {
      // Get all categories - for small to medium collections this is reasonable
      // For larger collections, consider using Algolia or another search service
      const snapshot = await getDocs(collection(db, this.collectionName));
      const categories: Category[] = [];

      const normalizedSearchTerm = searchTerm.toLowerCase().trim();

      snapshot.forEach(doc => {
        const category = { id: doc.id, ...doc.data() } as Category;

        // Search in name
        if (category.name.toLowerCase().includes(normalizedSearchTerm)) {
          categories.push(category);
          return;
        }

        // Search in description if it exists
        if (
          category.description &&
          category.description.toLowerCase().includes(normalizedSearchTerm)
        ) {
          categories.push(category);
          return;
        }

        // Search in slug if it exists
        if (
          category.slug &&
          category.slug.toLowerCase().includes(normalizedSearchTerm)
        ) {
          categories.push(category);
        }
      });

      // Sort results by order for consistency
      return categories.sort((a, b) => a.order - b.order);
    } catch (error) {
      console.error('Error searching categories:', error);
      throw new FirebaseError(
        'Failed to search categories',
        'read/search',
        'categories'
      );
    }
  }

  async create(category: Omit<Category, 'id'>): Promise<string> {
    try {
      // Generate slug from name
      const slug = category.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      return await super.create({
        ...category,
        slug,
        order: category.order || 0,
      });
    } catch (error) {
      console.error('Error creating category:', error);
      throw new FirebaseError(
        'Failed to create category',
        'create',
        'categories'
      );
    }
  }
}

export const categoryService = new CategoryService();
