"use client";

import { ReactNode } from "react";
import { useWallet } from "@/hooks/use-wallet";

export const WalletAuth = ({ children }: { children: ReactNode }) => {
  const { error } = useWallet();
  if (error) return <div className="text-center">an error occured</div>;
  return <div>{children}</div>;
};
