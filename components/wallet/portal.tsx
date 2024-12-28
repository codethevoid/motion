"use client";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useSession } from "@/hooks/use-session";
import { RainbowButton } from "../ui/rainbow-button";
import { WalletOverview } from "./overview";
import { WalletAuth } from "@/components/wallet/auth";
import { CreateWalletForm } from "./onboarding/new";
import { ImportWalletForm } from "./onboarding/import";
import { WalletMinimal } from "lucide-react";
import { useEffect, useState } from "react";
import NextLink from "next/link";
import { Nav } from "./nav";
import { Receive } from "./receive";
import { Send } from "./send";
import { useWalletActions } from "./context";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { useMediaQuery } from "react-responsive";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { DialogTitle } from "@radix-ui/react-dialog";
import { ConfirmTx } from "./confirm-tx";

export const WalletPortal = () => {
  const { hasWallet } = useSession();
  const [walletMethod, setWalletMethod] = useState<"new" | "import" | null>(null);
  const [navTab, setNavTab] = useState<"wallet" | "send" | "receive">("wallet");
  const { isOpen, setIsOpen, transaction, setTransaction } = useWalletActions();
  const isDesktop = useMediaQuery({ minWidth: 768 });

  useEffect(() => {
    setTimeout(() => {
      setWalletMethod(null);
    }, 300);

    if (!isOpen) {
      setTimeout(() => {
        setTransaction(null);
      }, 300);
    }
  }, [isOpen]);

  if (isDesktop) {
    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          {hasWallet ? (
            <Button size="sm" className="h-8 px-4 text-[13px]">
              <WalletMinimal className="size-4" />
              <span>Wallet</span>
            </Button>
          ) : (
            <RainbowButton className="h-8 gap-2 px-4 text-[13px]">
              <WalletMinimal className="size-4" />
              <span>Connect</span>
            </RainbowButton>
          )}
        </PopoverTrigger>
        <PopoverContent className="w-[360px] space-y-2" align="end">
          {hasWallet ? (
            <WalletAuth>
              <div className="space-y-2">
                {!transaction ? (
                  <>
                    <Nav navTab={navTab} setNavTab={setNavTab} />
                    {navTab === "wallet" && <WalletOverview />}
                    {navTab === "send" && <Send />}
                    {navTab === "receive" && <Receive />}
                  </>
                ) : (
                  <ConfirmTx />
                )}
              </div>
            </WalletAuth>
          ) : (
            <>
              {!walletMethod && (
                <div className="space-y-4">
                  <div>
                    <p className="text-center text-base font-bold">Get started with TokenOS</p>
                    <p className="text-center text-[13px] text-muted-foreground">
                      Create a new wallet or import an existing one.
                    </p>
                  </div>
                  <div className="w-full space-y-2.5">
                    <RainbowButton
                      className="h-9 w-full px-8"
                      onClick={() => setWalletMethod("new")}
                    >
                      Create wallet
                    </RainbowButton>
                    <Button
                      className="w-full"
                      variant="secondary"
                      onClick={() => setWalletMethod("import")}
                    >
                      Import existing wallet
                    </Button>
                  </div>
                  <p className="mx-auto mt-4 max-w-[280px] text-center text-xs text-muted-foreground">
                    By creating or importing a wallet, you agree to the{" "}
                    <NextLink href="/legal/terms" className="text-foreground underline">
                      Terms of Service
                    </NextLink>{" "}
                    and{" "}
                    <NextLink href={`/legal/privacy`} className="text-foreground underline">
                      Privacy Policy
                    </NextLink>
                  </p>
                </div>
              )}
              {walletMethod === "new" && <CreateWalletForm />}
              {walletMethod === "import" && <ImportWalletForm />}
            </>
          )}
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        {hasWallet ? (
          <Button size="sm" className="h-8 px-4 text-[13px]">
            <WalletMinimal className="size-4" />
            <span>Wallet</span>
          </Button>
        ) : (
          <RainbowButton className="h-8 gap-2 px-4 text-[13px]">
            <WalletMinimal className="size-4" />
            <span>Connect</span>
          </RainbowButton>
        )}
      </DrawerTrigger>
      <DrawerContent className={`${hasWallet && !transaction ? "h-[85%]" : ""}`}>
        <VisuallyHidden>
          <DialogTitle>Wallet</DialogTitle>
        </VisuallyHidden>
        <div className="p-4">
          {hasWallet ? (
            <WalletAuth>
              <div className="space-y-2">
                {!transaction ? (
                  <>
                    <Nav navTab={navTab} setNavTab={setNavTab} />
                    {navTab === "wallet" && <WalletOverview />}
                    {navTab === "send" && <Send />}
                    {navTab === "receive" && <Receive />}
                  </>
                ) : (
                  <ConfirmTx />
                )}
              </div>
            </WalletAuth>
          ) : (
            <>
              {!walletMethod && (
                <div className="space-y-4">
                  <div>
                    <p className="text-center text-base font-bold">Get started with TokenOS</p>
                    <p className="text-center text-[13px] text-muted-foreground">
                      Create a new wallet or import an existing one.
                    </p>
                  </div>
                  <div className="w-full space-y-2.5">
                    <RainbowButton
                      className="h-9 w-full px-8"
                      onClick={() => setWalletMethod("new")}
                    >
                      Create wallet
                    </RainbowButton>
                    <Button
                      className="w-full"
                      variant="secondary"
                      onClick={() => setWalletMethod("import")}
                    >
                      Import existing wallet
                    </Button>
                  </div>
                  <p className="mx-auto mt-4 max-w-[280px] text-center text-xs text-muted-foreground">
                    By creating or importing a wallet, you agree to the{" "}
                    <NextLink href="/legal/terms" className="text-foreground underline">
                      Terms of Service
                    </NextLink>{" "}
                    and{" "}
                    <NextLink href={`/legal/privacy`} className="text-foreground underline">
                      Privacy Policy
                    </NextLink>
                  </p>
                </div>
              )}
              {walletMethod === "new" && <CreateWalletForm />}
              {walletMethod === "import" && <ImportWalletForm />}
            </>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};
