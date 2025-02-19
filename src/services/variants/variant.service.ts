import { FirestoreService } from '../base/firestore.service';
import { Variant } from '../../types/variant';
import {
  collection,
  query,
  where,
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

class VariantService extends FirestoreService<Variant> {
  constructor() {
    super('variants');
  }

  async getAllVariantsByCategory(categoryId: string): Promise<Variant[]> {
    try {
      const allVariants: Variant[] = [];
      let lastDoc: QueryDocumentSnapshot<DocumentData> | null = null;
      let hasMore = true;
      const pageSize = 100; // Using larger page size for efficient batch retrieval

      while (hasMore) {
        const result = await this.getVariantsByCategory(
          categoryId,
          pageSize,
          lastDoc
        );

        // Add the current batch of items to our results
        allVariants.push(...result.items);

        // Update our pagination variables
        lastDoc = result.lastDoc;
        hasMore = result.hasMore;
      }

      return allVariants;
    } catch (error) {
      console.error('Error fetching all variants:', error);
      throw error;
    }
  }

  async getVariantsByCategory(
    categoryId: string,
    pageSize: number = 10,
    lastDoc: QueryDocumentSnapshot<DocumentData> | null = null
  ): Promise<PaginatedResult<Variant>> {
    try {
      // Using only the where clause without orderBy to avoid requiring composite index
      let q = query(
        collection(db, this.collectionName),
        where('categoryIds', 'array-contains', categoryId),
        limit(pageSize + 1) // Request one more to check if there are more items
      );

      // If we have a lastDoc, start after it
      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const snapshot = await getDocs(q);
      const variants: Variant[] = [];
      let newLastDoc: QueryDocumentSnapshot<DocumentData> | null = null;

      // Check if we have more items
      const hasMore = snapshot.docs.length > pageSize;

      // Only process up to pageSize items
      const docsToProcess = hasMore
        ? snapshot.docs.slice(0, pageSize)
        : snapshot.docs;

      docsToProcess.forEach(doc => {
        variants.push({
          id: doc.id,
          ...doc.data(),
        } as Variant);
        newLastDoc = doc;
      });

      return {
        items: variants,
        lastDoc: newLastDoc,
        hasMore,
      };
    } catch (error) {
      console.error('Error fetching variants:', error);
      throw error;
    }
  }

  async getAllVariantsPaginated(
    pageSize: number = 10,
    lastDoc: QueryDocumentSnapshot<DocumentData> | null = null
  ): Promise<PaginatedResult<Variant>> {
    try {
      // Using a simple query without orderBy to avoid requiring an index
      let q = query(collection(db, this.collectionName), limit(pageSize + 1));

      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const snapshot = await getDocs(q);
      const variants: Variant[] = [];
      let newLastDoc: QueryDocumentSnapshot<DocumentData> | null = null;

      const hasMore = snapshot.docs.length > pageSize;
      const docsToProcess = hasMore
        ? snapshot.docs.slice(0, pageSize)
        : snapshot.docs;

      docsToProcess.forEach(doc => {
        variants.push({
          id: doc.id,
          ...doc.data(),
        } as Variant);
        newLastDoc = doc;
      });

      return {
        items: variants,
        lastDoc: newLastDoc,
        hasMore,
      };
    } catch (error) {
      console.error('Error fetching variants:', error);
      throw error;
    }
  }

  async create(data: Omit<Variant, 'id'>): Promise<string> {
    return await super.create({
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  async update(id: string, data: Partial<Variant>): Promise<void> {
    await super.update(id, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  }

  async searchVariants(searchTerm: string): Promise<Variant[]> {
    try {
      // Since Firestore doesn't support full-text search natively,
      // we'll fetch all documents and filter them in memory
      // Note: For large collections, you should consider using Algolia, Elasticsearch, or Firebase Cloud Functions
      const snapshot = await getDocs(collection(db, this.collectionName));
      const variants: Variant[] = [];

      const normalizedSearchTerm = searchTerm.toLowerCase().trim();

      snapshot.forEach(doc => {
        const variant = { id: doc.id, ...doc.data() } as Variant;

        // Search in name field
        if (variant.name.toLowerCase().includes(normalizedSearchTerm)) {
          variants.push(variant);
          return;
        }

        // Search in values array
        if (variant.values && Array.isArray(variant.values)) {
          const foundInValues = variant.values.some(value =>
            value.toLowerCase().includes(normalizedSearchTerm)
          );

          if (foundInValues) {
            variants.push(variant);
            return;
          }
        }

        // Optionally search in description if it exists
        if (
          variant.description &&
          variant.description.toLowerCase().includes(normalizedSearchTerm)
        ) {
          variants.push(variant);
        }
      });

      return variants;
    } catch (error) {
      console.error('Error searching variants:', error);
      throw error;
    }
  }
}

export const variantService = new VariantService();
