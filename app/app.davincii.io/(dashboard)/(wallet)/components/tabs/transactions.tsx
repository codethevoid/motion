"use client";

import { useTransactions } from "@/hooks/use-transactions";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "./empty";
import { HandCoins } from "lucide-react";
import { Card } from "@/components/ui/card";
import { AccountTxTransaction, TransactionMetadata } from "xrpl";
import { CircleArrowOutUpRight, CircleArrowOutDownLeft, RefreshCcw } from "lucide-react";
import { useWallet } from "@/hooks/use-wallet";

const iconMap = {
  Payment: {
    send: <CircleArrowOutUpRight size={16} />,
    receive: <CircleArrowOutDownLeft size={16} />,
  },
  OfferCreate: <RefreshCcw size={16} />,
  NFTokenCreateOffer: {
    send: <CircleArrowOutUpRight size={16} />,
    receive: <CircleArrowOutDownLeft size={16} />,
  },
};

export const Transactions = () => {
  const { transactions, isLoading, error } = useTransactions(undefined);
  const { wallet, isLoading: isWalletLoading } = useWallet();
  console.log(transactions);

  if (isLoading || isWalletLoading) return <TransactionsSkeleton />;

  if (error) {
    return <EmptyState icon={<HandCoins size={18} />} label="Failed to fetch transactions" />;
  }

  if (transactions?.length === 0 || !transactions) {
    return <EmptyState icon={<HandCoins size={18} />} label="No transactions found" />;
  }

  // const getTransactionInfo = (tx: AccountTxTransaction) => {
  //   const type = tx.tx_json?.TransactionType;
  //   switch (type) {
  //     case "Payment":
  //       const destination = tx.tx_json?.Destination;
  //       const icon =
  //         destination === wallet?.address ? iconMap.Payment.receive : iconMap.Payment.send;
  //       const deliveredAmount =
  //         typeof (tx.meta as TransactionMetadata).delivered_amount === "string"
  //           ? (tx.meta as TransactionMetadata).delivered_amount
  //           : (
  //               (tx.meta as TransactionMetadata).delivered_amount as {
  //                 value: string;
  //                 currency: string;
  //               }
  //             )?.value;
  //       const currency =
  //         typeof (tx.meta as TransactionMetadata).delivered_amount === "string"
  //           ? "XRP"
  //           : ((tx.meta as TransactionMetadata).delivered_amount as { currency: string })
  //               ?.currency || "XRP";
  //       const label = destination === wallet?.address ? `Received ${currency}` : `Sent ${currency}`;
  //       return {
  //         icon,
  //         label,
  //         deliveredAmount,
  //       };
  //       break;
  //     case "OfferCreate":
  //       return iconMap.OfferCreate;
  //   }
  // };

  return (
    <div className="space-y-1.5">
      {transactions?.map((tx: AccountTxTransaction) => (
        <Card key={tx.hash} className="p-0">
          <div className="flex items-center justify-between px-3 py-2.5">
            <div className="flex items-center space-x-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
                {iconMap["Payment"].receive}
              </div>
              <div>
                <p className="text-[13px]">Received XRP</p>
                <p className="text-xs text-muted-foreground">Dec 11, 2024 3:00 PM</p>
              </div>
            </div>
            <div>
              <p className="text-right text-[13px]">+100 XRP</p>
              {/* <p className="text-right text-xs text-muted-foreground">
                {token.balanceInUsd.toLocaleString("en-us", {
                  style: "currency",
                  currency: "USD",
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p> */}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export const TransactionsSkeleton = () => {
  return (
    <div className="space-y-1.5">
      <Skeleton className="h-[55.5px] w-full rounded-xl" />
      <Skeleton className="h-[55.5px] w-full rounded-xl" />
      <Skeleton className="h-[55.5px] w-full rounded-xl" />
    </div>
  );
};
