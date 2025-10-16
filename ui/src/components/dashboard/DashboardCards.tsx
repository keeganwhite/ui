"use client";
import { useEffect, useState } from "react";
import {
  IconAddressBook,
  IconBook,
  IconCloudRain,
  IconMoneybag,
} from "@tabler/icons-react";

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getWalletBalance, getWalletDetails } from "@/lib/wallet";
import { WalletDetails, Contract } from "@/lib/types";
import { listContracts } from "@/lib/contracts";

const DashboardCards = () => {
  const [wallet, setWallet] = useState<WalletDetails | null>(null);
  const [balance, setBalance] = useState<string | number | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const token = localStorage.getItem("token");
    const fetchWallet = async () => {
      if (token) {
        const wallet = await getWalletDetails(token);
        const balance = await getWalletBalance(token);
        console.log("[section-cards] wallet", wallet);
        console.log("[section-cards] balance", balance);
        setWallet(wallet);
        setBalance(balance);
      }
    };
    fetchWallet();
  }, []);
  useEffect(() => {
    const token = localStorage.getItem("token");
    const fetchContracts = async () => {
      if (token) {
        try {
          const contracts = await listContracts(token);
          setContracts(contracts);
        } catch (error) {
          console.error("[section-cards] Error fetching contracts", error);
        }
      }
    };
    fetchContracts();
  }, []);
  useEffect(() => {
    // Set loading to false when both wallet and contracts are loaded
    if (wallet !== null && balance !== null && contracts.length > 0) {
      setLoading(false);
    }
  }, [wallet, balance, contracts]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-2">
        <div className="@container/card">
          <Skeleton className="h-[180px] w-full rounded-xl" />
        </div>
        <div className="@container/card">
          <Skeleton className="h-[180px] w-full rounded-xl" />
        </div>
      </div>
    );
  }
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-2">
      {/* Wallet Card */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="text-[var(--color-logo-orange)]">
            Wallet
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {wallet?.name}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            <IconMoneybag className="size-4 text-[var(--color-logo-orange)]" />{" "}
            {balance}
          </div>
          <div className="line-clamp-1 flex gap-2 font-medium">
            <IconAddressBook className="size-4  text-[var(--color-logo-orange)]" />{" "}
            {wallet?.address}
          </div>
          <div className="text-muted-foreground">{wallet?.token}</div>
        </CardFooter>
      </Card>
      {/* Smart Contract Card */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="text-[var(--color-logo-orange)]">
            Smart Contracts
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            Faucet and Registry Contracts
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          {contracts
            .filter(
              (c) =>
                c.contract_type === "eth faucet" ||
                c.contract_type === "account index"
            )
            .map((contract) => (
              <div key={contract.id} className="mb-2">
                <div className="flex gap-2 font-medium items-center">
                  {contract.contract_type === "eth faucet" ? (
                    <IconCloudRain className="size-4 text-[var(--color-logo-orange)]" />
                  ) : (
                    <IconBook className="size-4 text-[var(--color-logo-orange)]" />
                  )}
                  <span>{contract.name}</span>
                </div>
                <div className="ml-6 text-xs break-all text-muted-foreground">
                  {contract.address}
                </div>
                <div className="ml-6 text-xs text-muted-foreground">
                  {contract.description}
                </div>
              </div>
            ))}
          {contracts.filter(
            (c) =>
              c.contract_type === "eth faucet" ||
              c.contract_type === "account index"
          ).length === 0 && (
            <div className="text-muted-foreground">
              No contract details available.
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default DashboardCards;
