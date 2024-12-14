"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowUpDown, ChevronDown } from "lucide-react";
import { coinData } from "@/lib/coin-data/data";
import { useEffect, useState } from "react";
import NextImage from "next/image";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTokenOptions } from "@/hooks/use-token-options";
import type { Token } from "@/hooks/use-token-options";
import { xrpMeta } from "@/lib/xrp/meta";
import { TokenSelector } from "./components/token-selector";

export const SwapClient = () => {
  const [from, setFrom] = useState<Token | null>(xrpMeta);
  const [to, setTo] = useState<Token | null>(null);
  const [fromValue, setFromValue] = useState<number>(0);
  const [toValue, setToValue] = useState<number>(0);
  const [isTokenSelectorOpen, setIsTokenSelectorOpen] = useState<boolean>(false);
  const [isSelectingFor, setIsSelectingFor] = useState<"from" | "to">("from");

  return (
    <>
      <div className="mx-auto max-w-md space-y-1.5 pt-20">
        <div className="relative">
          <div className="space-y-1.5">
            <Card className="space-y-1 p-4">
              <p className="text-sm text-muted-foreground">From</p>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="0.00"
                  type="number"
                  min="0"
                  step="any"
                  className="h-10 border-none pl-0 !text-2xl font-bold shadow-none focus-visible:ring-0"
                  onChange={(e) => setFromValue(Number(e.target.value))}
                />
                <Button
                  size="sm"
                  variant="secondary"
                  className="shrink-0 rounded-full px-2"
                  onClick={() => {
                    setIsSelectingFor("from");
                    setIsTokenSelectorOpen(true);
                  }}
                >
                  {from?.icon ? (
                    <img
                      src={from.icon}
                      alt={from.currency}
                      width={32}
                      height={32}
                      className="size-4 rounded-full"
                    />
                  ) : (
                    <div className="size-4 rounded-full bg-muted" />
                  )}
                  {from?.currency} <ChevronDown size={12} />
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">$0.00</p>
                <p className="text-sm text-muted-foreground">
                  <span className="text-foreground">{200}</span> available
                </p>
              </div>
            </Card>
            <Card className="space-y-1 rounded-2xl p-4">
              <p className="text-sm text-muted-foreground">To</p>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="0.00"
                  type="number"
                  min="0"
                  step="any"
                  className="h-10 border-none pl-0 !text-2xl font-bold shadow-none focus-visible:ring-0"
                  onChange={(e) => setToValue(Number(e.target.value))}
                />
                <Button
                  size="sm"
                  variant="secondary"
                  className="shrink-0 rounded-full px-2"
                  onClick={() => {
                    setIsSelectingFor("to");
                    setIsTokenSelectorOpen(true);
                  }}
                >
                  {!to ? (
                    "Select token"
                  ) : to?.icon ? (
                    <img
                      src={to.icon}
                      alt={to.currency}
                      width={32}
                      height={32}
                      className="size-4 rounded-full"
                    />
                  ) : (
                    <div className="size-4 rounded-full bg-muted" />
                  )}
                  {to?.currency} <ChevronDown size={12} />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">$0.00</p>
            </Card>
          </div>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl bg-background p-1">
            <Button
              size="icon"
              variant="secondary"
              className="size-8"
              onClick={() => {
                setFrom(to);
                setTo(from);
              }}
            >
              <ArrowUpDown size={16} />
            </Button>
          </div>
        </div>
        <Button className="h-14 w-full rounded-2xl" size="lg" disabled>
          Swap
        </Button>
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1" className="rounded-2xl border-b-0">
            <AccordionTrigger className="p-1 text-[13px] text-muted-foreground hover:no-underline">
              1 XRP = 150,000 SOLO
            </AccordionTrigger>
            <AccordionContent className="p-1">
              <LineItem label="Rate" value={`1 XRP = 150,000 SOLO`} />
              <LineItem label="Swap fee (1.0%)" value={`$30.00`} />
              <LineItem label="Network cost" value={`0.00001 XRP`} />
              <LineItem label="Slippage" value={`5%`} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      <TokenSelector
        isOpen={isTokenSelectorOpen}
        setIsOpen={setIsTokenSelectorOpen}
        selectingFor={isSelectingFor}
        setFrom={setFrom}
        setTo={setTo}
      />
    </>
  );
};

const LineItem = ({ label, value }: { label: string; value: string }) => {
  return (
    <div className="flex items-center justify-between">
      <p className="text-[13px] text-muted-foreground">{label}</p>
      <p className="text-[13px] text-muted-foreground">
        <span className="text-foreground">{value}</span>
      </p>
    </div>
  );
};
