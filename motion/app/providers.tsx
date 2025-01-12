"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { WalletProvider } from "@/components/wallet/context";
import { WalletButton } from "@/components/wallet/wallet-button";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
      <WalletProvider>
        {children}
        <WalletButton />
      </WalletProvider>
      <Toaster richColors closeButton />
    </ThemeProvider>
  );
};
