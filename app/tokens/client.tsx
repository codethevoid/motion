"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useTokens } from "@/hooks/use-tokens";
import { formatCurrency } from "@/utils/format-currency";
import { cn } from "@/lib/utils";
import { Coin } from "@/components/ui/icons/coin";
import { useXrpPrice } from "@/hooks/use-xrp-price";
import NextLink from "next/link";
import { formatBigNum } from "@/utils/format-big-num";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination";

export const TokensClient = () => {
  const [name, setName] = useState("");
  const [page, setPage] = useState(0);
  const { data, isLoading } = useTokens(name, page);
  const { data: xrpPrice } = useXrpPrice();
  const [total, setTotal] = useState(0);
  const pageSize = 100;
  console.log(total);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [previousData, setPreviousData] = useState(data);

  useEffect(() => {
    if (!data) return;
    setTotal(data?.total || 0);
  }, [data]);

  useEffect(() => {
    if (data) {
      setPreviousData(data);
      setIsInitialLoad(false);
    }
  }, [data]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPage(0);
    setName(e.target.value);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  return (
    <>
      <div className="space-y-6 border-b px-4 pb-32">
        <div className="space-y-2">
          <h1 className="text-center text-4xl font-bold max-sm:text-2xl max-sm:tracking-tight">
            Explore XRP Ledger Tokens
          </h1>
          <p className="mx-auto max-w-lg text-center text-muted-foreground max-sm:max-w-xs max-sm:text-sm">
            Explore the XRP Ledger&apos;s diverse ecosystem of tokens. Discover unique assets,
            decentralized applications, and more.
          </p>
        </div>
        <div className="relative mx-auto max-w-md rounded-md shadow-xl shadow-primary/20">
          <Input
            placeholder="Search for a token"
            className="h-10 bg-background pl-9"
            onChange={handleNameChange}
            value={name}
          />
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>
      <div className="relative -top-20 -mb-20 px-4">
        <div className="mx-auto max-w-screen-lg">
          <Card className="p-4 dark:bg-zinc-950">
            <div className="flex rounded-md border bg-secondary/40 px-3 py-1.5">
              <div className="min-w-[160px] flex-1">
                <p className="text-[11px] font-medium uppercase text-muted-foreground">Token</p>
              </div>
              <div className="flex-1 max-md:hidden">
                <p className="text-[11px] font-medium uppercase text-muted-foreground">Price</p>
              </div>
              <div className="flex-1">
                <p className="text-[11px] font-medium uppercase text-muted-foreground">
                  Market cap
                </p>
              </div>

              <div className="flex-1 max-[900px]:hidden">
                <p className="text-[11px] font-medium uppercase text-muted-foreground">Holders</p>
              </div>
              <div className="flex-1 max-sm:w-16 max-sm:flex-none">
                <p className="text-[11px] font-medium uppercase text-muted-foreground max-sm:text-right">
                  24h
                </p>
              </div>
              <div className="w-24 max-sm:hidden">
                <p className="text-right text-[11px] font-medium uppercase text-muted-foreground">
                  24h vol
                </p>
              </div>
            </div>
            {isInitialLoad && isLoading ? (
              <TokensSkeleton />
            ) : data?.tokens?.length === 0 && name ? (
              <div className="flex h-96 items-center justify-center">
                <p className="text-center text-sm text-muted-foreground">
                  No tokens found for &quot;{name}&quot;
                </p>
              </div>
            ) : (
              (isLoading ? previousData?.tokens : data?.tokens)?.map((token, i) => (
                <NextLink
                  key={`${token.currency}-${token.issuer}`}
                  href={`/tokens/${token.currency}:${token.issuer}`}
                  className={cn(isLoading && "pointer-events-none animate-pulse")}
                >
                  <div
                    className={cn(
                      "flex items-center px-3 py-2 transition-colors hover:bg-secondary/20",
                      i !== 0 && "border-t border-border/80",
                    )}
                  >
                    <div className="flex min-w-[160px] flex-1 items-center space-x-2.5">
                      {token.meta.token.icon && !token.meta.token.icon.includes("null") ? (
                        <img
                          src={token.meta.token.icon}
                          alt={token.meta.token.name}
                          className="size-8 rounded-full"
                        />
                      ) : (
                        <div className="flex size-8 items-center justify-center rounded-full bg-secondary/40">
                          <Coin />
                        </div>
                      )}
                      <div>
                        <p className="font-mono text-xs tracking-tight">
                          {formatCurrency(token.currency)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {token.issuer.slice(0, 6)}...{token.issuer.slice(-4)}
                        </p>
                      </div>
                    </div>

                    <div className="flex-1 max-md:hidden">
                      <div>
                        <p className="text-[13px]">
                          {xrpPrice
                            ? (xrpPrice * Number(token.metrics.price)).toLocaleString("en-us", {
                                style: "currency",
                                currency: "usd",
                                minimumFractionDigits: 2,
                                maximumFractionDigits:
                                  Number(token.metrics.price) * xrpPrice > 1
                                    ? 2
                                    : Number(token.metrics.price) * xrpPrice > 0.000001
                                      ? 6
                                      : 8,
                              })
                            : ""}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {xrpPrice
                            ? Number(token.metrics.price).toLocaleString("en-us", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits:
                                  Number(token.metrics.price) * xrpPrice > 1
                                    ? 2
                                    : Number(token.metrics.price) * xrpPrice > 0.000001
                                      ? 6
                                      : 8,
                              })
                            : ""}{" "}
                          XRP
                        </p>
                      </div>
                    </div>
                    <div className="flex-1">
                      {xrpPrice ? (
                        <p className="text-[13px]">
                          ${formatBigNum(Number(token.metrics.marketcap) * xrpPrice)}
                        </p>
                      ) : (
                        ""
                      )}
                    </div>
                    <div className="flex-1 max-[900px]:hidden">
                      <p className="text-[13px]">
                        {formatBigNum(Number(token.metrics.holders), true)}
                      </p>
                    </div>
                    <div className="flex-1 max-sm:w-16 max-sm:flex-none">
                      <p
                        className={cn(
                          "text-[13px] max-sm:text-right",
                          token.metrics.changes["24h"].price.percent > 0
                            ? "text-green-500"
                            : token.metrics.changes["24h"].price.percent === 0
                              ? "text-muted-foreground"
                              : "text-red-500",
                        )}
                      >
                        {token.metrics.changes["24h"].price.percent.toLocaleString("en-us", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                        %
                      </p>
                    </div>
                    <div className="w-24 max-sm:hidden">
                      <p className="text-right text-[13px]">
                        {formatBigNum(Number(token.metrics.volume_24h))} XRP
                      </p>
                    </div>
                  </div>
                </NextLink>
              ))
            )}
          </Card>
          {data?.tokens && data?.tokens?.length > 0 && (
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="size-8"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 0}
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                </PaginationItem>
                {Array.from({ length: Math.min(5, Math.ceil(total / pageSize)) }).map(
                  (_, index) => (
                    <PaginationItem key={index}>
                      <Button
                        className="size-8 text-xs"
                        variant={page === index ? "default" : "secondary"}
                        size="icon"
                        onClick={() => setPage(index)}
                      >
                        {index + 1}
                      </Button>
                    </PaginationItem>
                  ),
                )}
                <PaginationItem>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="size-8"
                    onClick={() => setPage(page + 1)}
                    disabled={page === Math.min(4, Math.ceil(total / pageSize) - 1)}
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </div>
    </>
  );
};

const TokensSkeleton = () => {
  return (
    <div>
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "flex h-[51.5px] items-center px-3 py-2 max-md:h-[48px]",
            i !== 0 && "border-t border-border/80",
          )}
        >
          <div className="flex min-w-[160px] flex-1 items-center space-x-2.5">
            <Skeleton className="size-8 rounded-full" />
            <div className="space-y-0.5">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
          <div className="flex-1 max-md:hidden">
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex-1">
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex-1 max-[900px]:hidden">
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex-1 max-sm:w-16 max-sm:flex-none">
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex w-24 justify-end max-sm:hidden">
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
};
