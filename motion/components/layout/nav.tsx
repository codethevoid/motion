"use client";

import NextLink from "next/link";
import { Button } from "@/components/ui/button";
import { useScrollPosition } from "@/hooks/utils/use-scroll-position";
import { cn } from "@/lib/utils";
import { WalletPortal } from "../wallet/portal";
import { MotionIcon } from "../ui/icons/motion-icon";

export const Nav = () => {
  const scrollPos = useScrollPosition();

  return (
    <>
      <div
        className={cn(
          "sticky top-0 z-50 w-full px-4 py-2 transition-all",
          scrollPos > 5 && "border-b backdrop-blur-lg",
        )}
      >
        <div className="mx-auto flex max-w-screen-lg items-center justify-between">
          <div className="flex items-center space-x-12">
            <NextLink href="/" className="flex items-center space-x-2 font-bold">
              <>
                <MotionIcon />
                <span className="max-sm:hidden">motion.zip</span>
              </>
            </NextLink>
            {/* <div className="flex items-center">
              <Button
                variant="ghost"
                className="h-8 px-3 text-[13px] font-medium text-foreground/70"
                asChild
              >
                <NextLink href="/tokens">Tokens</NextLink>
              </Button>
              <Button variant="ghost" className="h-8 px-3 text-[13px] text-foreground/70" asChild>
                <NextLink href="/tokens">Docs</NextLink>
              </Button>
            </div> */}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              className="h-8 px-3 text-[13px] font-medium text-foreground/70"
              asChild
            >
              <NextLink href="/launch">Launch</NextLink>
            </Button>
            <Button
              variant="ghost"
              className="h-8 px-3 text-[13px] font-medium text-foreground/70"
              asChild
            >
              <NextLink href="/tokens">Tokens</NextLink>
            </Button>
            <WalletPortal />
          </div>
        </div>
      </div>
    </>
  );
};
