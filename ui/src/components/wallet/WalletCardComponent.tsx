import { IconAddressBook, IconMoneybag } from "@tabler/icons-react";
import { Send } from "lucide-react";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { WalletDetails } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { QRCode } from "react-qrcode-logo";

interface WalletCardComponentProps {
  wallet: WalletDetails | null;
  balance: string | number | null;
  loading?: boolean;
  error?: string | null;
  onSendClick?: () => void;
}

const WalletCardComponent = ({
  wallet,
  balance,
  loading,
  onSendClick,
}: WalletCardComponentProps) => {
  if (loading) {
    // Show skeleton while loading
    return (
      <div className="w-full">
        <Skeleton className="h-[180px] w-full rounded-xl" />
      </div>
    );
  }
  if (!wallet) {
    // If wallet is null and not loading, render nothing or a fallback
    return null;
  }
  return (
    <Card className="@container/card w-full">
      <CardHeader>
        <div className="flex items-start justify-between w-full">
          <div>
            <CardDescription className="text-[var(--color-logo-orange)]">
              Wallet
            </CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {wallet?.name}
            </CardTitle>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onSendClick}
              className="flex items-center gap-2 bg-white text-black hover:bg-logo-orange hover:text-white"
            >
              <Send className="h-4 w-4" />
              Send
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white text-black hover:bg-logo-orange hover:text-white"
                >
                  Receive
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[350px]">
                <DialogHeader>
                  <DialogTitle>Receive</DialogTitle>
                  <DialogDescription>
                    Scan or copy your wallet address to receive funds.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center gap-4 py-2">
                  <QRCode
                    value={wallet.address || ""}
                    size={160}
                    bgColor="#23272f"
                    fgColor="#fff"
                    ecLevel="H"
                    logoImage="/logo.png"
                    logoWidth={32}
                    logoHeight={32}
                    removeQrCodeBehindLogo={true}
                  />
                  <div className="w-full flex flex-col items-center gap-2">
                    <Label htmlFor="wallet-address">Wallet Address</Label>
                    <div className="flex w-full gap-2 items-center">
                      <Input
                        id="wallet-address"
                        value={wallet.address}
                        readOnly
                        className="font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
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
  );
};

export default WalletCardComponent;
