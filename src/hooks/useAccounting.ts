import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Transaction,
  AccountingStats,
  AccountingPeriod,
} from '../types/accounting';
import { accountingService } from '../services/accounting/accounting.service';
import toast from 'react-hot-toast';
import { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';

const ITEMS_PER_PAGE = 10;

export function useAccounting(period: AccountingPeriod) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const lastDocRef = useRef<QueryDocumentSnapshot<DocumentData> | null>(null);

  // Calculate stats from transactions with proper type handling and validation
  const stats = useMemo<AccountingStats>(() => {
    const validTransactions = transactions.filter(
      t =>
        // Ensure we only process transactions with valid numbers
        (typeof t.debit === 'number' || typeof t.credit === 'number') &&
        !isNaN(t.debit || 0) &&
        !isNaN(t.credit || 0)
    );

    const totalDebit = validTransactions.reduce((sum, t) => {
      const debitAmount = typeof t.debit === 'number' ? Math.abs(t.debit) : 0;
      return sum + debitAmount;
    }, 0);

    const totalCredit = validTransactions.reduce((sum, t) => {
      const creditAmount =
        typeof t.credit === 'number' ? Math.abs(t.credit) : 0;
      return sum + creditAmount;
    }, 0);

    // Round to 2 decimal places to avoid floating-point precision issues
    const roundedDebit = Math.round(totalDebit * 100) / 100;
    const roundedCredit = Math.round(totalCredit * 100) / 100;
    const netAmount = Math.round((roundedCredit - roundedDebit) * 100) / 100;

    return {
      totalDebit: roundedDebit,
      totalCredit: roundedCredit,
      netAmount,
      transactionCount: validTransactions.length,
      // Add validation info for debugging
      invalidTransactions: transactions.length - validTransactions.length,
    };
  }, [transactions]);

  // Initial data load when period changes
  useEffect(() => {
    loadInitialData();
  }, [period]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      setTransactions([]);
      lastDocRef.current = null;

      // Get total count for the period
      const count = await accountingService.getTransactionsCount(period);
      setTotalCount(count);

      // Get first batch of transactions
      const result = await accountingService.getPaginatedTransactions(
        period,
        ITEMS_PER_PAGE
      );

      setTransactions(result.transactions);
      lastDocRef.current = result.lastDoc;
      setHasMore(result.transactions.length < count);
    } catch (error) {
      console.error('Error loading initial accounting data:', error);
      toast.error('Erreur lors du chargement des données comptables');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = async () => {
    if (isLoadingMore || !hasMore || !lastDocRef.current) return;

    try {
      setIsLoadingMore(true);

      const result = await accountingService.getPaginatedTransactions(
        period,
        ITEMS_PER_PAGE,
        lastDocRef.current
      );

      if (result.transactions.length > 0) {
        setTransactions(prevTransactions => [
          ...prevTransactions,
          ...result.transactions,
        ]);
        lastDocRef.current = result.lastDoc;

        // Check if we've loaded all transactions
        setHasMore(
          transactions.length + result.transactions.length < totalCount
        );
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more transactions:', error);
      toast.error('Erreur lors du chargement de transactions supplémentaires');
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Function to fetch all transactions (for exports, reports, etc.)
  const fetchAllTransactions = async (): Promise<Transaction[]> => {
    try {
      return await accountingService.getTransactions(period);
    } catch (error) {
      console.error('Error fetching all transactions:', error);
      toast.error('Erreur lors du chargement complet des transactions');
      return [];
    }
  };

  return {
    transactions,
    stats,
    isLoading,
    isLoadingMore,
    refreshData: loadInitialData,
    loadMore,
    hasMore,
    displayedCount: transactions.length,
    totalCount,
    fetchAllTransactions,
  };
}
