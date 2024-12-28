"use client";

import { ReactNode } from "react";
import { useWallet } from "@/hooks/use-wallet";
import { Receive } from "@/components/wallet/receive";
import { InfoIcon } from "lucide-react";

export const WalletAuth = ({ children }: { children: ReactNode }) => {
  const { wallet, error, isLoading } = useWallet();

  // useEffect(() => {
  //   if (!isLoading && !wallet?.isFunded && pathname !== "/receive") {
  //     router.push("/receive");
  //   }
  // }, [isLoading, wallet, router, pathname]);

  if (error) return <div className="text-center">an error occured</div>;
  if (!isLoading && !wallet?.isFunded) {
    return (
      <div className="mx-auto max-w-md space-y-2">
        <div className="flex space-x-2 rounded-xl border border-blue-500/20 bg-blue-500/10 px-2 py-1.5">
          <InfoIcon className="relative top-0.5 size-4 text-blue-500" />
          <p className="text-[13px] text-blue-500">Send at least 1 XRP to activate your wallet.</p>
        </div>
        <Receive />
      </div>
    );
  }

  return <div>{children}</div>;
};
