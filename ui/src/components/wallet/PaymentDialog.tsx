"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Send, User, MapPin, Camera } from "lucide-react";
import {
  sendTokenAddressPk,
  sendTokenUsernamePk,
  getWalletBalance,
  getUserTransactionsLegacy,
} from "@/lib/wallet";
import {
  PaymentDialogProps,
  UserDetailType,
  TransactionReceipt,
  User as UserType,
} from "@/lib/types";
import UserSearch from "./UserSearch";

// Utility function to convert gwei to CELO
const convertGweiToCelo = (gwei: string | number): string => {
  const gweiValue = typeof gwei === "string" ? parseFloat(gwei) : gwei;
  if (isNaN(gweiValue)) return "0";

  // 1 CELO = 10^18 wei, 1 gwei = 10^9 wei
  // So 1 gwei = 10^-9 CELO
  const celoValue = gweiValue * Math.pow(10, -9);
  return celoValue.toFixed(9); // Show 9 decimal places for precision
};

const INITIAL_RECEIPT: TransactionReceipt = {
  blockHash: "",
  blockNumber: "",
  gasUsed: "",
  status: 1,
  transactionHash: "",
  transactionIndex: "",
};

const PaymentDialog: React.FC<PaymentDialogProps> = ({
  open,
  onOpenChange,
  walletBalance,
  walletId,
  tokenSymbol,
  onTransactionComplete,
}) => {
  const [userDetailType, setUserDetailType] =
    useState<UserDetailType>("username");
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receipt, setReceipt] = useState<TransactionReceipt>(INITIAL_RECEIPT);
  const [showAdvancedDetails, setShowAdvancedDetails] = useState(false);
  const [currentBalance, setCurrentBalance] = useState<string | number | null>(
    walletBalance
  );

  useEffect(() => {
    setCurrentBalance(walletBalance);
  }, [walletBalance]);

  const handleRefreshBalance = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("No authentication token found");
        return;
      }
      const balance = await getWalletBalance(token);
      setCurrentBalance(balance);
      toast.success("Balance refreshed");
    } catch (error) {
      console.error("Error refreshing balance:", error);
      toast.error("Failed to refresh balance");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseReceipt = () => {
    setShowReceipt(false);
    setReceipt(INITIAL_RECEIPT);
    setShowAdvancedDetails(false);
  };

  const handlePay = async () => {
    const recipientDetails =
      userDetailType === "username" ? selectedUser?.username : walletAddress;

    if (!recipientDetails?.trim()) {
      toast.error("Please enter valid recipient details");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("No authentication token found");
        return;
      }

      let txReceipt: TransactionReceipt;

      if (userDetailType === "username") {
        txReceipt = await sendTokenUsernamePk(
          token,
          walletId.toString(),
          amount,
          recipientDetails
        );
      } else {
        txReceipt = await sendTokenAddressPk(
          token,
          walletId.toString(),
          amount,
          recipientDetails
        );
      }

      // Refresh balance and transactions
      const balance = await getWalletBalance(token);
      await getUserTransactionsLegacy(token);

      setCurrentBalance(balance);
      setReceipt(txReceipt);
      setShowReceipt(true);

      // Clear form

      // Notify parent component
      onTransactionComplete();

      toast.success("Transaction completed successfully!");
    } catch (error: unknown) {
      console.error("Payment error:", error);

      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";

      if (error && typeof error === "object" && "response" in error) {
        const response = (
          error as { response?: { status?: number; data?: { error?: string } } }
        ).response;

        // Parse the error message from the response
        let parsedError = "";
        try {
          if (response?.data?.error) {
            // Try to parse the error string as JSON if it's a stringified object
            if (
              typeof response.data.error === "string" &&
              response.data.error.startsWith("{")
            ) {
              const errorObj = JSON.parse(response.data.error);
              parsedError =
                errorObj.message || errorObj.error || response.data.error;
            } else {
              parsedError = response.data.error;
            }
          }
        } catch {
          parsedError = response?.data?.error || "";
        }

        console.log("parsedError", parsedError);

        // Check for insufficient gas errors with more comprehensive matching
        const isInsufficientGasError =
          parsedError.includes("insufficient funds for gas") ||
          parsedError.includes("insufficient funds for gas * price + value") ||
          parsedError.includes("overshot") ||
          parsedError.includes("error_forwarding_sequencer") ||
          parsedError.includes("insufficient funds") ||
          parsedError.toLowerCase().includes("gas");

        console.log("isInsufficientGasError:", isInsufficientGasError);

        if (response?.status === 404 && userDetailType === "username") {
          toast.error(
            `Cannot find a wallet for user: ${recipientDetails}. Ensure they have created a wallet in the iNethi app.`
          );
        } else if (
          response?.status === 404 &&
          userDetailType === "walletAddress"
        ) {
          toast.error(
            `Cannot find a wallet for address: ${recipientDetails}. Check if you have the correct address.`
          );
        } else if (parsedError.includes("ERR_OVERSPEND")) {
          toast.error("Transaction failed due to overspend.");
        } else if (parsedError.includes("ENS name")) {
          toast.error(`Address ${recipientDetails} is invalid`);
        } else if (isInsufficientGasError) {
          console.log("Showing insufficient gas error toast");
          toast.error(
            "Payment failed due to insufficient gas. Please try again with a smaller amount or contact support.",
            {
              duration: 5000,
            }
          );
        } else {
          console.log("Showing generic error toast");
          toast.error(`Transaction failed: ${parsedError || errorMessage}`);
        }
      } else {
        console.log("Showing fallback error toast");
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setSelectedUser(null);
    setWalletAddress("");
    setAmount("");
    setShowReceipt(false);
    setReceipt(INITIAL_RECEIPT);
    setShowAdvancedDetails(false);
  };

  const handleUserDetailTypeChange = (value: string) => {
    setUserDetailType(value as UserDetailType);
    // Clear the other field when switching
    if (value === "username") {
      setWalletAddress("");
    } else {
      setSelectedUser(null);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Send Tokens
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Balance Section */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Balance</Label>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  {currentBalance} {tokenSymbol}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefreshBalance}
                  disabled={loading}
                >
                  <RefreshCw
                    className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                  />
                </Button>
              </div>
            </div>

            <Separator />

            {/* Payment Form */}
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Select payment option
                </Label>
                <Tabs
                  value={userDetailType}
                  onValueChange={handleUserDetailTypeChange}
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger
                      value="username"
                      className="flex items-center gap-2 data-[state=active]:border-[var(--color-logo-orange)]"
                    >
                      <User className="h-4 w-4" />
                      Username
                    </TabsTrigger>
                    <TabsTrigger
                      value="walletAddress"
                      className="flex items-center gap-2 data-[state=active]:border-[var(--color-logo-orange)] "
                    >
                      <MapPin className="h-4 w-4" />
                      Wallet Address
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipient">
                  {userDetailType === "username"
                    ? "Username"
                    : "Wallet Address"}
                </Label>
                {userDetailType === "username" ? (
                  <UserSearch
                    onUserSelected={setSelectedUser}
                    value={selectedUser}
                    placeholder="Search for a user..."
                  />
                ) : (
                  <div className="relative">
                    <Input
                      id="recipient"
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      placeholder="Enter wallet address"
                      className="pr-10"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  min="0"
                  step="0.00000001"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                className="bg-white text-black hover:bg-logo-orange hover:text-white"
                onClick={handlePay}
                disabled={
                  loading ||
                  (userDetailType === "username"
                    ? !selectedUser
                    : !walletAddress.trim()) ||
                  !amount
                }
              >
                {loading ? "Processing..." : "Send"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Transaction Receipt Dialog */}
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-start">
              <span>Transaction Receipt</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Basic Details */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Sent</Label>
              <p className="text-sm text-muted-foreground">
                {amount} {tokenSymbol}
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Sent to</Label>
              <p className="text-sm text-muted-foreground break-all">
                {userDetailType === "username"
                  ? selectedUser?.username
                  : walletAddress}
              </p>
            </div>

            {/* Advanced Details Toggle */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="advanced-details"
                checked={showAdvancedDetails}
                onCheckedChange={(checked) =>
                  setShowAdvancedDetails(checked === true)
                }
              />
              <Label htmlFor="advanced-details" className="text-sm">
                See advanced details
              </Label>
            </div>

            {/* Advanced Details */}
            {showAdvancedDetails && (
              <div className="space-y-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Block Hash</Label>
                  <p className="text-sm text-muted-foreground break-all font-mono">
                    {receipt.blockHash}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Block Number</Label>
                  <p className="text-sm text-muted-foreground break-all font-mono">
                    {receipt.blockNumber}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Gas Used</Label>
                  <p className="text-sm text-muted-foreground break-all font-mono">
                    {convertGweiToCelo(receipt.gasUsed)} CELO
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Transaction Hash
                  </Label>
                  <p className="text-sm text-muted-foreground break-all font-mono">
                    {receipt.transactionHash}
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Button onClick={handleCloseReceipt}>Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PaymentDialog;
