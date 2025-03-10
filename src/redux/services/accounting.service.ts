import {
  createApi,
  fakeBaseQuery,
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
  getCountFromServer,
  orderBy,
  limit,
  startAfter,
  doc,
  runTransaction,
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore';
import { Transaction, Order } from '../../types';

export const transactionApi = createApi({
  reducerPath: 'transactionApi',
  baseQuery: fakeBaseQuery(),
  endpoints: builder => ({
    getTransactions: builder.query<
      Transaction[],
      { startDate: Date; endDate: Date }
    >({
      async queryFn(period) {
        try {
          const q = query(
            collection(db, 'transactions'),
            where('date', '>=', period.startDate.toISOString()),
            where('date', '<=', period.endDate.toISOString())
          );

          const snapshot = await getDocs(q);
          const transactions = await Promise.all(
            snapshot.docs.map(async doc => {
              let credit = doc.data().credit || 0;
              /**
               * Todo: Update this block of code.
               */
              // if (doc.data().source === 'orders' && !doc.data().hasSubtotal) {
              //   const order = await orderService.getOrderById(
              //     doc.data().reference
              //   );
              //   credit = order?.subtotal || 0;
              // }
              return {
                id: doc.id,
                ...doc.data(),
                debit: Number(doc.data().debit || 0),
                credit: Number(credit),
                gross: Number(doc.data().gross || 0),
              } as Transaction;
            })
          );

          return { data: transactions };
        } catch (error: any) {
          console.error('Error fetching transactions:', error);
          return {
            error: {
              status: 'FETCH_ERROR',
              message: 'Failed to fetch transactions',
              error: error.message,
            },
          };
        }
      },
    }),

    getTransactionsCount: builder.query<
      number,
      { startDate: Date; endDate: Date }
    >({
      async queryFn(period) {
        try {
          const startTimestamp = period.startDate.toISOString();
          const endTimestamp = period.endDate.toISOString();

          const q = query(
            collection(db, 'transactions'),
            where('date', '>=', startTimestamp),
            where('date', '<=', endTimestamp)
          );

          const snapshot = await getCountFromServer(q);
          return { data: snapshot.data().count };
        } catch (error: any) {
          console.error('Error counting transactions:', error);
          return {
            error: {
              status: 'FETCH_ERROR',
              message: 'Failed to count transactions',
              error: error.message,
            },
          };
        }
      },
    }),

    getPaginatedTransactions: builder.query<
      {
        transactions: Transaction[];
        lastDoc: QueryDocumentSnapshot<DocumentData> | null;
      },
      {
        period: { startDate: Date; endDate: Date };
        pageSize: number;
        lastDoc: QueryDocumentSnapshot<DocumentData> | null;
      }
    >({
      async queryFn({ period, pageSize, lastDoc }) {
        try {
          const startTimestamp = period.startDate.toISOString();
          const endTimestamp = period.endDate.toISOString();

          let q = query(
            collection(db, 'transactions'),
            where('date', '>=', startTimestamp),
            where('date', '<=', endTimestamp),
            orderBy('date', 'desc'),
            limit(pageSize)
          );

          if (lastDoc) {
            q = query(q, startAfter(lastDoc));
          }

          const snapshot = await getDocs(q);

          const transactions = await Promise.all(
            snapshot.docs.map(async doc => {
              let credit = doc.data().credit || 0;
              /**
               * Todo: Update this block of code.
               *
               */
              // if (doc.data().source === 'orders' && !doc.data().hasSubtotal) {
              //   const order = await orderService.getOrderById(
              //     doc.data().reference
              //   );
              //   credit = order?.subtotal || 0;
              // }

              return {
                id: doc.id,
                ...doc.data(),
                debit: Number(doc.data().debit || 0),
                credit: Number(credit),
                gross: Number(doc.data().gross || 0),
              } as Transaction;
            })
          );

          return {
            data: {
              transactions,
              lastDoc:
                snapshot.docs.length > 0
                  ? snapshot.docs[snapshot.docs.length - 1]
                  : null,
            },
          };
        } catch (error: any) {
          console.error('Error fetching paginated transactions:', error);
          return {
            error: {
              status: 'FETCH_ERROR',
              message: 'Failed to fetch paginated transactions',
              error: error.message,
            },
          };
        }
      },
    }),

    createOrderTransaction: builder.mutation<string, Order>({
      async queryFn(order) {
        try {
          const docRef = doc(collection(db, 'transactions'));

          const newTransaction = {
            date: new Date().toISOString(),
            source: 'orders',
            description: `Commande #${order.id.slice(0, 8)} - ${
              order.customerName
            }`,
            reference: order.id,
            debit: 0,
            credit: order.subtotal,
            gross: order.subtotal,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            hasSubtotal: true,
          };

          await runTransaction(db, async transaction => {
            transaction.set(docRef, newTransaction);
          });

          return { data: docRef.id };
        } catch (error: any) {
          console.error('Error creating order transaction:', error);
          return {
            error: {
              status: 'CUSTOM_ERROR',
              message: 'Failed to create order transaction',
              error: error.message,
            },
          };
        }
      },
    }),

    createTransaction: builder.mutation<string, Omit<Transaction, 'id'>>({
      async queryFn(data, _api, _extraOptions, _baseQuery) {
        try {
          const docRef = doc(collection(db, 'transactions'));

          const newTransaction = {
            ...data,
            debit: Number(data.debit || 0),
            credit: Number(data.credit || 0),
            gross: Number(data.credit || 0) - Number(data.debit || 0),
            date: data.date || new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          await runTransaction(db, async transaction => {
            transaction.set(docRef, newTransaction);
          });

          return { data: docRef.id };
        } catch (error: any) {
          console.error('Error creating transaction:', error);
          return {
            error: {
              status: 'CREATE_ERROR',
              message: 'Failed to create transaction',
              error: error.message,
            },
          };
        }
      },
    }),

    updateTransaction: builder.mutation<
      void,
      { id: string; data: Partial<Transaction> }
    >({
      async queryFn(
        { id, data }: { id: string; data: Partial<Transaction> },
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
            const docRef = doc(db, 'transactions', id);
            const docSnap = await transaction.get(docRef);

            if (!docSnap.exists()) {
              throw new Error('Transaction not found');
            }

            const currentTransaction = docSnap.data() as Transaction;

            const debit =
              data.debit !== undefined
                ? Number(data.debit)
                : Number(currentTransaction.debit || 0);
            const credit =
              data.credit !== undefined
                ? Number(data.credit)
                : Number(currentTransaction.credit || 0);
            const gross = credit - debit;

            const updatedTransaction = {
              ...currentTransaction,
              ...data,
              debit,
              credit,
              gross,
              updatedAt: new Date().toISOString(),
              ...(data.source === 'orders' ? { hasSubtotal: true } : {}),
            };

            transaction.update(docRef, updatedTransaction);
          });

          return { data: undefined };
        } catch (error: any) {
          console.error('Error updating transaction:', error);
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: error.message,
            },
          };
        }
      },
    }),

    deleteTransaction: builder.mutation<void, string>({
      async queryFn(id) {
        try {
          const docRef = doc(db, 'transactions', id);
          await runTransaction(db, async transaction => {
            const docSnap = await transaction.get(docRef);
            if (!docSnap.exists()) {
              throw new Error('Transaction not found');
            }
            transaction.delete(docRef);
          });

          return { data: undefined };
        } catch (error: any) {
          console.error('Error deleting transaction:', error);
          return {
            error: {
              status: 'DELETE_ERROR',
              message: 'Failed to delete transaction',
              error: error.message,
            },
          };
        }
      },
    }),
  }),
});

export const {
  useGetTransactionsQuery,
  useGetTransactionsCountQuery,
  useGetPaginatedTransactionsQuery,
  useCreateOrderTransactionMutation,
  useCreateTransactionMutation,
  useUpdateTransactionMutation,
  useDeleteTransactionMutation,
} = transactionApi;
