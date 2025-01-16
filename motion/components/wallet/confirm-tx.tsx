"use client";

import { useWallet } from "@/hooks/use-wallet";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useWalletActions } from "./context";
import { formatCurrency } from "@/utils/format-currency";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useNetworkFee } from "@/hooks/use-network-fee";
import { Password } from "./password";
import { useState } from "react";
import { toast } from "sonner";
import { ButtonSpinner } from "../ui/button-spinner";
import { mutate } from "swr";
import { useSession } from "@/hooks/use-session";
import { API_BASE_URL } from "@/utils/api-base-url";

export const ConfirmTx = () => {
  const { wallet, isLoading } = useWallet();
  const { transaction, password, setIsOpen } = useWalletActions();
  const { data: networkFee } = useNetworkFee();
  const [isConfirming, setIsConfirming] = useState(false);
  const { jwe } = useSession();

  const calculateMinimumReceived = () => {
    if (transaction?.type === "buy") {
      if (typeof transaction?.amountToReceive == "object") {
        // means they are buying a custom token
        // muliply the amount by the slippage
        return (Number(transaction?.amountToReceive.value) * (100 - transaction?.slippage)) / 100;
      }
    } else {
      return (
        (Number(transaction?.amountToReceive) * (100 - (transaction?.slippage || 4))) /
        100 /
        1_000_000
      );
    }
  };

  const confirmTransaction = async () => {
    if (!transaction) return;
    setIsConfirming(true);
    try {
      const res = await fetch(`${API_BASE_URL}/trade`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwe}` },
        body: JSON.stringify({ transaction, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setIsConfirming(false);
        toast.error(data.error);
        return;
      }

      if (typeof transaction?.amountToDeliver === "object") {
        const searchParams = new URLSearchParams();
        searchParams.set("currency", transaction?.amountToDeliver.currency);
        searchParams.set("issuer", transaction?.amountToDeliver.issuer);
        mutate(`/api/swap/balance?${searchParams.toString()}`);
        mutate(`/api/swap/balance?currency=XRP`);
      } else if (typeof transaction?.amountToReceive === "object") {
        const searchParams = new URLSearchParams();
        searchParams.set("currency", transaction?.amountToReceive.currency);
        searchParams.set("issuer", transaction?.amountToReceive.issuer);
        mutate(`/api/swap/balance?${searchParams.toString()}`);
        mutate(`/api/swap/balance?currency=XRP`);
      }
      setIsConfirming(false);
      setIsOpen(false);
      toast.success("Transaction confirmed");
    } catch (e) {
      setIsConfirming(false);
      console.error(e);
      toast.error("Failed to confirm transaction");
    }
  };

  if (!transaction) return null;

  return (
    <div className="space-y-2">
      <Card className="space-y-4 p-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">Decentralized wallet</p>
          {isLoading ? (
            <Skeleton className="h-7 w-full max-w-[300px] rounded-sm" />
          ) : (
            <div className="flex min-w-0 max-w-fit items-center space-x-2 rounded-sm bg-secondary px-2 py-1.5">
              <img
                src={`https://api.dicebear.com/9.x/glass/png?seed=${wallet?.address}`}
                alt="wallet avatar"
                className="h-4 w-4 rounded-full"
              />
              <p className="min-w-0 truncate text-xs">{wallet?.address}</p>
            </div>
          )}
        </div>
      </Card>
      {password ? (
        <>
          <p className="text-sm font-medium">Transaction details</p>
          <Card className="p-4">
            <div className="space-y-0.5">
              <LineItem label="Slippage allowance" value={`${transaction?.slippage}%`} />
              <LineItem
                label="Sending"
                value={
                  typeof transaction?.amountToDeliver === "object"
                    ? `${Number(transaction?.amountToDeliver.value).toLocaleString("en-us", {
                        maximumFractionDigits: 4,
                      })} ${formatCurrency(transaction?.amountToDeliver.currency)}`
                    : `${(Number(transaction?.amountToDeliver) / 1_000_000).toLocaleString(
                        "en-us",
                        {
                          maximumFractionDigits: 4,
                        },
                      )} XRP`
                }
              />
              <LineItem
                label="Minimum received"
                value={`${calculateMinimumReceived()?.toLocaleString("en-us", { maximumFractionDigits: 4 })} ${transaction?.type === "buy" ? formatCurrency(typeof transaction?.amountToReceive === "object" ? transaction?.amountToReceive.currency : "") : "XRP"}`}
              />
              <LineItem label="Network cost" value={`${networkFee?.fee} XRP`} />
              <LineItem label="Trade fee (1%)" value={transaction?.fee} />
            </div>
          </Card>
          <Button onClick={confirmTransaction} className="w-full" disabled={isConfirming}>
            {isConfirming ? <ButtonSpinner /> : "Confirm"}
          </Button>
        </>
      ) : (
        <>
          <p className="text-sm font-medium">Verify your password</p>
          <Password />
        </>
      )}
    </div>
  );
};

const LineItem = ({
  label,
  value,
  action,
}: {
  label: string;
  value: string | number;
  action?: ReactNode;
}) => {
  return (
    <div className="flex items-center justify-between">
      <p className="text-xs text-muted-foreground">{label}</p>
      {action ? (
        <div className="flex items-center gap-1">
          <p className="text-xs text-foreground">{value}</p>
          {action}
        </div>
      ) : (
        <p className="text-xs text-foreground">{value}</p>
      )}
    </div>
  );
};
