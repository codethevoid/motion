"use client";

import { formatCurrency } from "@/utils/format-currency";
import { useTokenTransactions } from "@/hooks/use-token-transactions";
import { format, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { AccountTxTransaction, dropsToXrp } from "xrpl";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ExternalLink, Loader } from "lucide-react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useState, useEffect } from "react";

export const Transactions = ({ currency, issuer }: { currency: string; issuer: string }) => {
  const [allTransactions, setAllTransactions] = useState<AccountTxTransaction[]>([]);
  const { data, isLoading } = useTokenTransactions(currency, issuer);
  const [parent] = useAutoAnimate();

  // Update allTransactions when new data comes in
  useEffect(() => {
    if (data) {
      setAllTransactions((prev) => {
        // Create a Set of existing transaction hashes
        const existingHashes = new Set(prev.map((tx) => tx.hash));

        // Filter out any transactions we already have
        const newTransactions = data.filter((tx) => !existingHashes.has(tx.hash));

        // Combine existing and new transactions
        return [...newTransactions, ...prev];
      });
    }
  }, [data]);

  const determineDirection = (tx: AccountTxTransaction): "buy" | "sell" => {
    // console.log(tx.tx_json?.TransactionType);
    if (tx.tx_json?.TransactionType === "Payment") {
      // check if Amount is object or string
      if (typeof tx.meta === "object") {
        if (
          typeof tx.meta.delivered_amount === "object" &&
          "currency" in tx.meta.delivered_amount
        ) {
          if (tx.meta.delivered_amount.currency === decodeURIComponent(currency)) {
            return "buy";
          }
        }
      }
    } else if (tx.tx_json?.TransactionType === "OfferCreate") {
      if (typeof tx.tx_json.TakerGets === "object") {
        if (tx.tx_json.TakerGets.currency === decodeURIComponent(currency)) {
          return "sell";
        } else {
          return "buy";
        }
      } else {
        return "buy";
      }
    }

    // Default fallback
    return "buy";
  };

  const getXrpAmount = (tx: AccountTxTransaction) => {
    if (tx.tx_json?.TransactionType === "Payment") {
      if (typeof tx.meta === "object") {
        if (typeof tx.meta.delivered_amount === "string") {
          return dropsToXrp(tx.meta.delivered_amount).toLocaleString("en-us", {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2,
          });
        } else if (typeof tx.tx_json.SendMax === "string") {
          return dropsToXrp(tx.tx_json.SendMax).toLocaleString("en-us", {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2,
          });
        }
      }
    } else if (tx.tx_json?.TransactionType === "OfferCreate") {
      if (typeof tx.tx_json.TakerGets === "string") {
        return dropsToXrp(tx.tx_json.TakerGets).toLocaleString("en-us", {
          maximumFractionDigits: 2,
          minimumFractionDigits: 2,
        });
      } else if (typeof tx.tx_json.TakerPays === "string") {
        return dropsToXrp(tx.tx_json.TakerPays).toLocaleString("en-us", {
          maximumFractionDigits: 2,
          minimumFractionDigits: 2,
        });
      }
    }
  };

  const getTokenAmount = (tx: AccountTxTransaction) => {
    // Check for offers
    if (tx.tx_json?.TransactionType === "OfferCreate") {
      if (typeof tx.tx_json.TakerGets === "object") {
        return Number(tx.tx_json.TakerGets.value).toLocaleString("en-us", {
          maximumFractionDigits: 0,
        });
      } else if (typeof tx.tx_json.TakerPays === "object") {
        return Number(tx.tx_json.TakerPays.value).toLocaleString("en-us", {
          maximumFractionDigits: 0,
        });
      }
    }

    // Handle payments only if delivered amount is an object
    if (tx.tx_json?.TransactionType === "Payment") {
      if (typeof tx.meta === "object") {
        if (typeof tx.meta.delivered_amount === "object") {
          return Number(tx.meta.delivered_amount.value).toLocaleString("en-us", {
            maximumFractionDigits: 0,
          });
        }
      }
    }

    if (typeof tx.meta === "object" && Array.isArray(tx.meta.AffectedNodes)) {
      for (const node of tx.meta.AffectedNodes) {
        const modified =
          "ModifiedNode" in node
            ? node.ModifiedNode
            : "CreatedNode" in node
              ? node.CreatedNode
              : "DeletedNode" in node
                ? node.DeletedNode
                : null;

        if (modified?.LedgerEntryType === "RippleState") {
          if ("FinalFields" in modified && "PreviousFields" in modified) {
            const finalBal = modified.FinalFields?.Balance;
            const prevBal = modified.PreviousFields?.Balance;

            if (
              typeof finalBal === "object" &&
              typeof prevBal === "object" &&
              finalBal &&
              prevBal
            ) {
              if ("value" in finalBal && "value" in prevBal) {
                const diff = Math.abs(Number(finalBal.value) - Number(prevBal.value));
                return diff.toLocaleString("en-us", { maximumFractionDigits: 0 });
              }
            }
          }
        }
      }
    }
  };

  const getWallet = (tx: AccountTxTransaction) => {
    // return the wallet that initiated the transaction
    return tx.tx_json?.Account;
  };

  const getRelativeTime = (tx: AccountTxTransaction) => {
    if (!tx.tx_json?.date) return "";
    return formatDistanceToNow(new Date((tx.tx_json.date + 946684800) * 1000), {
      addSuffix: true,
    })
      .replace("less than a minute ago", "now")
      .replace("about", "")
      .replace(" seconds", "s")
      .replace(" second", "s")
      .replace(" minutes", "m")
      .replace(" minute", "m")
      .replace(" hours", "h")
      .replace(" hour", "h")
      .replace(" days", "d")
      .replace(" day", "d")
      .replace(" months", "mo")
      .replace(" month", "mo")
      .replace(" years", "y")
      .replace(" year", "y");
  };

  return (
    // <Card className="p-4">
    <div>
      <div className="flex rounded-md border bg-secondary/40 px-2.5 py-1.5">
        <div className="flex-1">
          <p className="text-[11px] font-medium uppercase text-muted-foreground">Time</p>
        </div>
        <div className="flex-1 max-md:hidden">
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
        <div className="flex-1 max-sm:hidden">
          <p className="text-[11px] font-medium uppercase text-muted-foreground">Wallet</p>
        </div>
        <div>
          <p className="text-[11px] font-medium uppercase text-muted-foreground">Tx</p>
        </div>
      </div>

      {isLoading && !data ? (
        <div className="flex h-96 items-center justify-center">
          <Loader className="size-4 animate-spin" />
        </div>
      ) : (
        <ScrollArea className="h-96">
          <div ref={parent}>
            {allTransactions.map((tx, index) => (
              <div
                key={tx.hash}
                className={cn("flex rounded-sm px-2.5 py-1", index % 2 !== 0 && "bg-secondary/40")}
              >
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground max-lg:hidden">
                    {tx.tx_json?.date &&
                      format(new Date((tx.tx_json?.date + 946684800) * 1000), "MMM d h:mm a")}
                  </p>
                  <p className="text-xs text-muted-foreground lg:hidden">{getRelativeTime(tx)}</p>
                </div>
                <div className={cn("flex-1 max-md:hidden")}>
                  <p
                    className={cn(
                      "text-xs capitalize",
                      determineDirection(tx) === "sell" ? "text-red-400" : "text-green-400",
                    )}
                  >
                    {determineDirection(tx)}
                  </p>
                </div>
                <div className="flex-1">
                  <p
                    className={cn(
                      "relative top-[1px] font-mono text-[10.5px] tabular-nums tracking-tight",
                      determineDirection(tx) === "sell" ? "text-red-400" : "text-green-400",
                    )}
                  >
                    {getXrpAmount(tx)}
                  </p>
                </div>
                <div className="flex-1">
                  <p
                    className={cn(
                      "relative top-[1px] font-mono text-[10.5px] tabular-nums tracking-tight",
                      determineDirection(tx) === "sell" ? "text-red-400" : "text-green-400",
                    )}
                  >
                    {getTokenAmount(tx)}
                  </p>
                </div>
                <div className="flex-1 max-sm:hidden">
                  <p className="text-xs text-muted-foreground">
                    {getWallet(tx)?.slice(0, 4)}...{getWallet(tx)?.slice(-4)}
                  </p>
                </div>
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
      )}
    </div>
    // </Card>
  );
};
