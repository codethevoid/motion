"use client";

import { Card } from "@/components/ui/card";
import { useTokenMetrics } from "@/hooks/use-token-metrics";
import { Skeleton } from "@/components/ui/skeleton";
import { Coin } from "@/components/ui/icons/coin";
import { formatCurrency } from "@/utils/format-currency";
import { ExternalLink } from "lucide-react";
import { formatBigNum } from "@/utils/format-big-num";
import { cn } from "@/lib/utils";

export const Metrics = ({ currency, issuer }: { currency: string; issuer: string }) => {
  const { data: tokenData, isLoading } = useTokenMetrics(currency, issuer);

  return (
    <Card className="space-y-1.5 p-4">
      <div className="flex items-center justify-between rounded-md border bg-background px-3 py-2">
        <div className="flex items-center space-x-2.5">
          {isLoading ? (
            <Skeleton className="size-9 rounded-full" />
          ) : tokenData?.meta.token.icon ? (
            <img
              src={tokenData?.meta.token.icon}
              alt={tokenData?.meta.token.name}
              className="size-9 rounded-md"
            />
          ) : (
            <div className="flex size-9 items-center justify-center rounded-full border bg-secondary/80 dark:bg-secondary/40">
              <Coin />
            </div>
          )}
          <div>
            {tokenData ? (
              <>
                <p className="text-[13px]">
                  {tokenData?.meta.token.name
                    ? tokenData?.meta.token.name
                    : formatCurrency(tokenData?.currency as string)}
                </p>
                <p className="font-mono text-xs tracking-tight text-muted-foreground">
                  {formatCurrency(tokenData?.currency as string)}
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
            <div className="space-y-0.5">
              <p className="text-right font-mono text-xs">
                {formatCurrency(tokenData.currency)}/XRP
              </p>
              <div>
                <a
                  href={`https://xrpscan.com/account/${tokenData.issuer}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-right text-xs text-muted-foreground hover:text-foreground hover:underline"
                >
                  <span className="flex items-center justify-end space-x-1">
                    <span>
                      {tokenData.issuer.slice(0, 6)}...{tokenData.issuer.slice(-4)}
                    </span>
                    <ExternalLink className="size-3" />
                  </span>
                </a>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-end space-y-0.5">
              <Skeleton className="h-4 w-20 rounded-sm" />
              <Skeleton className="h-4 w-24 rounded-sm" />
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        <div className="space-y-0.5 rounded-md border bg-background px-3 py-2">
          <p className="text-center text-xs text-muted-foreground">Price in USD</p>
          {tokenData ? (
            <p className="text-center text-[13px]">
              {(Number(tokenData.metrics.price) * tokenData.xrpValueInUsd).toLocaleString("en-us", {
                style: "currency",
                currency: "usd",
                minimumFractionDigits: 2,
                maximumFractionDigits:
                  Number(tokenData.metrics.price) * tokenData.xrpValueInUsd > 1
                    ? 2
                    : Number(tokenData.metrics.price) * tokenData.xrpValueInUsd > 0.000001
                      ? 6
                      : 8,
              })}{" "}
              USD
            </p>
          ) : (
            <div className="flex h-[19.5px] items-center">
              <Skeleton className="mx-auto h-4 w-24 rounded-sm" />
            </div>
          )}
        </div>
        <div className="space-y-0.5 rounded-md border bg-background px-3 py-2">
          <p className="text-center text-xs text-muted-foreground">Price in XRP</p>
          {tokenData ? (
            <p className="text-center text-[13px]">
              {Number(tokenData.metrics.price).toLocaleString("en-us", {
                minimumFractionDigits: 2,
                maximumFractionDigits:
                  Number(tokenData.metrics.price) * tokenData.xrpValueInUsd > 1
                    ? 2
                    : Number(tokenData.metrics.price) * tokenData.xrpValueInUsd > 0.000001
                      ? 6
                      : 8,
              })}{" "}
              XRP
            </p>
          ) : (
            <div className="flex h-[19.5px] items-center">
              <Skeleton className="mx-auto h-4 w-24 rounded-sm" />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        <div className="space-y-0.5 rounded-md border bg-background px-3 py-2">
          <p className="text-center text-xs text-muted-foreground">24h</p>
          {tokenData ? (
            <p
              className={cn(
                "text-center text-[13px]",
                tokenData.metrics.changes["24h"].price.percent > 0
                  ? "text-green-500"
                  : tokenData.metrics.changes["24h"].price.percent === 0
                    ? "text-foreground"
                    : "text-red-500",
              )}
            >
              {tokenData.metrics.changes["24h"].price.percent.toFixed(2)}%
            </p>
          ) : (
            <div className="flex h-[19.5px] items-center">
              <Skeleton className="mx-auto h-4 w-20 rounded-sm" />
            </div>
          )}
        </div>
        <div className="space-y-0.5 rounded-md border bg-background px-3 py-2">
          <p className="text-center text-xs text-muted-foreground">7d</p>
          {tokenData ? (
            <p
              className={cn(
                "text-center text-[13px]",
                tokenData.metrics.changes["7d"].price.percent > 0
                  ? "text-green-500"
                  : tokenData.metrics.changes["7d"].price.percent === 0
                    ? "text-foreground"
                    : "text-red-500",
              )}
            >
              {tokenData.metrics.changes["7d"].price.percent.toFixed(2)}%
            </p>
          ) : (
            <div className="flex h-[19.5px] items-center">
              <Skeleton className="mx-auto h-4 w-20 rounded-sm" />
            </div>
          )}
        </div>
        <div className="space-y-0.5 rounded-md border bg-background px-3 py-2">
          <p className="text-center text-xs text-muted-foreground">24h XRP vol</p>
          {tokenData ? (
            <p className="text-center text-[13px]">
              {formatBigNum(Number(tokenData.metrics.volume_24h))}
            </p>
          ) : (
            <div className="flex h-[19.5px] items-center">
              <Skeleton className="mx-auto h-4 w-20 rounded-sm" />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        <div className="space-y-0.5 rounded-md border bg-background px-3 py-2">
          <p className="text-center text-xs text-muted-foreground">Market cap</p>
          {tokenData ? (
            <p className="text-center text-[13px]">
              ${formatBigNum(Number(tokenData.metrics.marketcap) * tokenData.xrpValueInUsd)}
            </p>
          ) : (
            <div className="flex h-[19.5px] items-center">
              <Skeleton className="mx-auto h-4 w-20 rounded-sm" />
            </div>
          )}
        </div>
        <div className="space-y-0.5 rounded-md border bg-background px-3 py-2">
          <p className="text-center text-xs text-muted-foreground">Holders</p>
          {tokenData ? (
            <p className="text-center text-[13px]">
              {formatBigNum(Number(tokenData.metrics.holders))}
            </p>
          ) : (
            <div className="flex h-[19.5px] items-center">
              <Skeleton className="mx-auto h-4 w-20 rounded-sm" />
            </div>
          )}
        </div>
        <div className="space-y-0.5 rounded-md border bg-background px-3 py-2">
          <p className="text-center text-xs text-muted-foreground">Supply</p>
          {tokenData ? (
            <p className="text-center text-[13px]">
              {formatBigNum(Number(tokenData.metrics.supply))}
            </p>
          ) : (
            <div className="flex h-[19.5px] items-center">
              <Skeleton className="mx-auto h-4 w-20 rounded-sm" />
            </div>
          )}
        </div>
      </div>
      {/* <div>
        <p className="text-xs text-muted-foreground">{tokenData?.meta.token.description}</p>
      </div> */}
    </Card>
  );
};
