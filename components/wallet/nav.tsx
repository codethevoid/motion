"use client";

import { Button } from "@/components/ui/button";
import { Cog } from "lucide-react";
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
import { useMediaQuery } from "react-responsive";
import { Drawer, DrawerTrigger, DrawerContent, DrawerTitle } from "../ui/drawer";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

const navItems: { label: string; value: "wallet" | "send" | "receive" }[] = [
  {
    label: "Wallet",
    value: "wallet",
  },
  {
    label: "Send",
    value: "send",
  },
  {
    label: "Receive",
    value: "receive",
  },
];

export const Nav = ({
  navTab,
  setNavTab,
}: {
  navTab: "wallet" | "send" | "receive";
  setNavTab: (tab: "wallet" | "send" | "receive") => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirmDisconnectOpen, setIsConfirmDisconnectOpen] = useState(false);
  const router = useRouter();
  const isDesktop = useMediaQuery({ minWidth: 768 });
  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {navItems.map((item) => (
            <Button
              key={item.label}
              size="sm"
              variant={navTab === item.value ? "default" : "ghost"}
              onClick={() => setNavTab(item.value)}
            >
              {item.label}
            </Button>
          ))}
        </div>
        {isDesktop ? (
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="h-8 w-8" variant="ghost">
                {/* <WalletMinimal className="size-4" /> */}
                <Cog className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onCloseAutoFocus={(e) => e.preventDefault()}>
              <DropdownMenuItem onClick={() => router.push("mailto:support@tokenos.one")}>
                Support
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsOpen(true)}>
                Reveal private key
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-500 hover:!bg-red-500/10 hover:!text-red-500"
                onClick={() => setIsConfirmDisconnectOpen(true)}
              >
                Disconnect wallet
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Drawer>
            <DrawerTrigger asChild>
              <Button size="sm" className="h-8 w-8" variant="ghost">
                {/* <WalletMinimal className="size-4" /> */}
                <Cog className="size-4" />
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <VisuallyHidden>
                <DrawerTitle>Settings</DrawerTitle>
              </VisuallyHidden>
              <div className="p-4">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => router.push("mailto:support@tokenos.one")}
                >
                  Support
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => setIsOpen(true)}
                >
                  Reveal private key
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-500 hover:!bg-red-500/10 hover:!text-red-500"
                  onClick={() => setIsConfirmDisconnectOpen(true)}
                >
                  Disconnect wallet
                </Button>
              </div>
            </DrawerContent>
          </Drawer>
        )}
      </div>
      <RevealSeed isOpen={isOpen} setIsOpen={setIsOpen} />
      <ConfirmDisconnect isOpen={isConfirmDisconnectOpen} setIsOpen={setIsConfirmDisconnectOpen} />
    </>
  );
};
