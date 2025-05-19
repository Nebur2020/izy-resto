export interface Transaction {
  id: string;
  date: string;
  source: string;
  description: string;
  reference: string;
  debit: number;
  credit: number;
  gross: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AccountingStats {
  totalDebit: number;
  totalCredit: number;
  netAmount: number;
  transactionCount: number;
  totalRevenue: number;
  totalExpenses: number;
  orderCount: number;
  netIncome: number;
  totalTaxes?: number;
  totalTips?: number;
  totalDelivery?: number;
  taxRate?: number;
  averageTip?: number;
  deliveryCount?: number;
}

export interface AccountingPeriod {
  startDate: Date;
  endDate: Date;
}
