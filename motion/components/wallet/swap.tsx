"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowUpDown, ChevronDown, Settings2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { Token } from "@/hooks/use-token-options";
import { xrpMeta } from "@/lib/xrp/meta";
import { TokenSelector } from "./dialogs/token-selector";
import { useBalance } from "@/hooks/use-balance";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { usePrice } from "@/hooks/use-price";
import { FEE_PERCENTAGE } from "@/lib/xrp/constants";
import { useNetworkFee } from "@/hooks/use-network-fee";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { ButtonSpinner } from "@/components/ui/button-spinner";
import { toast } from "sonner";
import { PasswordDialog } from "./dialogs/password-dialog";

export const Swap = () => {
  const [from, setFrom] = useState<Token | null>({ ...xrpMeta, description: "XRP" });
  const [to, setTo] = useState<Token | null>(null);
  const [fromValue, setFromValue] = useState<string>("");
  const [toValue, setToValue] = useState<string>("");
  const [isTokenSelectorOpen, setIsTokenSelectorOpen] = useState<boolean>(false);
  const [isSelectingFor, setIsSelectingFor] = useState<"from" | "to">("from");
  const { balance, isLoading: isLoadingBalance } = useBalance("", "");
  const { price: fromPrice } = usePrice("", "");
  const { price: toPrice } = usePrice("", "");
  const [activeInput, setActiveInput] = useState<"from" | "to">("from");
  const [rate, setRate] = useState<number>(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [slippage, setSlippage] = useState<number>(2); // percentage
  const { data: networkFee } = useNetworkFee();
  const [isSwapping, setIsSwapping] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [isPasswordOpen, setIsPasswordOpen] = useState<boolean>(false);
  const [isMax, setIsMax] = useState<boolean>(false);
  console.log(networkFee);

  useEffect(() => {
    if (fromPrice?.price && fromPrice.price > 0 && toPrice?.price && toPrice.price > 0) {
      setRate(fromPrice.price / toPrice.price);
    }
  }, [fromPrice, toPrice]);

  console.log(fromPrice, toPrice);

  // Handle input changes with respect to the active field
  useEffect(() => {
    if (activeInput === "from" && !fromValue) return setToValue("");
    if (activeInput === "to" && !toValue) return setFromValue("");

    if (activeInput === "from" && fromValue && rate > 0) {
      // Calculate the amount after fee when user inputs the "from" amount
      const rawToAmount = Number(fromValue) * rate;
      // const amountAfterFee = rawToAmount * (1 - FEE_PERCENTAGE);
      const amountAfterFee = rawToAmount;
      setToValue(parseFloat(amountAfterFee.toFixed(8)).toString());
    } else if (activeInput === "to" && toValue && rate > 0) {
      // When user inputs the "to" amount, we need to work backwards to include the fee
      const rawFromAmount = Number(toValue) / rate;
      // const fromAmountWithFee = rawFromAmount / (1 - FEE_PERCENTAGE);
      const fromAmountWithFee = rawFromAmount;
      setFromValue(parseFloat(fromAmountWithFee.toFixed(8)).toString());
    }
  }, [fromValue, toValue, rate]);

  const confirmSwap = async () => {
    if (!password) return setIsPasswordOpen(true);
    setIsSwapping(true);
    try {
      const res = await fetch("/api/swap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: { ...from, value: fromValue },
          to: { ...to, value: toValue },
          slippage,
          password,
          isMax,
          balance: balance?.balance,
        }),
      });

      if (!res.ok) {
        setIsSwapping(false);
        const data = await res.json();
        toast.error(data.error);
        return;
      }

      const data = await res.json();
      console.log(data);

      setIsSwapping(false);
      toast.success("Successfully submitted swap");
      // reset the form
      setFrom({ ...xrpMeta, description: "XRP" });
      setTo(null);
      setFromValue("");
      setToValue("");
      setActiveInput("from");
      setRate(0);
      setSlippage(5);
    } catch (e) {
      console.error(e);
      setIsSwapping(false);
      toast.error("Something went wrong");
    }
  };

  return (
    <>
      <div className="mx-auto max-w-md space-y-1.5 pt-20">
        <div className="relative">
          <div className="space-y-1.5">
            <div className="absolute right-0 top-[-34px] flex justify-end">
              <Button
                size="icon"
                variant="ghost"
                className="size-7"
                onClick={() => setIsSettingsOpen(true)}
              >
                <Settings2 size={16} />
              </Button>
            </div>
            <Card className="space-y-1 p-4">
              <p className="text-sm text-muted-foreground">From</p>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="0"
                  type="number"
                  min="0"
                  step="any"
                  className={cn(
                    "h-10 border-none pl-0 !text-2xl font-bold shadow-none focus-visible:ring-0",
                    Number(fromValue) > Number(balance?.balance) && "text-red-500",
                  )}
                  onChange={(e) => {
                    setActiveInput("from");
                    setFromValue(e.target.value);
                    setIsMax(false);
                  }}
                  value={fromValue}
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
                <p className="text-sm text-muted-foreground">
                  {fromPrice?.price && fromValue
                    ? `$${(fromPrice.price * Number(fromValue)).toLocaleString("en-us", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`
                    : "$0.00"}
                </p>
                {isLoadingBalance ? (
                  <div className="flex items-center space-x-1.5">
                    <Skeleton className="h-4 w-10" />
                    <p className="text-sm text-muted-foreground">{from?.currency}</p>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1.5">
                    <p className="text-sm text-muted-foreground">
                      <span
                        className={cn("text-foreground", balance?.balance === 0 && "text-red-500")}
                      >
                        {balance?.balance && balance?.balance > 0
                          ? balance?.balance.toLocaleString("en-us", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 6,
                            })
                          : 0}
                      </span>{" "}
                      {from?.currency}
                    </p>
                    {from?.currency !== "XRP" && from?.issuer && balance?.balance ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-5 rounded-full px-2 text-[11px]"
                        onClick={() => {
                          setFromValue(balance?.balance.toString() || "");
                          setIsMax(true);
                        }}
                      >
                        Max
                      </Button>
                    ) : (
                      ""
                    )}
                  </div>
                )}
              </div>
            </Card>
            <Card className="space-y-1 rounded-2xl p-4">
              <p className="text-sm text-muted-foreground">To</p>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="0"
                  type="number"
                  min="0"
                  step="any"
                  className="h-10 border-none pl-0 !text-2xl font-bold shadow-none focus-visible:ring-0"
                  onChange={(e) => {
                    setActiveInput("to");
                    setToValue(e.target.value);
                  }}
                  value={toValue}
                />
                <Button
                  size="sm"
                  variant="secondary"
                  className={cn("shrink-0 rounded-full px-2", !to && "pl-3")}
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
              <p className="text-sm text-muted-foreground">
                {toPrice?.price && toValue
                  ? `$${(toPrice.price * Number(toValue)).toLocaleString("en-us", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`
                  : "$0.00"}
              </p>
            </Card>
          </div>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl bg-background p-1">
            <Button
              size="icon"
              variant="secondary"
              className="size-8"
              onClick={() => {
                if (!to) return;
                setFrom(to);
                setTo(from);
                setFromValue(toValue);
                setToValue(fromValue);
                setIsMax(false);
              }}
            >
              <ArrowUpDown size={16} />
            </Button>
          </div>
        </div>
        <Button
          className="h-14 w-full rounded-2xl"
          size="lg"
          disabled={
            !from ||
            !to ||
            !fromValue ||
            !toValue ||
            !rate ||
            Number(fromValue) > Number(balance?.balance) ||
            fromPrice?.price === 0 ||
            toPrice?.price === 0 ||
            isSwapping
          }
          onClick={confirmSwap}
        >
          {isSwapping ? (
            <ButtonSpinner />
          ) : Number(fromValue) > Number(balance?.balance) ? (
            `Insufficient ${from?.currency}`
          ) : !to ? (
            "Select token"
          ) : fromPrice?.price === 0 || toPrice?.price === 0 ? (
            `No liquidity for pair ${from?.currency}/${to?.currency}`
          ) : (
            "Swap"
          )}
        </Button>
        {fromPrice?.price && toPrice?.price && fromValue && toValue && rate && from && to ? (
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1" className="rounded-2xl border-b-0">
              <AccordionTrigger className="p-1 text-[13px] text-muted-foreground hover:no-underline">
                {rate
                  ? `1 ${from?.currency} = ~${parseFloat(rate.toFixed(8))} ${to?.currency}`
                  : "Rate"}
              </AccordionTrigger>
              <AccordionContent className="p-1">
                <LineItem
                  label="Rate"
                  value={`1 ${from?.currency} = ~${parseFloat(rate.toFixed(8))} ${to?.currency}`}
                />
                <LineItem
                  label="Swap fee (1.0%)"
                  value={`$${(
                    Number(fromValue) *
                    FEE_PERCENTAGE *
                    (fromPrice?.price || 0)
                  ).toLocaleString("en-us", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`}
                />
                <LineItem label="Network cost" value={`${networkFee?.fee} XRP`} />
                <LineItem label="Slippage" value={`${slippage}%`} />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ) : (
          ""
        )}
      </div>
      <PasswordDialog
        isOpen={isPasswordOpen}
        setIsOpen={setIsPasswordOpen}
        setMasterPassword={setPassword}
      />
      <TokenSelector
        isOpen={isTokenSelectorOpen}
        setIsOpen={setIsTokenSelectorOpen}
        selectingFor={isSelectingFor}
        setFrom={setFrom}
        setTo={setTo}
        setFromValue={setFromValue}
        setToValue={setToValue}
        setIsMax={setIsMax}
      />
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent aria-describedby={undefined}>
          <DialogTitle>Adjust slippage ({slippage}%)</DialogTitle>
          <Slider
            defaultValue={[slippage]}
            onValueChange={(value) => setSlippage(value[0])}
            max={50}
            min={1}
            step={1}
          />
        </DialogContent>
      </Dialog>
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
