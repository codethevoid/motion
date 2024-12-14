"use client";

import { Card } from "@/components/ui/card";
import { useWallet } from "@/hooks/use-wallet";
import { coinData } from "@/lib/coin-data/data";
import NextImage from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

export const Tokens = () => {
  const { wallet, isLoading: isLoading } = useWallet();

  if (isLoading) return <TokensSkeleton />;

  return (
    <div className="space-y-1.5">
      {wallet?.tokens.map((token) => (
        <Card key={token.currency} className="p-0">
          <div className="flex items-center justify-between px-3 py-2.5">
            <div className="flex items-center space-x-2.5">
              {coinData[token.key] ? (
                <img
                  src={coinData[token.key].icon}
                  alt={coinData[token.key].currency}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
                  {/* <Coins size={14} /> */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-4 w-4"
                  >
                    <path d="M12.0049 4.00275C18.08 4.00275 23.0049 6.68904 23.0049 10.0027V14.0027C23.0049 17.3165 18.08 20.0027 12.0049 20.0027C6.03824 20.0027 1.18114 17.4115 1.00957 14.1797L1.00488 14.0027V10.0027C1.00488 6.68904 5.92975 4.00275 12.0049 4.00275ZM12.0049 16.0027C8.28443 16.0027 4.99537 14.9953 3.00466 13.4532L3.00488 14.0027C3.00488 15.8849 6.88751 18.0027 12.0049 18.0027C17.0156 18.0027 20.8426 15.9723 20.9999 14.1207L21.0049 14.0027L21.0061 13.4524C19.0155 14.9949 15.726 16.0027 12.0049 16.0027ZM12.0049 6.00275C6.88751 6.00275 3.00488 8.12054 3.00488 10.0027C3.00488 11.8849 6.88751 14.0027 12.0049 14.0027C17.1223 14.0027 21.0049 11.8849 21.0049 10.0027C21.0049 8.12054 17.1223 6.00275 12.0049 6.00275Z"></path>
                  </svg>
                </div>
              )}
              <div>
                <p className="text-[13px]">
                  {coinData[token.key] ? coinData[token.key].name : token.currency}
                </p>
                <p className="text-xs text-muted-foreground">{token.currency}</p>
              </div>
            </div>
            <div>
              <p className="text-right text-[13px]">
                {token.balance.toLocaleString("en-us", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 4,
                })}{" "}
                {token.currency}
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
  );
};

export const TokensSkeleton = () => {
  return (
    <div className="space-y-1.5">
      <Skeleton className="h-[55.5px] w-full rounded-xl" />
      <Skeleton className="h-[55.5px] w-full rounded-xl" />
      <Skeleton className="h-[55.5px] w-full rounded-xl" />
    </div>
  );
};
