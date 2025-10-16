import { useState, useCallback } from "react";
import {
  Transaction,
  TransactionListParams,
  UseTransactionsReturn,
} from "@/lib/types";
import { getUserTransactions } from "@/lib/wallet";

export const useTransactions = (): UseTransactionsReturn => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState<{
    count: number;
    next: string | null;
    previous: string | null;
  }>({
    count: 0,
    next: null,
    previous: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchTransactions = useCallback(
    async (params: TransactionListParams = {}) => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const data = await getUserTransactions(token, params);
        setTransactions(data.results);
        setPagination({
          count: data.count,
          next: data.next,
          previous: data.previous,
        });
        setCurrentPage(params.page || 1);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch transactions";
        setError(errorMessage);
        setTransactions([]);
        setPagination({
          count: 0,
          next: null,
          previous: null,
        });
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const nextPage = useCallback(() => {
    if (pagination.next) {
      fetchTransactions({ page: currentPage + 1 });
    }
  }, [pagination.next, currentPage, fetchTransactions]);

  const previousPage = useCallback(() => {
    if (pagination.previous) {
      fetchTransactions({ page: currentPage - 1 });
    }
  }, [pagination.previous, currentPage, fetchTransactions]);

  const hasNextPage = !!pagination.next;
  const hasPreviousPage = !!pagination.previous;
  const totalPages = Math.ceil(pagination.count / 20);

  return {
    transactions,
    pagination,
    loading,
    error,
    fetchTransactions,
    nextPage,
    previousPage,
    hasNextPage,
    hasPreviousPage,
    currentPage,
    totalPages,
  };
};
