import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { Category, PaginatedResult } from '../../types';
import { db } from '../../lib/firebase/config';
import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  QueryDocumentSnapshot,
  DocumentData,
  addDoc,
} from 'firebase/firestore';

export const categoryApi = createApi({
  reducerPath: 'categoryApi',
  baseQuery: fakeBaseQuery(),
  endpoints: builder => ({
    getCategories: builder.query<Category[], void>({
      async queryFn() {
        try {
          const q = query(
            collection(db, 'categories'),
            orderBy('order', 'asc')
          );
          const snapshot = await getDocs(q);

          const categories = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as Category[];

          return { data: categories };
        } catch (error: any) {
          console.error('Error fetching categories:', error);
          return {
            error: {
              status: 'FETCH_ERROR',
              message: 'Failed to fetch categories',
              error: error.message,
            },
          };
        }
      },
    }),

    getCategoriesPaginated: builder.query<
      PaginatedResult<Category>,
      { pageSize: number; lastDoc: QueryDocumentSnapshot<DocumentData> | null }
    >({
      async queryFn({ pageSize, lastDoc }) {
        try {
          let q = query(
            collection(db, 'categories'),
            orderBy('order', 'asc'),
            limit(pageSize + 1)
          );

          if (lastDoc) {
            q = query(q, startAfter(lastDoc));
          }

          const snapshot = await getDocs(q);
          const categories: Category[] = [];
          let newLastDoc: QueryDocumentSnapshot<DocumentData> | null = null;

          const hasMore = snapshot.docs.length > pageSize;

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

          return { data: { items: categories, lastDoc: newLastDoc, hasMore } };
        } catch (error: any) {
          console.error('Error fetching paginated categories:', error);
          return {
            error: {
              status: 'FETCH_ERROR',
              message: 'Failed to fetch paginated categories',
              error: error.message,
            },
          };
        }
      },
    }),

    searchCategories: builder.query<Category[], string>({
      async queryFn(searchTerm) {
        try {
          const snapshot = await getDocs(collection(db, 'categories'));
          const categories: Category[] = [];

          const normalizedSearchTerm = searchTerm.toLowerCase().trim();

          snapshot.forEach(doc => {
            const category = { id: doc.id, ...doc.data() } as Category;

            if (category.name.toLowerCase().includes(normalizedSearchTerm)) {
              categories.push(category);
              return;
            }

            if (
              category.description &&
              category.description.toLowerCase().includes(normalizedSearchTerm)
            ) {
              categories.push(category);
              return;
            }

            if (
              category.slug &&
              category.slug.toLowerCase().includes(normalizedSearchTerm)
            ) {
              categories.push(category);
            }
          });

          const sortedCategories = categories.sort((a, b) => a.order - b.order);

          return { data: sortedCategories };
        } catch (error: any) {
          console.error('Error searching categories:', error);
          return {
            error: {
              status: 'FETCH_ERROR',
              message: 'Failed to search categories',
              error: error.message,
            },
          };
        }
      },
    }),

    createCategory: builder.mutation<string, Omit<Category, 'id'>>({
      async queryFn(category) {
        try {
          const slug = category.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

          const docRef = await addDoc(collection(db, 'categories'), {
            ...category,
            slug,
            order: category.order || 0,
          });

          return { data: docRef.id };
        } catch (error: any) {
          console.error('Error creating category:', error);
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: 'Failed to create category: ' + error.message,
            },
          };
        }
      },
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetCategoriesPaginatedQuery,
  useSearchCategoriesQuery,
  useCreateCategoryMutation,
} = categoryApi;
