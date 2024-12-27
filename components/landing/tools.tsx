"use client";

import { MagicCard } from "../ui/magic-card";
import {
  ArrowRightLeft,
  ArrowUpRight,
  HandCoins,
  HandCoinsIcon,
  WalletMinimal,
} from "lucide-react";
import { Button } from "../ui/button";
import { useWalletActions } from "../wallet/context";
import NextLink from "next/link";

export const Tools = () => {
  const { setIsOpen } = useWalletActions();
  return (
    <div className="px-4">
      <div className="mx-auto max-w-screen-md space-y-8">
        <div className="space-y-2">
          <h2 className="text-center text-3xl font-bold max-sm:text-xl max-sm:tracking-tight">
            Start managing your assets
          </h2>
          <p className="mx-auto max-w-lg text-center text-sm text-muted-foreground max-sm:max-w-xs max-sm:text-[13px]">
            Explore our tools to enhance your experience and see why TokenOS is the preffered way of
            managing assets on the XRP Ledger.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <MagicCard className="p-6" gradientSize={160}>
            <div className="space-y-4">
              <div className="flex size-10 items-center justify-center rounded-md border border-primary/10 text-foreground ring-4 ring-primary/[0.05]">
                <WalletMinimal className="size-[18px]" />
              </div>
              <div className="space-y-1">
                <p className="text-base">Self-custody XRP Ledger wallet</p>
                <p className="text-sm text-muted-foreground">
                  Be in control of your assets. Securely manage and trade tokens on the XRP Ledger
                  all with our native wallet.
                </p>
              </div>
              <div className="flex gap-3">
                <Button className="w-full justify-between" onClick={() => setIsOpen(true)}>
                  <span>Create wallet</span>
                  <ArrowUpRight className="size-4" />
                </Button>
                <Button className="w-full justify-between" variant="secondary" asChild>
                  <NextLink href="/docs">
                    <>
                      <span>Read docs</span>
                      <ArrowUpRight className="size-4" />
                    </>
                  </NextLink>
                </Button>
              </div>
            </div>
          </MagicCard>
          <MagicCard className="p-6" gradientSize={160}>
            <div className="space-y-4">
              <div className="flex size-10 items-center justify-center rounded-md border border-primary/10 text-foreground ring-4 ring-primary/[0.05]">
                <HandCoins className="size-[18px]" />
              </div>
              <div className="space-y-1">
                <p className="text-base">Decentralized exchange</p>
                <p className="text-sm text-muted-foreground">
                  Use our classic set of trading tools. Buy and sell tokens securely and
                  conveniently without leaving our platform.
                </p>
              </div>
              <div className="flex gap-3">
                <Button className="w-full justify-between" asChild>
                  <NextLink href="/tokens">
                    <>
                      <span>Start trading</span>
                      <ArrowUpRight className="size-4" />
                    </>
                  </NextLink>
                </Button>
                <Button className="w-full justify-between" variant="secondary" asChild>
                  <NextLink href="/docs">
                    <>
                      <span>Read docs</span>
                      <ArrowUpRight className="size-4" />
                    </>
                  </NextLink>
                </Button>
              </div>
            </div>
          </MagicCard>
          {/* <MagicCard className="p-6" gradientSize={140}>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <HandCoins className="relative bottom-[1px] size-4" />
                <p className="text-sm">Decentralized exchange</p>
              </div>
              <p className="text-base">
                <span className="text-foreground">Trade tokens with ease.</span>{" "}
                <span className="text-muted-foreground"></span>
              </p>
            </div>
          </MagicCard> */}
        </div>
      </div>
    </div>
  );
};
