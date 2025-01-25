"use client";

import { LineChart } from "@/components/charts/line";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { formatCurrency } from "@/utils/format-currency";
import { Metrics } from "./components/metrics";
import { Trade } from "./components/trade";
import { About } from "./components/about";
import { Transactions } from "./components/transactions";
import { useTokenMetrics } from "@/hooks/use-token-metrics";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Holders } from "./components/holders";
import { usePathname } from "next/navigation";
import { confettiFireworks } from "@/utils/confetti-fireworks";

// const intervalsMap = {
//   "1h": 1, // 1 second intervals
//   "1d": 60, // 1 minute intervals
//   "1w": 1800, // 30 minute intervals
//   "1m": 3600 * 2, // 2 hour intervals
//   "1y": 3600 * 24, // 1 day intervals
//   all: 3600 * 24 * 30, // 1 month intervals
// } as const;

type Timespan = "1h" | "1d" | "1w" | "1m" | "1y" | "all";

export const TokenClient = ({ identifier }: { identifier: string }) => {
  const decoded = decodeURIComponent(identifier);
  const [currency, issuer] = decoded.split(":");
  const [range, setRange] = useState<Timespan>("1w");
  const [tab, setTab] = useState<"transactions" | "holders">("transactions");
  const { error } = useTokenMetrics(encodeURIComponent(currency), encodeURIComponent(issuer));
  const path = usePathname();

  useEffect(() => {
    if (path?.includes("?confetti=true")) {
      confettiFireworks();
    }
  }, [path]);

  if (error) return <div>An error occurred</div>;

  return (
    <div className="p-4 pb-16">
      <div className="mx-auto flex max-w-screen-lg items-start gap-3">
        <div className="hidden w-full flex-col gap-3 max-[900px]:flex">
          <Metrics currency={encodeURIComponent(currency)} issuer={encodeURIComponent(issuer)} />
          <Card className="space-y-2 overflow-hidden p-4 dark:bg-background">
            <div className="flex justify-between">
              <div>
                <p className="font-mono text-[13px] tracking-tight">{formatCurrency(currency)}</p>
                <p className="text-xs text-muted-foreground">motion.zip</p>
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
          <Trade currency={encodeURIComponent(currency)} issuer={encodeURIComponent(issuer)} />
          <div className="space-y-2">
            <Tabs
              value={tab}
              onValueChange={(value: string) => setTab(value as "transactions" | "holders")}
            >
              <TabsList className="w-full">
                <TabsTrigger value="transactions" className="h-7 w-full text-[13px]">
                  Transactions
                </TabsTrigger>
                <TabsTrigger value="holders" className="h-7 w-full text-[13px]">
                  Top holders
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Card className="p-4 dark:bg-transparent">
              {tab === "transactions" && (
                <Transactions
                  currency={encodeURIComponent(currency)}
                  issuer={encodeURIComponent(issuer)}
                />
              )}
              {tab === "holders" && (
                <Holders
                  currency={encodeURIComponent(currency)}
                  issuer={encodeURIComponent(issuer)}
                />
              )}
            </Card>
          </div>
          {/* <Trade currency={encodeURIComponent(currency)} issuer={encodeURIComponent(issuer)} /> */}
          <About currency={encodeURIComponent(currency)} issuer={encodeURIComponent(issuer)} />
        </div>
        <div className="w-2/3 min-w-0 space-y-3 max-[900px]:hidden">
          <Card className="space-y-2 overflow-hidden p-4 dark:bg-background">
            <div className="flex justify-between">
              <div>
                <p className="font-mono text-[13px] tracking-tight">{formatCurrency(currency)}</p>
                <p className="text-xs text-muted-foreground">motion.zip</p>
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
              {/* <CandleChart
                currency={encodeURIComponent(currency)}
                issuer={encodeURIComponent(issuer)}
                range={range}
              /> */}
            </div>
          </Card>
          <div className="space-y-2">
            {/* <Card className="space-y-2 p-4 dark:bg-transparent"> */}
            <Tabs
              value={tab}
              onValueChange={(value: string) => setTab(value as "transactions" | "holders")}
            >
              <TabsList className="w-full">
                <TabsTrigger value="transactions" className="h-7 w-full text-[13px]">
                  Transactions
                </TabsTrigger>
                <TabsTrigger value="holders" className="h-7 w-full text-[13px]">
                  Top holders
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Card className="p-4 dark:bg-transparent">
              {tab === "transactions" && (
                <Transactions
                  currency={encodeURIComponent(currency)}
                  issuer={encodeURIComponent(issuer)}
                />
              )}
              {tab === "holders" && (
                <Holders
                  currency={encodeURIComponent(currency)}
                  issuer={encodeURIComponent(issuer)}
                />
              )}
            </Card>
          </div>
        </div>
        <div className="flex w-1/3 min-w-[336px] flex-col gap-3 max-[900px]:hidden">
          <Metrics currency={encodeURIComponent(currency)} issuer={encodeURIComponent(issuer)} />
          <Trade currency={encodeURIComponent(currency)} issuer={encodeURIComponent(issuer)} />
          <About currency={encodeURIComponent(currency)} issuer={encodeURIComponent(issuer)} />
        </div>
      </div>
    </div>
  );
};
