"use client";

import { useWallet } from "@/hooks/use-wallet";
import { Card } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { WalletNav } from "./wallet-nav";
import { Tokens } from "./tabs/tokens";
import { Nfts } from "./tabs/nfts";

export const WalletOverview = () => {
  const { wallet, isLoading } = useWallet();
  const [tab, setTab] = useState<"tokens" | "nfts" | "transactions">("tokens");
  console.log(wallet);

  return (
    <>
      <Card className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">Decentralized wallet</p>
          {isLoading ? (
            <Skeleton className="h-7 w-full max-w-[300px] rounded-lg" />
          ) : (
            <div className="flex min-w-0 max-w-fit items-center space-x-2 rounded-lg bg-secondary px-2 py-1.5">
              <img
                src={`https://api.dicebear.com/9.x/glass/png?seed=${wallet?.address}`}
                alt="wallet avatar"
                className="h-4 w-4 rounded-full"
              />
              <p className="min-w-0 truncate text-xs">{wallet?.address}</p>
              {wallet?.address && <CopyButton text={wallet.address} />}
            </div>
          )}
        </div>
        <div className="space-y-2">
          {isLoading ? (
            <Skeleton className="h-8 w-20 rounded-lg" />
          ) : (
            <p className="text-2xl font-bold">
              {wallet?.balanceInUsdIncludingTokens.toLocaleString("en-us", {
                style: "currency",
                currency: "USD",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          )}
          {isLoading ? (
            <div className="flex h-[19.5px] items-center">
              <Skeleton className="h-4 w-full max-w-[160px]" />
            </div>
          ) : (
            <div className="flex items-center space-x-1">
              <p className="text-[13px]">
                Reserves: {wallet?.totalReserve.toLocaleString("en-us")} XRP{" "}
              </p>
              <span className="text-[13px] text-muted-foreground">
                (
                {wallet?.totalReserveInUsd.toLocaleString("en-us", {
                  style: "currency",
                  currency: "USD",
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
                )
              </span>
            </div>
          )}
        </div>
      </Card>
      <WalletNav tab={tab} setTab={setTab} />
      {tab === "tokens" && <Tokens />}
      {tab === "nfts" && <Nfts />}
    </>
  );
};
