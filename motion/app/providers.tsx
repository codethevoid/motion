"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { WalletProvider } from "@/components/wallet/context";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
      <WalletProvider>{children}</WalletProvider>
      <Toaster richColors closeButton />
    </ThemeProvider>
  );
};
