"use client";

import { Card } from "@/components/ui/card";
import { useWallet } from "@/hooks/use-wallet";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "react-responsive";
import { useRouter } from "next/navigation";
import { useWalletActions } from "../context";
import { TokenIcon } from "@/components/ui/custom/token-icon";

export const Tokens = () => {
  const { wallet, isLoading: isLoading } = useWallet();
  const isDesktop = useMediaQuery({ minWidth: 768 });
  const { setIsOpen } = useWalletActions();
  const router = useRouter();

  if (isLoading) return <TokensSkeleton isDesktop={isDesktop} />;

  return (
    <ScrollArea className={cn("h-[245px]", isDesktop ? "h-[245px]" : "h-[300px]")}>
      <div className="space-y-1.5">
        {wallet?.tokens.map((token) => (
          <Card
            key={`${token.rawCurrency}:${token.issuer}`}
            className={cn(
              "p-0",
              token.issuer &&
                "cursor-pointer transition-all hover:border-border dark:hover:bg-secondary/60",
            )}
            onClick={() => {
              if (token.issuer && !token.rawCurrency.startsWith("03")) {
                router.push(`/tokens/${token.rawCurrency}:${token.issuer}`);
                setIsOpen(false);
                return;
              }
              if (token.rawCurrency.startsWith("03")) {
                window.open(`https://xrpscan.com/account/${token.issuer}`, "_blank");
              }
            }}
          >
            <div className="flex items-center justify-between px-3 py-2.5">
              <div className="flex items-center space-x-2.5">
                <TokenIcon
                  url={`https://cdn.motion.zip/${token.rawCurrency}/${token.issuer}`}
                  fallback={token.icon}
                  alt={token.name ? token.name : token.currency}
                />
                <div>
                  <p className="text-[13px]">{token.name ? token.name : token.currency}</p>
                  <p className="text-xs text-muted-foreground">{token.currency}</p>
                </div>
              </div>
              <div>
                <p className="text-right text-[13px]">
                  {token.balance.toLocaleString("en-us", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  {/* {token.currency} */}
                </p>
                <p className="text-right text-xs text-muted-foreground">
                  {token.balanceInUsd.toLocaleString("en-us", {
                    style: "currency",
                    currency: "USD",
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
};

export const TokensSkeleton = ({ isDesktop }: { isDesktop: boolean }) => {
  return (
    <div className={cn("h-[245px] space-y-1.5", isDesktop ? "h-[245px]" : "h-[300px]")}>
      <Skeleton className="h-[55.5px] w-full rounded-xl" />
      <Skeleton className="h-[55.5px] w-full rounded-xl" />
      <Skeleton className="h-[55.5px] w-full rounded-xl" />
    </div>
  );
};
