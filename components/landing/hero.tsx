"use client";

import { GradientBadge } from "@/components/ui/gradient-badge";
import { useWalletActions } from "../wallet/context";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Search } from "lucide-react";
import { useTokenMetrics } from "@/hooks/use-token-metrics";
import { Skeleton } from "../ui/skeleton";
import { Coin } from "../ui/icons/coin";

export const Hero = () => {
  const { isOpen, setIsOpen } = useWalletActions();
  const { data: tokenData, isLoading } = useTokenMetrics(
    "4A454C4C59000000000000000000000000000000",
    "rKHsxmaqf2SfcyU9LRi3VyjpAtyg6ZrQMp",
  );

  const getTokenCurrency = (currency: string) => {
    if (currency.length === 40) {
      // convert from hex to string
      return Buffer.from(currency, "hex").toString("utf-8");
    }
    return currency;
  };

  return (
    <div className="w-full space-y-8">
      <div className="w-full space-y-6">
        <GradientBadge
          text="Self-custody wallet"
          onClick={() => setIsOpen(!isOpen)}
          className="cursor-pointer"
        />
        <div className="space-y-2">
          <h1 className="text-center text-4xl font-bold max-sm:text-2xl max-sm:tracking-tight">
            Your gateway to the XRP Ledger
          </h1>
          <p className="mx-auto max-w-lg text-center text-muted-foreground max-sm:max-w-xs max-sm:text-sm">
            Connect directly to the XRP Ledger. Send, receive, and explore a world of decentralized
            possibilities with full control of your assets.
          </p>
        </div>
      </div>
      <Card className="mx-auto w-full max-w-md space-y-2 p-2.5">
        <Button
          className="w-full cursor-text justify-start px-3 text-muted-foreground hover:bg-background hover:text-muted-foreground"
          variant="outline"
        >
          <Search className="size-4" />
          <span>Search for a token...</span>
        </Button>
        <div className="flex items-center justify-between rounded-md border bg-background px-3 py-2">
          <div className="flex items-center space-x-2.5">
            {isLoading ? (
              <Skeleton className="size-10 rounded-full" />
            ) : tokenData?.meta.token.icon ? (
              <img
                src={tokenData?.meta.token.icon}
                alt={tokenData?.meta.token.name}
                className="size-10 rounded-full"
              />
            ) : (
              <div className="flex size-10 items-center justify-center rounded-full border bg-secondary/80 dark:bg-secondary/40">
                <Coin />
              </div>
            )}
            <div>
              {tokenData ? (
                <>
                  <p className="text-[13px]">
                    {tokenData?.meta.token.name
                      ? tokenData?.meta.token.name
                      : getTokenCurrency(tokenData?.currency as string)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ${getTokenCurrency(tokenData?.currency as string)}
                  </p>
                </>
              ) : (
                <div className="space-y-0.5">
                  <Skeleton className="h-4 w-20 rounded-sm" />
                  <Skeleton className="h-4 w-12 rounded-sm" />
                </div>
              )}
            </div>
          </div>
          <div>
            {tokenData ? (
              <>
                <p className="text-right text-[13px]">
                  {Number(tokenData?.metrics.price).toLocaleString("en-us", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 6,
                  })}{" "}
                  XRP
                </p>
                <p className="text-right text-xs text-muted-foreground">
                  {(Number(tokenData.metrics.price) * tokenData.xrpValueInUsd).toLocaleString(
                    "en-us",
                    {
                      style: "currency",
                      currency: "usd",
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 6,
                    },
                  )}{" "}
                  USD
                </p>
              </>
            ) : (
              <div className="flex flex-col items-end space-y-0.5">
                <Skeleton className="h-4 w-20 rounded-sm" />
                <Skeleton className="h-4 w-20 rounded-sm" />
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
