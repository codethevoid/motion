"use client";

import { formatCurrency } from "@/utils/format-currency";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ExternalLink, Loader } from "lucide-react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useState, useEffect } from "react";
import { useHolders } from "@/hooks/use-holders";
import type { Holder } from "@/hooks/use-holders";

export const Holders = ({ currency, issuer }: { currency: string; issuer: string }) => {
  const { data, isLoading } = useHolders(currency, issuer);
  const [holders, setHolders] = useState<Holder[]>([]);
  const [parent] = useAutoAnimate();

  useEffect(() => {
    if (data) {
      setHolders(data);
    }
  }, [data]);

  return (
    <div>
      <div className="flex rounded-md border bg-secondary/40 px-2.5 py-1.5">
        <div className="w-12 max-lg:hidden">
          <p className="text-[11px] font-medium uppercase text-muted-foreground">Rank</p>
        </div>
        <div className="max-w-32 flex-1 max-md:min-w-24 max-md:max-w-none">
          <p className="text-[11px] font-medium uppercase text-muted-foreground">Wallet</p>
        </div>
        <div className="max-w-24 flex-1 max-md:max-w-none">
          <p className="text-[11px] font-medium uppercase text-muted-foreground">Share</p>
        </div>
        <div className="min-w-32 flex-1 max-sm:min-w-28">
          <p className="text-[11px] font-medium uppercase text-muted-foreground">
            {formatCurrency(currency)}
          </p>
        </div>
        <div className="flex-1 max-sm:hidden">
          <p className="text-[11px] font-medium uppercase text-muted-foreground">Value</p>
        </div>
        <div className="w-6">
          <p className="text-right text-[11px] font-medium uppercase text-muted-foreground">Exp</p>
        </div>
      </div>

      {isLoading && !data ? (
        <div className="flex h-96 items-center justify-center">
          <Loader className="size-4 animate-spin" />
        </div>
      ) : (
        <ScrollArea className="h-96">
          <div ref={parent}>
            {holders?.map((holder, index) => (
              <div
                key={holder.wallet}
                className={cn("flex rounded-sm px-2.5 py-1", index % 2 !== 0 && "bg-secondary/40")}
              >
                <div className="w-12 max-lg:hidden">
                  <p className="text-xs text-muted-foreground">{index + 1}</p>
                </div>
                <div className={cn("max-w-32 flex-1 max-md:min-w-24 max-md:max-w-none")}>
                  <p className="text-xs text-muted-foreground max-sm:text-[11px]">
                    {holder.wallet.slice(0, 4)}...{holder.wallet.slice(-4)}
                  </p>
                </div>
                <div className="max-w-24 flex-1 max-md:max-w-none">
                  <p
                    className={cn(
                      "relative top-[1px] font-mono text-[10.5px] tabular-nums tracking-tight",
                    )}
                  >
                    {holder.percent.toFixed(2)}%
                  </p>
                </div>
                <div className="min-w-32 flex-1 max-sm:min-w-28">
                  <p
                    className={cn(
                      "relative top-[1px] font-mono text-[10.5px] tabular-nums tracking-tight",
                    )}
                  >
                    {holder.balance.toLocaleString("en-us", {
                      maximumFractionDigits: 0,
                    })}
                  </p>
                </div>
                <div className="flex-1 max-sm:hidden">
                  <p
                    className={cn(
                      "relative top-[1px] font-mono text-[10.5px] tabular-nums tracking-tight",
                    )}
                  >
                    {holder.value.toLocaleString("en-us", {
                      maximumFractionDigits: 0,
                      style: "currency",
                      currency: "usd",
                    })}
                  </p>
                </div>
                <div className="flex w-6 items-center justify-center">
                  <a
                    href={`https://xrpscan.com/account/${holder.wallet}`}
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
  );
};
