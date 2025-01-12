"use client";

import { Button } from "@/components/ui/button";
import { WalletMinimal } from "lucide-react";
import { useWalletActions } from "./context";

export const WalletButton = () => {
  const { setIsOpen } = useWalletActions();
  return (
    <Button
      onClick={() => setIsOpen(true)}
      className="fixed bottom-4 right-4 z-50 hidden size-10 items-center justify-center p-0 max-sm:flex"
    >
      <WalletMinimal className="size-4" />
    </Button>
  );
};
