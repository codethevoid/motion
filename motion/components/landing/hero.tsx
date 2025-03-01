"use client";

import { GradientBadge } from "@/components/ui/gradient-badge";
import { useWalletActions } from "../wallet/context";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Search } from "lucide-react";
import { useTokenMetrics } from "@/hooks/use-token-metrics";
import { Skeleton } from "../ui/skeleton";
import { LineChart } from "../charts/line";
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";
import { formatCurrency } from "@/utils/format-currency";
import AnimatedGridPattern from "../ui/animated-grid-pattern";
import NextLink from "next/link";
import { RainbowButton } from "../ui/rainbow-button";
import { TokenIcon } from "../ui/custom/token-icon";

export const Hero = () => {
  const { isOpen, setIsOpen } = useWalletActions();
  const { data: tokenData, isLoading } = useTokenMetrics(
    "504944474E000000000000000000000000000000", // currency
    "rhxmPqZGPeHTW684vbf1HAMsHff8RTDfWn", // issuer
  );

  return (
    <div className="relative mx-auto w-full max-w-screen-lg space-y-8 overflow-hidden rounded-2xl border border-border/80 bg-secondary/5 px-4 py-10 max-sm:rounded-none max-sm:border-0 max-sm:border-b max-sm:pb-16 max-sm:pt-4">
      {/* <ParticlesBg /> */}
      <AnimatedGridPattern
        numSquares={30}
        maxOpacity={0.1}
        duration={3}
        className={cn(
          "z-[-1] [mask-image:radial-gradient(600px_circle_at_center,black,transparent)]",
          "inset-x-0 inset-y-[-30%] h-[200%]",
        )}
      />
      <div className="w-full space-y-6">
        <GradientBadge
          text="Self-custody wallet"
          onClick={() => setIsOpen(!isOpen)}
          className="cursor-pointer"
        />
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-center text-4xl font-bold max-sm:text-2xl max-sm:tracking-tight">
              Your gateway to the XRP Ledger
            </h1>
            <p className="mx-auto max-w-lg text-center text-muted-foreground max-sm:max-w-xs max-sm:text-sm">
              Connect directly to the XRP Ledger. Send, receive, and explore a world of
              decentralized possibilities with full control of your assets.
            </p>
          </div>
          <div className="flex justify-center gap-4 max-sm:flex-col max-sm:gap-3">
            <NextLink href="/launch" className="w-full max-w-[220px] max-sm:max-w-none">
              <RainbowButton className="h-10 w-full px-8 transition-[scale_300ms] ease-in-out hover:scale-[1.02]">
                Launch token
              </RainbowButton>
            </NextLink>
            <NextLink href="/tokens" className="w-full max-w-[220px] max-sm:max-w-none">
              <RainbowButton className="h-10 w-full max-w-[220px] px-8 text-foreground transition-[scale_300ms] ease-in-out hover:scale-[1.02] dark:bg-[linear-gradient(#121213,#121213),linear-gradient(#121213_50%,rgba(18,18,19,0.6)_80%,rgba(18,18,19,0)),linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))] max-sm:max-w-none">
                Start trading
              </RainbowButton>
            </NextLink>
          </div>
        </div>
      </div>
      <Card className="mx-auto w-full max-w-md space-y-2 p-2.5 backdrop-blur-sm">
        <Button
          className="w-full justify-start px-3 text-muted-foreground hover:bg-background/40"
          variant="outline"
          asChild
        >
          <NextLink href="/tokens">
            <Search className="size-4" />
            <span>Search for a token...</span>
          </NextLink>
        </Button>
        <NextLink
          href="/tokens/504944474E000000000000000000000000000000:rhxmPqZGPeHTW684vbf1HAMsHff8RTDfWn"
          className="flex items-center justify-between rounded-md border bg-background px-3 py-2"
        >
          <div className="flex items-center space-x-2.5">
            {isLoading ? (
              <Skeleton className="size-9 rounded-full" />
            ) : (
              <TokenIcon
                url={`https://cdn.motion.zip/icons/${tokenData?.currency}/${tokenData?.issuer}`}
                fallback={
                  tokenData?.meta.token.icon && !tokenData.meta.token.icon.includes("null")
                    ? tokenData.meta.token.icon
                    : undefined
                }
                alt={tokenData?.meta.token.name || formatCurrency(tokenData?.currency as string)}
                className="size-9 rounded-full object-cover"
              />
            )}
            <div>
              {tokenData ? (
                <>
                  <p className="text-[13px]">
                    {tokenData?.meta.token.name
                      ? tokenData?.meta.token.name
                      : formatCurrency(tokenData?.currency as string)}
                  </p>
                  <p className="font-mono text-xs text-muted-foreground">
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
                  <p
                    // href={`https://xrpscan.com/account/${tokenData.issuer}`}
                    // target="_blank"
                    // rel="noopener noreferrer"
                    className="text-right text-xs text-muted-foreground"
                  >
                    <span className="flex items-center space-x-1">
                      <span>
                        {tokenData.issuer.slice(0, 6)}...{tokenData.issuer.slice(-4)}
                      </span>
                      <ExternalLink className="size-3" />
                    </span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-end space-y-0.5">
                <Skeleton className="h-4 w-20 rounded-sm" />
                <Skeleton className="h-4 w-24 rounded-sm" />
              </div>
            )}
          </div>
        </NextLink>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-0.5 rounded-md border bg-background px-3 py-2">
            <p className="text-center text-xs text-muted-foreground">Price in USD</p>
            {tokenData ? (
              <p className="text-center text-[13px]">
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
                  maximumFractionDigits: 6,
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
        {/* <div className="grid grid-cols-3 gap-2">
          <div className="space-y-0.5 rounded-md border bg-background px-3 py-2">
            <p className="text-center text-xs text-muted-foreground">Market cap</p>
            {tokenData ? (
              <p className="text-center text-[13px]">
                {formatBigNum(Number(tokenData.metrics.marketcap) * tokenData.xrpValueInUsd)}
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
            <p className="text-center text-xs text-muted-foreground">24h change</p>
            {tokenData ? (
              <p
                className={cn(
                  "text-center text-[13px]",
                  tokenData.metrics.changes["24h"].price.percent > 0
                    ? "text-green-500"
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
        </div> */}
        <div className="h-[260px] w-full rounded-md border bg-background p-3 max-md:h-[220px]">
          {/* <CandleChart candlesticks={tokenData?.candlesticks || []} /> */}
          <LineChart
            currency="504944474E000000000000000000000000000000"
            issuer="rhxmPqZGPeHTW684vbf1HAMsHff8RTDfWn"
            range="1d"
          />
        </div>
      </Card>
    </div>
  );
};
