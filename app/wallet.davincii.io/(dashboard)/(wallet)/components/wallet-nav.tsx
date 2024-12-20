"use client";

import { Button } from "@/components/ui/button";

const navItems: { label: string; value: "tokens" | "nfts" | "transactions" | "trustlines" }[] = [
  {
    label: "Tokens",
    value: "tokens",
  },
  // {
  //   label: "NFTs",
  //   value: "nfts",
  // },
  {
    label: "Trustlines",
    value: "trustlines",
  },
  {
    label: "Transactions",
    value: "transactions",
  },
];

type Props = {
  tab: "tokens" | "nfts" | "transactions" | "trustlines";
  setTab: (tab: "tokens" | "nfts" | "transactions" | "trustlines") => void;
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
