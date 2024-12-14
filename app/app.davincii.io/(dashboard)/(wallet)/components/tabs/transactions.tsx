"use client";

import { useTransactions } from "@/hooks/use-transactions";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "./empty";
import { HandCoins } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CircleArrowOutUpRight, CircleArrowOutDownLeft, RefreshCcw } from "lucide-react";
import type { Transaction } from "@/utils/process-transaction";
import { format } from "date-fns";
import { useState } from "react";

const iconMap = {
  send: <CircleArrowOutUpRight size={16} />,
  receive: <CircleArrowOutDownLeft size={16} />,
  swap: <RefreshCcw size={16} />,
  // NFTokenCreateOffer: {
  //   send: <CircleArrowOutUpRight size={16} />,
  //   receive: <CircleArrowOutDownLeft size={16} />,
  // },
};

export const Transactions = () => {
  const { transactions, isLoading, error } = useTransactions(undefined);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  console.log(transactions);

  if (isLoading) return <TransactionsSkeleton />;

  if (error) {
    return <EmptyState icon={<HandCoins size={18} />} label="Failed to fetch transactions" />;
  }

  if (transactions?.length === 0 || !transactions) {
    return <EmptyState icon={<HandCoins size={18} />} label="No transactions found" />;
  }

  const formatLabel = (tx: Transaction) => {
    if (tx.direction === "receive") {
      return `Received ${typeof tx.amountDelivered === "string" ? "XRP" : typeof tx.amountDelivered === "object" ? tx.amountDelivered.currency : ""}`;
    }
    if (tx.direction === "send") {
      return `Sent ${
        typeof tx.amountDelivered === "string"
          ? "XRP"
          : typeof tx.amountDelivered === "object"
            ? tx.amountDelivered.currency
            : ""
      }`;
    }
    return `Swapped`;
  };

  return (
    <div className="space-y-1.5">
      {transactions
        ?.filter((tx) => Number(tx.amountDelivered) > 1)
        .map((tx: Transaction) => (
          <Card key={tx.hash} className="p-0">
            <div className="flex items-center justify-between px-3 py-2.5">
              <div className="flex items-center space-x-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
                  {iconMap[tx.direction]}
                </div>
                <div>
                  <p className="text-[13px]">{formatLabel(tx)}</p>
                  <p className="text-xs text-muted-foreground">
                    {tx.date
                      ? format(new Date((tx.date + 946684800) * 1000), "MMM d, yyyy h:mm a")
                      : "No date available"}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-right text-[13px]">
                  {tx.direction === "receive" || tx.direction === "send" ? "+" : "-"}
                  {typeof tx.amountDelivered === "string"
                    ? (Number(tx.amountDelivered) / 1_000_000).toLocaleString("en-us", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 4,
                      })
                    : typeof tx.amountDelivered === "object"
                      ? Number(tx.amountDelivered.value).toLocaleString("en-us", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 4,
                        })
                      : ""}{" "}
                  {typeof tx.amountDelivered === "string"
                    ? "XRP"
                    : typeof tx.amountDelivered === "object"
                      ? tx.amountDelivered.currency
                      : ""}
                </p>
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
