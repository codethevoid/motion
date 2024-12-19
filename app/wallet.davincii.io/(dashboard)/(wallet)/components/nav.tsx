"use client";

import { Button } from "@/components/ui/button";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { WalletMinimal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { RevealSeed } from "@/components/dialogs/seed";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDisconnect } from "@/components/dialogs/confirm-disconnect";

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
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirmDisconnectOpen, setIsConfirmDisconnectOpen] = useState(false);
  const router = useRouter();

  return (
    <>
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
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              variant={path === "/settings" ? "default" : "ghost"}
              className="h-8 w-8"
            >
              <WalletMinimal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onCloseAutoFocus={(e) => e.preventDefault()}>
            <DropdownMenuItem onClick={() => router.push("mailto:support@davincii.io")}>
              Support
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsOpen(true)}>Reveal private key</DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-500 hover:!bg-red-500/10 hover:!text-red-500"
              onClick={() => setIsConfirmDisconnectOpen(true)}
            >
              Disconnect wallet
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <RevealSeed isOpen={isOpen} setIsOpen={setIsOpen} />
      <ConfirmDisconnect isOpen={isConfirmDisconnectOpen} setIsOpen={setIsConfirmDisconnectOpen} />
    </>
  );
};
