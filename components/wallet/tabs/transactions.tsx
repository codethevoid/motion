"use client";

import { useTransactions } from "@/hooks/use-transactions";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "./empty";
import { HandCoins } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CircleArrowOutUpRight, CircleArrowOutDownLeft, RefreshCcw } from "lucide-react";
import type { Transaction } from "@/utils/process-transaction";
import { format } from "date-fns";
import { Amount } from "xrpl";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMediaQuery } from "react-responsive";
import { cn } from "@/lib/utils";

const iconMap = {
  send: <CircleArrowOutUpRight size={16} />,
  receive: <CircleArrowOutDownLeft size={16} />,
  swap: <RefreshCcw size={16} />,
  // NFTokenCreateOffer: {
  //   send: <CircleArrowOutUpRight size={16} />,
  //   receive: <CircleArrowOutDownLeft size={16} />,
  // },
};

const hexToString = (hex: string): string => {
  // Remove any '0x' prefix if present
  hex = hex.replace("0x", "");

  // Convert hex to ASCII string
  let str = "";
  for (let i = 0; i < hex.length; i += 2) {
    const charCode = parseInt(hex.substr(i, 2), 16);
    // Only include printable ASCII characters
    if (charCode >= 32 && charCode <= 126) {
      str += String.fromCharCode(charCode);
    }
  }
  return str.trim();
};

export const Transactions = () => {
  const { transactions, isLoading, error } = useTransactions(undefined);
  // const [page, setPage] = useState(1);
  // const pageSize = 20;
  // const router = useRouter();
  const isDesktop = useMediaQuery({ minWidth: 768 });
  if (isLoading) return <TransactionsSkeleton />;

  if (error) {
    return <EmptyState icon={<HandCoins size={18} />} label="Failed to fetch transactions" />;
  }

  if (transactions?.length === 0 || !transactions) {
    return <EmptyState icon={<HandCoins size={18} />} label="No transactions found" />;
  }

  const formatLabel = (tx: Transaction) => {
    const getCurrency = (amount: Amount) => {
      if (typeof amount === "string") return "XRP";
      if (typeof amount === "object") {
        return amount.currency.length === 40 ? hexToString(amount.currency) : amount.currency;
      }
      return "";
    };

    if (tx.direction === "receive") {
      return `Received ${getCurrency(tx.amountDelivered as Amount)}`;
    }
    if (tx.direction === "send") {
      return `Sent ${getCurrency(tx.amountDelivered as Amount)}`;
    }
    if (tx.direction === "swap") {
      const fromCurrency =
        typeof tx.takerGets === "object"
          ? tx.takerGets.currency.length === 40
            ? hexToString(tx.takerGets.currency)
            : tx.takerGets.currency
          : "XRP";
      const toCurrency =
        typeof tx.takerPays === "object"
          ? tx.takerPays.currency.length === 40
            ? hexToString(tx.takerPays.currency)
            : tx.takerPays.currency
          : "XRP";
      return `Swapped ${fromCurrency} for ${toCurrency}`;
    }
  };

  const formatAmount = (tx: Transaction) => {
    if (typeof tx.amountDelivered === "string") {
      return {
        value: (Number(tx.amountDelivered) / 1_000_000).toLocaleString("en-us", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
        currency: "XRP",
      };
    }

    if (typeof tx.amountDelivered === "object") {
      const currency =
        tx.amountDelivered.currency.length === 40
          ? hexToString(tx.amountDelivered.currency)
          : tx.amountDelivered.currency;

      return {
        value: Number(tx.amountDelivered.value).toLocaleString("en-us", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
        currency,
      };
    }

    // Handle swap case
    const currency =
      typeof tx.takerPays === "object"
        ? tx.takerPays.currency.length === 40
          ? hexToString(tx.takerPays.currency)
          : tx.takerPays.currency
        : "";

    return {
      value:
        typeof tx.takerPays === "object"
          ? Number(tx.takerPays.value).toLocaleString("en-us", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          : (Number(tx.takerPays) / 1_000_000).toLocaleString("en-us", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }),
      currency,
    };
  };

  const formatDate = (timestamp: number) => {
    return format(new Date((timestamp + 946684800) * 1000), "MMM d, yyyy h:mm a");
  };

  return (
    <ScrollArea className={cn("h-[245px]", isDesktop ? "h-[245px]" : "h-[300px]")}>
      <div className="space-y-1.5">
        {transactions.map((tx: Transaction) => (
          <div key={tx.hash}>
            <a href={`https://xrpscan.com/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer">
              <Card className="cursor-pointer p-0 transition-all hover:bg-secondary/70">
                <div className="flex items-center justify-between px-3 py-2.5">
                  <div className="flex items-center space-x-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary">
                      {iconMap[tx.direction]}
                    </div>
                    <div>
                      <p className="text-[13px]">{formatLabel(tx)}</p>
                      <p className="text-xs text-muted-foreground">
                        {tx.date ? formatDate(tx.date) : "No date available"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-right text-xs">
                      {tx.direction === "receive" || tx.direction === "swap" ? "+" : "-"}
                      {formatAmount(tx).value}
                    </p>
                  </div>
                </div>
              </Card>
            </a>
          </div>
        ))}
      </div>
    </ScrollArea>
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
