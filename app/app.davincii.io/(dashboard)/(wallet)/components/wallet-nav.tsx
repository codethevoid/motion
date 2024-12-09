"use client";

import { Button } from "@/components/ui/button";

const navItems: { label: string; value: "tokens" | "nfts" | "transactions" }[] = [
  {
    label: "Tokens",
    value: "tokens",
  },
  {
    label: "NFTs",
    value: "nfts",
  },
  {
    label: "Transactions",
    value: "transactions",
  },
];

type Props = {
  tab: "tokens" | "nfts" | "transactions";
  setTab: (tab: "tokens" | "nfts" | "transactions") => void;
};

export const WalletNav = ({ tab, setTab }: Props) => {
  return (
    <div className="flex items-center space-x-2">
      {navItems.map((item) => (
        <Button
          key={item.label}
          size="sm"
          variant={tab === item.value ? "default" : "ghost"}
          onClick={() => setTab(item.value)}
        >
          {item.label}
        </Button>
      ))}
    </div>
  );
};
