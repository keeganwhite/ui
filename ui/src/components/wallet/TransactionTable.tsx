import React from "react";
import { Transaction, TransactionCategory } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import RingLoader from "react-spinners/RingLoader";

interface TransactionTableProps {
  transactions: Transaction[];
  loading?: boolean;
  pagination?: {
    count: number;
    next: string | null;
    previous: string | null;
  };
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  loading = false,
  pagination,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}) => {
  // Get the current user's username from localStorage
  const authUsername =
    typeof window !== "undefined"
      ? localStorage.getItem("auth_username")
      : null;

  // Filter out transactions with amount === '0' or '0.00000000'
  const filteredTxs = transactions.filter(
    (tx) => tx.amount !== "0" && tx.amount !== "0.00000000"
  );

  // Helper to map category codes to display names
  const mapCategory = (cat: TransactionCategory | null) => {
    if (cat === "INTERNET_COUPON") return "Internet";
    if (cat === "REWARD") return "Reward";
    if (cat === "TRANSFER") return "Transfer";
    if (cat === "PAYMENT") return "Payment";
    if (cat === "OTHER") return "Other";
    return cat || "-";
  };

  // Helper to format amount by trimming trailing zeros
  const formatAmount = (amount: string) => {
    if (amount.includes(".")) {
      // Remove trailing zeros, but keep at least one digit after the decimal if needed
      return amount.replace(/(\.\d*?[1-9])0+$/g, "$1").replace(/\.0+$/, "");
    }
    return amount;
  };

  const handlePageChange = (page: number) => {
    if (onPageChange && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="overflow-x-auto relative">
        <div className="overflow-hidden rounded-lg border bg-card relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-card/80">
              <RingLoader color="var(--color-logo-orange)" size={48} />
            </div>
          )}
          <Table className={loading ? "opacity-50 pointer-events-none" : ""}>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Sender</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Token</TableHead>
                <TableHead>Category</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTxs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No transactions found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTxs.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>
                      {new Date(tx.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          tx.sender?.username &&
                          tx.sender.username === authUsername
                            ? "text-[var(--color-logo-orange)]"
                            : undefined
                        }
                      >
                        {tx.sender?.username || tx?.sender_address || "-"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          tx.recipient?.username &&
                          tx.recipient.username === authUsername
                            ? "text-[var(--color-logo-orange)]"
                            : undefined
                        }
                      >
                        {tx.recipient?.username || tx?.recipient_address || "-"}
                      </span>
                    </TableCell>
                    <TableCell className="text-left">
                      {formatAmount(tx.amount)}
                    </TableCell>
                    <TableCell>{tx.token || "-"}</TableCell>
                    <TableCell>{mapCategory(tx.category)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination Controls */}
      {pagination && pagination.count > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * 20 + 1} to{" "}
            {Math.min(currentPage * 20, pagination.count)} of {pagination.count}{" "}
            transactions
          </div>

          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={
                    !pagination.previous
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>

              {/* Page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      onClick={() => handlePageChange(pageNum)}
                      isActive={pageNum === currentPage}
                      className="cursor-pointer"
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={
                    !pagination.next
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default TransactionTable;
