import {
  createApi,
  fetchBaseQuery,
  FetchBaseQueryError,
  FetchBaseQueryMeta,
  QueryReturnValue,
} from '@reduxjs/toolkit/query/react';
import { db } from '../../lib/firebase/config';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  limit,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore';
import { Variant, PaginatedResult } from '../../types';

export const variantApi = createApi({
  reducerPath: 'variantApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  endpoints: builder => ({
    getAllVariantsByCategory: builder.query<Variant[], string>({
      async queryFn(categoryId) {
        try {
          const allVariants: Variant[] = [];
          let lastDoc: QueryDocumentSnapshot<DocumentData> | null = null;
          let hasMore = true;
          const pageSize = 100;

          while (hasMore) {
            const result = await getVariantsByCategory(
              categoryId,
              pageSize,
              lastDoc
            );

            allVariants.push(...result.items);

            lastDoc = result.lastDoc;
            hasMore = result.hasMore;
          }

          return { data: allVariants };
        } catch (error: any) {
          console.error('Error fetching all variants by category:', error);
          return {
            error: {
              status: 'FETCH_ERROR',
              message: 'Failed to fetch all variants by category',
              error: error.message,
            },
          };
        }
      },
    }),

    getVariantsByCategory: builder.query<
      PaginatedResult<Variant>,
      {
        categoryId: string;
        pageSize: number;
        lastDoc: QueryDocumentSnapshot<DocumentData> | null;
      }
    >({
      async queryFn({ categoryId, pageSize, lastDoc }) {
        try {
          let q = query(
            collection(db, 'variants'),
            where('categoryIds', 'array-contains', categoryId),
            limit(pageSize + 1)
          );

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
            data: {
              items: variants,
              lastDoc: newLastDoc,
              hasMore,
            },
          };
        } catch (error: any) {
          console.error('Error fetching variants by category:', error);
          return {
            error: {
              status: 'FETCH_ERROR',
              message: 'Failed to fetch variants by category',
              error: error.message,
            },
          };
        }
      },
    }),

    getAllVariantsPaginated: builder.query<
      PaginatedResult<Variant>,
      { pageSize: number; lastDoc: QueryDocumentSnapshot<DocumentData> | null }
    >({
      async queryFn({ pageSize, lastDoc }) {
        try {
          let q = query(collection(db, 'variants'), limit(pageSize + 1));

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
            data: {
              items: variants,
              lastDoc: newLastDoc,
              hasMore,
            },
          };
        } catch (error: any) {
          console.error('Error fetching paginated variants:', error);
          return {
            error: {
              status: 'FETCH_ERROR',
              message: 'Failed to fetch paginated variants',
              error: error.message,
            },
          };
        }
      },
    }),

    createVariant: builder.mutation<string, Omit<Variant, 'id'>>({
      async queryFn(data, _api, _extraOptions, _baseQuery) {
        try {
          const docRef = await addDoc(collection(db, 'variants'), {
            ...data,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });

          return { data: docRef.id };
        } catch (error: any) {
          console.error('Error creating variant:', error);
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: 'Failed to create variant',
              data: error.message,
            },
          };
        }
      },
    }),

    updateVariant: builder.mutation<
      void,
      { id: string; data: Partial<Variant> }
    >({
      async queryFn({
        id,
        data,
      }): Promise<
        QueryReturnValue<void, FetchBaseQueryError, FetchBaseQueryMeta>
      > {
        try {
          const docRef = doc(db, 'variants', id);
          await updateDoc(docRef, {
            ...data,
            updatedAt: new Date().toISOString(),
          });

          return { data: undefined };
        } catch (error: any) {
          console.error('Error updating variant:', error);
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: error.message,
            },
          };
        }
      },
    }),

    searchVariants: builder.query<Variant[], string>({
      async queryFn(searchTerm) {
        try {
          const snapshot = await getDocs(collection(db, 'variants'));
          const variants: Variant[] = [];

          const normalizedSearchTerm = searchTerm.toLowerCase().trim();

          snapshot.forEach(doc => {
            const variant = { id: doc.id, ...doc.data() } as Variant;

            if (variant.name.toLowerCase().includes(normalizedSearchTerm)) {
              variants.push(variant);
              return;
            }

            if (variant.values && Array.isArray(variant.values)) {
              const foundInValues = variant.values.some(value =>
                value.toLowerCase().includes(normalizedSearchTerm)
              );

              if (foundInValues) {
                variants.push(variant);
                return;
              }
            }

            if (
              variant.description &&
              variant.description.toLowerCase().includes(normalizedSearchTerm)
            ) {
              variants.push(variant);
            }
          });

          return { data: variants };
        } catch (error: any) {
          console.error('Error searching variants:', error);
          return {
            error: {
              status: 'FETCH_ERROR',
              message: 'Failed to search variants',
              error: error.message,
            },
          };
        }
      },
    }),
  }),
});

export const {
  useGetAllVariantsByCategoryQuery,
  useGetVariantsByCategoryQuery,
  useGetAllVariantsPaginatedQuery,
  useCreateVariantMutation,
  useUpdateVariantMutation,
  useSearchVariantsQuery,
} = variantApi;
