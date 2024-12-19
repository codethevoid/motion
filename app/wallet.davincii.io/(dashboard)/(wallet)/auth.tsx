"use client";

import { ReactNode, useEffect } from "react";
import { useWallet } from "@/hooks/use-wallet";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { ReceiveClient } from "./receive/client";
import { InfoIcon } from "lucide-react";

export const WalletAuth = ({ children }: { children: ReactNode }) => {
  const { wallet, error, isLoading } = useWallet();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !wallet?.isFunded && pathname !== "/receive") {
      router.push("/receive");
    }
  }, [isLoading, wallet, router, pathname]);

  if (error) return <div className="text-center">an error occured</div>;
  if (!isLoading && !wallet?.isFunded) {
    return (
      <div className="mx-auto max-w-md space-y-2 pt-16">
        <div className="flex items-center space-x-2 rounded-xl border border-blue-500/20 bg-blue-500/10 p-2.5">
          <InfoIcon className="size-4 text-blue-500" />
          <p className="text-[13px] text-blue-500">
            Please send at least 1 XRP to activate your wallet.
          </p>
        </div>
        <ReceiveClient className="pt-0" />
      </div>
    );
  }

  return <div>{children}</div>;
};
