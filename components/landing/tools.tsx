import { MagicCard } from "../ui/magic-card";
import { ArrowRightLeft, HandCoins, HandCoinsIcon, WalletMinimal } from "lucide-react";
import GridPattern from "../ui/grid-pattern";
import { Card } from "../ui/card";
import { cn } from "@/lib/utils";
import { GradientBadge } from "../ui/gradient-badge";
import { Wallet } from "xrpl";
import { Button } from "../ui/button";

export const Tools = () => {
  return (
    <div className="px-4">
      <div className="mx-auto max-w-screen-md space-y-8">
        <div className="space-y-2">
          <h1 className="text-center text-3xl font-bold max-sm:text-2xl max-sm:tracking-tight">
            Tools for you
          </h1>
          <p className="mx-auto max-w-lg text-center text-sm text-muted-foreground max-sm:max-w-xs max-sm:text-[13px]">
            Explore our tools to enhance your experience and see why TokenOS is the preffered way of
            managing assets on the XRP Ledger.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <MagicCard className="p-6" gradientSize={140}>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <WalletMinimal className="relative bottom-[1px] size-4" />
                <p className="text-sm">Self-custody wallet</p>
              </div>
              <p className="text-base">
                <span className="text-foreground">Be in control of your assets.</span>{" "}
                <span className="text-muted-foreground">
                  Securely manage and trade tokens on the XRP Ledger all within our native wallet.
                </span>
              </p>
            </div>
          </MagicCard>
          <MagicCard className="p-6" gradientSize={140}>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <HandCoins className="relative bottom-[1px] size-4" />
                <p className="text-sm">Decentralized exchange</p>
              </div>
              <p className="text-base">
                <span className="text-foreground">Trade tokens with ease.</span>{" "}
                <span className="text-muted-foreground">
                  Access thousands of tokens on the XRP Ledger.
                </span>
              </p>
            </div>
          </MagicCard>
        </div>
      </div>
    </div>
  );
};
