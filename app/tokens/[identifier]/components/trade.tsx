"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBalance } from "@/hooks/use-balance";
import { formatCurrency } from "@/utils/format-currency";
import { useEffect, useState, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { usePrice } from "@/hooks/use-price";
import { useXrpPrice } from "@/hooks/use-xrp-price";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { useSession } from "@/hooks/use-session";
import { useWalletActions } from "@/components/wallet/context";
import { Skeleton } from "@/components/ui/skeleton";
import { Cog, InfoIcon } from "lucide-react";
import { useNetworkFee } from "@/hooks/use-network-fee";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { xrpToDrops } from "xrpl";
import { RainbowButton } from "@/components/ui/rainbow-button";

export const Trade = ({ currency, issuer }: { currency: string; issuer: string }) => {
  const { balance, isLoading: isLoadingBalance } = useBalance(currency, issuer);
  const { balance: xrpBalance, isLoading: isLoadingXrpBalance } = useBalance("XRP", undefined);
  const { price } = usePrice(currency, issuer);
  const { data: xrpPrice } = useXrpPrice();
  const { data: networkFee } = useNetworkFee();
  const [direction, setDirection] = useState<"buy" | "sell">("buy");
  const [rate, setRate] = useState<number>(0);
  const [slippage, setSlippage] = useState<number>(4);
  const [amount, setAmount] = useState<string>(""); // in token amount (IOU or XRP) determined by direction
  const { hasWallet, isLoading: isLoadingSession } = useSession();
  const { setIsOpen, setTransaction } = useWalletActions();
  const [isSlippageOpen, setIsSlippageOpen] = useState<boolean>(false);
  console.log(xrpBalance, balance);
  const FEE_PERCENTAGE = 0.01; // 1%

  // get the rate
  useEffect(() => {
    if (price?.price && xrpPrice) {
      if (direction === "buy") {
        setRate(xrpPrice / price.price);
      } else {
        setRate(price.price / xrpPrice);
      }
    }
  }, [price, xrpPrice, direction]);

  useEffect(() => {
    setAmount("");
  }, [direction]);

  const calculateTradeFee = (): string => {
    if (direction === "buy") {
      return (Number(amount) * (xrpPrice as number) * FEE_PERCENTAGE).toLocaleString("en-us", {
        style: "currency",
        currency: "usd",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    } else {
      // multiply price of custom token by the amount
      const valueOfTradeInUsd = Number(amount) * (price?.price as number);
      // multiply value of trade in usd by the fee percentage
      const feeInUsd = valueOfTradeInUsd * FEE_PERCENTAGE;
      return feeInUsd.toLocaleString("en-us", {
        style: "currency",
        currency: "usd",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
  };

  const promptTransaction = () => {
    if (!xrpBalance) return;
    if (!Number(amount)) return toast.error("Please enter an amount");
    if (direction === "buy") {
      if (Number(amount) > xrpBalance.balance) return toast.error("Insufficient XRP balance");
      // create transaction
      setTransaction({
        type: "buy",
        amountToDeliver: xrpToDrops(Number(amount).toFixed(6)),
        amountToReceive: {
          currency,
          issuer,
          value: (Number(amount) * rate).toString(),
        },
        slippage,
        fee: calculateTradeFee(),
      });
    } else {
      if (Number(amount) > (balance?.balance as number)) {
        return toast.error("Insufficient token balance");
      }
      // create transaction
      setTransaction({
        type: "sell",
        amountToDeliver: {
          currency,
          issuer,
          value: amount,
        },
        amountToReceive: (Number(amount) * rate * 1_000_000).toString(),
        slippage,
        fee: calculateTradeFee(),
      });
    }

    setIsOpen(true);
  };

  return (
    <>
      <Card className="space-y-4 p-4">
        <Tabs value={direction} onValueChange={(value) => setDirection(value as "buy" | "sell")}>
          <TabsList className="w-full">
            <TabsTrigger value="buy" className="h-7 w-full text-[13px]">
              Buy
            </TabsTrigger>
            <TabsTrigger value="sell" className="h-7 w-full text-[13px]">
              Sell
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="amount" className="h-4">
              Amount
            </Label>
            {hasWallet && (
              <>
                {isLoadingBalance || isLoadingXrpBalance ? (
                  <Skeleton className="h-4 w-16" />
                ) : (
                  <p className="text-xs text-muted-foreground">
                    {direction === "buy" && xrpBalance?.balance
                      ? xrpBalance.balance.toLocaleString("en-us", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 2,
                        })
                      : ""}
                    {direction === "sell" && typeof balance?.balance === "number"
                      ? balance.balance.toLocaleString("en-us", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 4,
                        })
                      : ""}{" "}
                    available
                  </p>
                )}
              </>
            )}
          </div>
          <div className="relative w-full">
            <Input
              id="amount"
              className={cn(
                "bg-card pr-12",
                direction === "buy" &&
                  Number(amount) > (xrpBalance?.balance as number) &&
                  "text-red-500",
                direction === "sell" &&
                  Number(amount) > (balance?.balance as number) &&
                  "text-red-500",
              )}
              type="number"
              min={0}
              placeholder={
                direction === "buy" ? "XRP amount" : `${formatCurrency(currency)} amount`
              }
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            {direction === "sell" && balance?.balance ? (
              <Button
                variant="secondary"
                size="sm"
                className="absolute right-1.5 top-1/2 h-6 -translate-y-1/2 px-2"
                onClick={() => setAmount(balance.balance.toString())}
              >
                Max
              </Button>
            ) : (
              ""
            )}
          </div>
        </div>
        <Accordion type="single" collapsible>
          <AccordionItem
            value="item-1"
            className="rounded-md border border-border/80 bg-secondary/40"
          >
            <AccordionTrigger className="px-3 py-2 text-xs text-muted-foreground hover:no-underline">
              <div className="flex items-center gap-1">
                <InfoIcon className="size-3" />
                <span>
                  {direction === "buy"
                    ? `1 XRP = ${parseFloat(rate.toFixed(4)).toLocaleString("en-us")} ${formatCurrency(currency)}`
                    : `1 ${formatCurrency(currency)} = ${parseFloat(rate.toFixed(6))} XRP`}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-0.5 px-3 pb-2">
              <LineItem
                label="Slippage"
                value={`${slippage}%`}
                action={
                  <Button
                    onClick={() => setIsSlippageOpen(true)}
                    size="icon"
                    variant="ghost"
                    className="size-4"
                  >
                    <Cog className="size-3" />
                  </Button>
                }
              />
              <LineItem
                label="Minimum received"
                value={`${(Number(amount) * rate * ((100 - slippage) / 100)).toLocaleString("en-us", { maximumFractionDigits: 4 })} ${direction === "buy" ? formatCurrency(currency) : "XRP"}`}
              />
              <LineItem label="Network cost" value={`${networkFee?.fee} XRP`} />
              <LineItem label="Trade fee (1%)" value={calculateTradeFee()} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        {isLoadingSession ? (
          <Skeleton className="h-9 w-full" />
        ) : !hasWallet ? (
          <RainbowButton onClick={() => setIsOpen(true)} className="w-full">
            Connect Wallet
          </RainbowButton>
        ) : (
          <Button
            onClick={promptTransaction}
            className={cn(
              "w-full transition-all hover:opacity-80",
              direction === "buy"
                ? "bg-gradient-to-r from-emerald-500 to-green-500 shadow-xl shadow-emerald-500/20"
                : "bg-gradient-to-r from-rose-500 to-red-500 text-white shadow-xl shadow-rose-500/20",
            )}
          >
            {direction === "buy"
              ? `Buy ${formatCurrency(currency)}`
              : `Sell ${formatCurrency(currency)}`}
          </Button>
        )}
      </Card>
      <Dialog open={isSlippageOpen} onOpenChange={setIsSlippageOpen}>
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

const LineItem = ({
  label,
  value,
  action,
}: {
  label: string;
  value: string | number;
  action?: ReactNode;
}) => {
  return (
    <div className="flex items-center justify-between">
      <p className="text-xs text-muted-foreground">{label}</p>
      {action ? (
        <div className="flex items-center gap-1">
          <p className="text-xs text-foreground">{value}</p>
          {action}
        </div>
      ) : (
        <p className="text-xs text-foreground">{value}</p>
      )}
    </div>
  );
};
