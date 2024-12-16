"use client";

import { Button } from "@/components/ui/button";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { Cog, WalletMinimal } from "lucide-react";

const navItems = [
  {
    label: "Wallet",
    href: "/",
  },
  {
    label: "Swap",
    href: "/swap",
  },
  {
    label: "Send",
    href: "/send",
  },
  {
    label: "Receive",
    href: "/receive",
  },
];

export const Nav = () => {
  const path = usePathname();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        {navItems.map((item) => (
          <Button
            key={item.label}
            size="sm"
            variant={path === item.href ? "default" : "ghost"}
            asChild
          >
            <NextLink href={item.href}>{item.label}</NextLink>
          </Button>
        ))}
      </div>
      <Button size="sm" variant={path === "/settings" ? "default" : "ghost"} className="h-8 w-8">
        <WalletMinimal className="size-4" />
      </Button>
    </div>
  );
};
