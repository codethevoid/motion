"use client";

import { LineChart } from "@/components/charts/line";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { Timespan } from "@/app/api/aggregates/route";
import { formatCurrency } from "@/utils/format-currency";
import { Metrics } from "./components/metrics";
import { Trade } from "./components/trade";
import { About } from "./components/about";
import { Transactions } from "./components/transactions";
import { useTokenMetrics } from "@/hooks/use-token-metrics";
import { notFound } from "next/navigation";

export const TokenClient = ({ identifier }: { identifier: string }) => {
  const decoded = decodeURIComponent(identifier);
  const [currency, issuer] = decoded.split(":");
  const [range, setRange] = useState<Timespan>("1w");
  const { error } = useTokenMetrics(encodeURIComponent(currency), encodeURIComponent(issuer));

  if (error) {
    // means the token and issuer are not valid
    // show a 404 page
    return notFound();
  }

  return (
    <div className="p-4 pb-16">
      <div className="mx-auto flex max-w-screen-lg items-start gap-4">
        <div className="hidden w-full flex-col gap-4 max-[900px]:flex">
          <Metrics currency={encodeURIComponent(currency)} issuer={encodeURIComponent(issuer)} />
          <Card className="space-y-2 overflow-hidden p-4 dark:bg-background">
            <div className="flex justify-between">
              <div>
                <p className="font-mono text-[13px] tracking-tight">{formatCurrency(currency)}</p>
                <p className="text-xs text-muted-foreground">TokenOS</p>
              </div>
              <div className="flex gap-0.5 rounded-xl border border-border/80 bg-secondary/40 p-1">
                <Button
                  variant={range === "1d" ? "default" : "ghost"}
                  className="size-7 text-[12px]"
                  size="icon"
                  onClick={() => setRange("1d")}
                >
                  1d
                </Button>
                <Button
                  variant={range === "1w" ? "default" : "ghost"}
                  className="size-7 text-[12px]"
                  size="icon"
                  onClick={() => setRange("1w")}
                >
                  1w
                </Button>
                <Button
                  variant={range === "1m" ? "default" : "ghost"}
                  className="size-7 text-[12px]"
                  size="icon"
                  onClick={() => setRange("1m")}
                >
                  1m
                </Button>
                <Button
                  variant={range === "1y" ? "default" : "ghost"}
                  className="size-7 text-[12px]"
                  size="icon"
                  onClick={() => setRange("1y")}
                >
                  1y
                </Button>
                <Button
                  variant={range === "all" ? "default" : "ghost"}
                  className="size-7 text-[12px]"
                  size="icon"
                  onClick={() => setRange("all")}
                >
                  All
                </Button>
              </div>
            </div>
            <div className="h-96 max-md:h-72">
              <LineChart
                issuer={encodeURIComponent(issuer)}
                currency={encodeURIComponent(currency)}
                range={range}
              />
            </div>
          </Card>
          <Transactions
            currency={encodeURIComponent(currency)}
            issuer={encodeURIComponent(issuer)}
          />
          <Trade currency={encodeURIComponent(currency)} issuer={encodeURIComponent(issuer)} />
          <About currency={encodeURIComponent(currency)} issuer={encodeURIComponent(issuer)} />
        </div>
        <div className="w-2/3 min-w-0 space-y-4 max-[900px]:hidden">
          <Card className="space-y-2 overflow-hidden p-4 dark:bg-background">
            <div className="flex justify-between">
              <div>
                <p className="font-mono text-[13px] tracking-tight">{formatCurrency(currency)}</p>
                <p className="text-xs text-muted-foreground">TokenOS</p>
              </div>
              <div className="flex gap-0.5 rounded-xl border border-border/80 bg-secondary/40 p-1">
                <Button
                  variant={range === "1d" ? "default" : "ghost"}
                  className="size-7 text-[12px]"
                  size="icon"
                  onClick={() => setRange("1d")}
                >
                  1d
                </Button>
                <Button
                  variant={range === "1w" ? "default" : "ghost"}
                  className="size-7 text-[12px]"
                  size="icon"
                  onClick={() => setRange("1w")}
                >
                  1w
                </Button>
                <Button
                  variant={range === "1m" ? "default" : "ghost"}
                  className="size-7 text-[12px]"
                  size="icon"
                  onClick={() => setRange("1m")}
                >
                  1m
                </Button>
                <Button
                  variant={range === "1y" ? "default" : "ghost"}
                  className="size-7 text-[12px]"
                  size="icon"
                  onClick={() => setRange("1y")}
                >
                  1y
                </Button>
                <Button
                  variant={range === "all" ? "default" : "ghost"}
                  className="size-7 text-[12px]"
                  size="icon"
                  onClick={() => setRange("all")}
                >
                  All
                </Button>
              </div>
            </div>
            <div className="h-96">
              <LineChart
                issuer={encodeURIComponent(issuer)}
                currency={encodeURIComponent(currency)}
                range={range}
              />
            </div>
          </Card>
          <Transactions
            currency={encodeURIComponent(currency)}
            issuer={encodeURIComponent(issuer)}
          />
        </div>
        <div className="flex w-1/3 min-w-[336px] flex-col gap-4 max-[900px]:hidden">
          <Metrics currency={encodeURIComponent(currency)} issuer={encodeURIComponent(issuer)} />
          <Trade currency={encodeURIComponent(currency)} issuer={encodeURIComponent(issuer)} />
          <About currency={encodeURIComponent(currency)} issuer={encodeURIComponent(issuer)} />
        </div>
      </div>
    </div>
  );
};
