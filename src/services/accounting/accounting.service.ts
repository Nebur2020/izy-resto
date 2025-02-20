import { FirestoreService } from '../base/firestore.service';
import { Transaction } from '../../types/accounting';
import { Order } from '../../types';
import {
  collection,
  query,
  where,
  getDocs,
  runTransaction,
  doc,
  limit,
  startAfter,
  orderBy,
  DocumentData,
  QueryDocumentSnapshot,
  Timestamp,
  getCountFromServer,
} from 'firebase/firestore';
import { db } from '../../lib/firebase/config';
import { orderService } from '../orders/order.service';

class AccountingService extends FirestoreService<Transaction> {
  constructor() {
    super('transactions');
  }

  async getTransactions(period: {
    startDate: Date;
    endDate: Date;
  }): Promise<Transaction[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('date', '>=', period.startDate.toISOString()),
        where('date', '<=', period.endDate.toISOString())
      );

      const snapshot = await getDocs(q);
      const transactions = await Promise.all(
        snapshot.docs.map(async doc => {
          let credit = doc.data().credit || 0;
          if (doc.data().source === 'orders' && !doc.data().hasSubtotal) {
            const order = await orderService.getOrderById(doc.data().reference);
            credit = order?.subtotal || 0;
          }
          return {
            id: doc.id,
            ...doc.data(),
            debit: Number(doc.data().debit || 0),
            credit: Number(credit),
            gross: Number(doc.data().gross || 0),
          };
        })
      );
      return transactions as Transaction[];
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  }

  /**
   * Get transaction count for a given period
   */
  async getTransactionsCount(period: {
    startDate: Date;
    endDate: Date;
  }): Promise<number> {
    try {
      // Convert date strings to timestamps for Firestore
      const startTimestamp = this.convertToTimestampOrISOString(
        period.startDate
      );
      const endTimestamp = this.convertToTimestampOrISOString(period.endDate);

      const q = query(
        collection(db, this.collectionName),
        where('date', '>=', startTimestamp),
        where('date', '<=', endTimestamp)
      );

      const snapshot = await getCountFromServer(q);
      return snapshot.data().count;
    } catch (error) {
      console.error('Error counting transactions:', error);
      throw error;
    }
  }

  /**
   * Get paginated transactions for a given period
   */
  async getPaginatedTransactions(
    period: {
      startDate: Date;
      endDate: Date;
    },
    pageSize: number = 10,
    lastDocument: QueryDocumentSnapshot<DocumentData> | null = null
  ): Promise<{
    transactions: Transaction[];
    lastDoc: QueryDocumentSnapshot<DocumentData> | null;
  }> {
    try {
      // Convert date strings to timestamps for Firestore
      const startTimestamp = this.convertToTimestampOrISOString(
        period.startDate
      );
      const endTimestamp = this.convertToTimestampOrISOString(period.endDate);

      let q = query(
        collection(db, this.collectionName),
        where('date', '>=', startTimestamp),
        where('date', '<=', endTimestamp),
        orderBy('date', 'desc'),
        limit(pageSize)
      );

      // Add startAfter if we have a last document
      if (lastDocument) {
        q = query(q, startAfter(lastDocument));
      }

      const snapshot = await getDocs(q);

      // Process transactions including any order-specific logic
      const transactions = await Promise.all(
        snapshot.docs.map(async doc => {
          let credit = doc.data().credit || 0;
          if (doc.data().source === 'orders' && !doc.data().hasSubtotal) {
            const order = await orderService.getOrderById(doc.data().reference);
            credit = order?.subtotal || 0;
          }

          // Convert date strings or timestamps to Date objects
          const date = this.convertToDateObject(doc.data().date);
          const createdAt = this.convertToDateObject(doc.data().createdAt);
          const updatedAt = this.convertToDateObject(doc.data().updatedAt);

          return {
            id: doc.id,
            ...doc.data(),
            date,
            createdAt,
            updatedAt,
            debit: Number(doc.data().debit || 0),
            credit: Number(credit),
            gross: Number(doc.data().gross || 0),
          };
        })
      );

      // Return transactions and the last document for pagination
      return {
        transactions: transactions as Transaction[],
        lastDoc:
          snapshot.docs.length > 0
            ? snapshot.docs[snapshot.docs.length - 1]
            : null,
      };
    } catch (error) {
      console.error('Error fetching paginated transactions:', error);
      throw error;
    }
  }

  async createOrderTransaction(order: Order): Promise<string> {
    try {
      return await runTransaction(db, async transaction => {
        // Create transaction for the order
        const docRef = doc(collection(db, this.collectionName));

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

        transaction.set(docRef, newTransaction);
        return docRef.id;
      });
    } catch (error) {
      console.error('Error creating order transaction:', error);
      throw error;
    }
  }

  async createTransaction(data: Omit<Transaction, 'id'>): Promise<string> {
    try {
      return await runTransaction(db, async transaction => {
        const docRef = doc(collection(db, this.collectionName));
        const newTransaction = {
          ...data,
          debit: Number(data.debit || 0),
          credit: Number(data.credit || 0),
          gross: Number(data.credit || 0) - Number(data.debit || 0),
          date: data.date || new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        transaction.set(docRef, newTransaction);
        return docRef.id;
      });
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  async updateTransaction(
    id: string,
    data: Partial<Transaction>
  ): Promise<void> {
    try {
      await runTransaction(db, async transaction => {
        const docRef = doc(db, this.collectionName, id);
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
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  }

  async deleteTransaction(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await runTransaction(db, async transaction => {
        const docSnap = await transaction.get(docRef);
        if (!docSnap.exists()) {
          throw new Error('Transaction not found');
        }
        transaction.delete(docRef);
      });
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  }

  /**
   * Helper method to convert a date or timestamp to a Firestore timestamp
   * or ISO string depending on how dates are stored
   */
  private convertToTimestampOrISOString(date: Date): Timestamp | string {
    // If your Firestore is using ISO strings
    return date.toISOString();

    // If your Firestore is using Timestamps, use this instead:
    // return Timestamp.fromDate(date);
  }

  /**
   * Helper method to convert a date string, timestamp, or date object to a JavaScript Date
   */
  private convertToDateObject(dateValue: any): Date {
    if (!dateValue) return new Date();

    if (dateValue instanceof Date) {
      return dateValue;
    }

    if (typeof dateValue === 'string') {
      return new Date(dateValue);
    }

    if (dateValue.seconds && dateValue.nanoseconds) {
      // It's a Firestore Timestamp
      return new Date(
        dateValue.seconds * 1000 + dateValue.nanoseconds / 1000000
      );
    }

    return new Date();
  }
}

export const accountingService = new AccountingService();
