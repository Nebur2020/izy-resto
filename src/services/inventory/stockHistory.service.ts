import {
  collection,
  query,
  orderBy,
  getDocs,
  addDoc,
  where,
  limit,
  startAfter,
} from 'firebase/firestore';
import { db } from '../../lib/firebase/config';
import { StockUpdateError } from './errors';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils';
import jsPDF from 'jspdf';
import { Currency, Language } from '../../types';

interface StockUpdate {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  reason: string;
  cost: number;
  date: string;
  type: string;
  orderId?: string;
}

interface GetHistoryOptions {
  startDate?: Date;
  endDate?: Date;
  itemId?: string;
  page?: number;
  pageSize?: number;
  lastDoc?: any;
}

interface HistoryResponse {
  updates: StockUpdate[];
  totalCount: number;
  lastDoc?: any;
}

class StockHistoryService {
  private readonly collection = 'stock_history';

  async getHistory(options: GetHistoryOptions = {}): Promise<HistoryResponse> {
    try {
      const {
        startDate,
        endDate,
        itemId,
        page = 1,
        pageSize = 10,
        lastDoc,
      } = options;

      const constraints: any[] = [orderBy('date', 'desc')];

      if (startDate) {
        constraints.push(where('date', '>=', startDate.toISOString()));
      }

      if (endDate) {
        constraints.push(where('date', '<=', endDate.toISOString()));
      }

      if (itemId) {
        constraints.push(where('itemId', '==', itemId));
      }

      const countQuery = query(collection(db, this.collection), ...constraints);
      const countSnapshot = await getDocs(countQuery);
      const totalCount = countSnapshot.size;

      constraints.push(limit(pageSize));
      if (lastDoc) {
        constraints.push(startAfter(lastDoc));
      }

      const q = query(collection(db, this.collection), ...constraints);
      const snapshot = await getDocs(q);

      const updates = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as StockUpdate[];

      return {
        updates,
        totalCount,
        lastDoc: snapshot.docs[snapshot.docs.length - 1],
      };
    } catch (error) {
      console.error('Error fetching stock history:', error);
      throw new StockUpdateError(
        'Failed to fetch stock history',
        'history/fetch-error',
        error
      );
    }
  }

  async addUpdate(update: Omit<StockUpdate, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.collection), {
        ...update,
        createdAt: new Date().toISOString(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding stock update:', error);
      throw new StockUpdateError(
        'Failed to add stock update',
        'history/add-error',
        error
      );
    }
  }

  async generateHistoryPDF(
    t: (key: string) => string,
    lng: Language,
    startDate?: Date,
    endDate?: Date,
    currency?: Currency
  ): Promise<void> {
    try {
      const { updates } = await this.getHistory({
        startDate,
        endDate,
        pageSize: 1000,
      });

      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      let yPos = 20;

      pdf.setFontSize(16);
      pdf.text(t('common:stock-history'), pageWidth / 2, yPos, {
        align: 'center',
      });
      yPos += 10;

      pdf.setFontSize(12);
      const dateRange = `${
        startDate
          ? formatDate(startDate.toISOString(), false, lng)
          : t('common:start')
      } - ${
        endDate
          ? formatDate(endDate.toISOString(), false, lng)
          : t('common:today')
      }`;
      pdf.text(`${t('common:period')} ${dateRange}`, pageWidth / 2, yPos, {
        align: 'center',
      });
      yPos += 20;

      const headers = [
        t('common:date'),
        t('common:product'),
        t('common:quantity'),
        t('common:reason'),
        t('common:cost'),
      ];
      const colWidths = [30, 50, 25, 50, 35];
      let xPos = 10;

      pdf.setFillColor(240, 240, 240);
      pdf.rect(xPos, yPos - 5, pageWidth - 20, 10, 'F');
      pdf.setFontSize(10);

      headers.forEach((header, i) => {
        pdf.text(header, xPos, yPos);
        xPos += colWidths[i];
      });
      yPos += 10;

      pdf.setFontSize(9);
      updates.forEach(update => {
        if (yPos > pdf.internal.pageSize.getHeight() - 20) {
          pdf.addPage();
          yPos = 20;
        }

        xPos = 10;
        pdf.text(formatDate(update.date, false, lng), xPos, yPos);
        xPos += colWidths[0];

        pdf.text(update.itemName, xPos, yPos);
        xPos += colWidths[1];

        pdf.text(Number(update.quantity).toFixed(2).toString(), xPos, yPos);
        xPos += colWidths[2];

        pdf.text(update.reason, xPos, yPos);
        xPos += colWidths[3];

        pdf.text(formatCurrency(update.cost, currency), xPos, yPos);

        yPos += 7;
      });

      yPos += 10;
      const totalCost = updates.reduce((sum, update) => sum + update.cost, 0);
      const totalQuantity = updates.reduce(
        (sum, update) => sum + update.quantity,
        0
      );

      pdf.setFontSize(11);
      pdf.text(
        `${t('common:all-transaction')}: ${Number(totalQuantity).toFixed(2)}`,
        10,
        yPos
      );
      pdf.text(
        `${t('common:total-cost')}: ${formatCurrency(totalCost, currency)}`,
        pageWidth - 60,
        yPos
      );

      const fileName = `${t('common:history-filename')}-${formatDate(
        new Date().toISOString(),
        false,
        lng
      )}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new StockUpdateError(
        'Failed to generate PDF',
        'history/pdf-error',
        error
      );
    }
  }
}

export const stockHistoryService = new StockHistoryService();
