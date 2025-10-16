"use client";
import React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import ProtectedRoute from "@/lib/ProtectedRoute";
import WalletCardComponent from "@/components/wallet/WalletCardComponent";
import PaymentDialog from "@/components/wallet/PaymentDialog";
import { WalletDetails } from "@/lib/types";
import { useEffect, useState } from "react";
import { getWalletBalance, getWalletDetails } from "@/lib/wallet";
import { toast } from "sonner";
import TransactionTable from "@/components/wallet/TransactionTable";
import { useTransactions } from "@/hooks/useTransactions";

// Define a boilerplate wallet to use as fallback
const boilerplateWallet: WalletDetails = {
  address: "0x0000000000000000000000000000000000000000",
  name: "Demo Wallet",
  id: "demo",
  symbol: "DUMMY",
  token: "DUMMYTOKEN",
};

const WalletPage = () => {
  const [wallet, setWallet] = useState<WalletDetails | null>(null);
  const [balance, setBalance] = useState<string | number | null>(null);
  const [walletLoading, setWalletLoading] = useState(true);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  // Use the new transactions hook for pagination
  const {
    transactions,
    pagination,
    loading: transactionsLoading,
    error: transactionsError,
    fetchTransactions,
    currentPage,
    totalPages,
  } = useTransactions();

  const fetchWalletData = async () => {
    setWalletLoading(true);
    setWalletError(null);
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const wallet = await getWalletDetails(token);
        const balance = await getWalletBalance(token);

        setWallet(wallet ?? boilerplateWallet);
        setBalance(balance);
      } catch (err: unknown) {
        setWallet(boilerplateWallet);
        setBalance(null);
        const errMsg =
          err instanceof Error ? err.message : "Failed to fetch wallet details";
        setWalletError(errMsg);
        toast.error(errMsg, {
          action: { label: "Close", onClick: () => {} },
          richColors: true,
        });
      } finally {
        setWalletLoading(false);
      }
    } else {
      setWallet(boilerplateWallet);
      setBalance(null);
      const errMsg = "No authentication token found.";
      setWalletError(errMsg);
      toast.error(errMsg, {
        action: { label: "Close", onClick: () => {} },
        richColors: true,
      });
      setWalletLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
    // Fetch initial transactions
    fetchTransactions({ page: 1, page_size: 20 });
  }, [fetchTransactions]);

  const handleTransactionComplete = () => {
    // Refresh wallet data and transactions after transaction
    fetchWalletData();
    fetchTransactions({ page: 1, page_size: 20 });
  };

  const handlePageChange = (page: number) => {
    fetchTransactions({ page, page_size: 20 });
  };

  // Show wallet error if there's an issue with wallet data
  useEffect(() => {
    if (walletError) {
      toast.error(walletError, {
        action: { label: "Close", onClick: () => {} },
        richColors: true,
      });
    }
  }, [walletError]);

  // Show transaction error if there's an issue with transactions
  useEffect(() => {
    if (transactionsError) {
      toast.error(transactionsError, {
        action: { label: "Close", onClick: () => {} },
        richColors: true,
      });
    }
  }, [transactionsError]);

  return (
    <ProtectedRoute>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="/wallet">Wallet</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/wallet">Overview</BreadcrumbLink>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          {/* Payment Dialog */}
          {wallet && (
            <PaymentDialog
              open={paymentDialogOpen}
              onOpenChange={setPaymentDialogOpen}
              walletBalance={balance}
              walletId={wallet.id}
              tokenSymbol={wallet.symbol}
              onTransactionComplete={handleTransactionComplete}
            />
          )}
          <div className="@container/main w-full max-w-7.5xl flex flex-col gap-6 px-4 lg:px-8 py-8 mx-auto">
            <h1 className="text-2xl font-bold">Wallet</h1>
            <div className="flex flex-1 flex-col">
              <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                  <WalletCardComponent
                    wallet={wallet}
                    balance={balance}
                    loading={walletLoading}
                    error={walletError}
                    onSendClick={() => setPaymentDialogOpen(true)}
                  />
                  <div className="mt-2">
                    <TransactionTable
                      transactions={transactions}
                      loading={transactionsLoading}
                      pagination={pagination}
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
};

export default WalletPage;
