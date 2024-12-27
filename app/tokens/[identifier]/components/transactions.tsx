"use client";

import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/utils/format-currency";
import { useTokenTransactions } from "@/hooks/use-token-transactions";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { AccountTxTransaction, dropsToXrp } from "xrpl";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ExternalLink } from "lucide-react";
import { useAutoAnimate } from "@formkit/auto-animate/react";

export const Transactions = ({ currency, issuer }: { currency: string; issuer: string }) => {
  const { data, isLoading, error } = useTokenTransactions(currency, issuer);
  console.log(data);
  const [parent] = useAutoAnimate();

  const determineDirection = (tx: AccountTxTransaction): "buy" | "sell" => {
    console.log(tx.tx_json?.TransactionType);
    if (tx.tx_json?.TransactionType === "Payment") {
      // check if Amount is object or string
      if (typeof tx.meta === "object") {
        if (typeof tx.meta.delivered_amount === "object") {
          if (tx.meta.delivered_amount.currency === decodeURIComponent(currency)) {
            return "buy";
          } else {
            return "sell";
          }
        } else {
          return "sell";
        }
      }
    } else if (tx.tx_json?.TransactionType === "OfferCreate") {
      if (typeof tx.tx_json.TakerGets === "object") {
        if (tx.tx_json.TakerGets.currency === decodeURIComponent(currency)) {
          return "buy";
        } else {
          return "sell";
        }
      } else {
        return "sell";
      }
    }

    // Default fallback
    return "buy";
  };

  const getXrpAmount = (tx: AccountTxTransaction) => {
    if (tx.tx_json?.TransactionType === "Payment") {
      if (typeof tx.meta === "object") {
        if (typeof tx.meta.delivered_amount === "string") {
          return dropsToXrp(tx.meta.delivered_amount).toFixed(2);
        }
      }
    }
  };

  return (
    <Card className="space-y-2 p-4">
      <div className="flex rounded-md border bg-secondary/40 px-3 py-1.5">
        <div className="flex-1">
          <p className="text-[11px] font-medium uppercase text-muted-foreground">Time</p>
        </div>
        <div className="flex-1">
          <p className="text-[11px] font-medium uppercase text-muted-foreground">Type</p>
        </div>
        <div className="flex-1">
          <p className="text-[11px] font-medium uppercase text-muted-foreground">XRP</p>
        </div>
        {/* <div className="flex-1">
          <p className="text-[11px] font-medium uppercase text-muted-foreground">USD</p>
        </div> */}
        <div className="flex-1">
          <p className="text-[11px] font-medium uppercase text-muted-foreground">
            {formatCurrency(currency)}
          </p>
        </div>
        <div className="flex-1">
          <p className="text-[11px] font-medium uppercase text-muted-foreground">Wallet</p>
        </div>
        <div>
          <p className="text-[11px] font-medium uppercase text-muted-foreground">Tx</p>
        </div>
      </div>

      <ScrollArea className="h-96">
        <div ref={parent}>
          {data?.map((tx, index) => (
            <div
              key={tx.hash}
              className={cn("flex rounded-sm px-2 py-1", index % 2 !== 0 && "bg-secondary/40")}
            >
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">
                  {tx.tx_json?.date &&
                    format(new Date((tx.tx_json?.date + 946684800) * 1000), "MMM d, h:mm a")}
                </p>
              </div>
              <div
                className={cn(
                  "flex-1 text-xs capitalize",
                  determineDirection(tx) === "sell" ? "text-red-400" : "text-green-400",
                )}
              >
                {determineDirection(tx)}
              </div>
              <div className="flex-1 text-xs">{getXrpAmount(tx)}</div>
              <div className="flex-1 text-xs">f</div>
              <div className="flex-1 text-xs">f</div>
              <div className="flex w-4 items-center">
                <a
                  href={`https://xrpscan.com/tx/${tx.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="size-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};
