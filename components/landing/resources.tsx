"use client";

import { MagicCard } from "../ui/magic-card";
import { ArrowUpRight, BadgeHelp, BookOpen } from "lucide-react";
import { Button } from "../ui/button";
import NextLink from "next/link";

export const Resources = () => {
  return (
    <div className="px-4">
      <div className="mx-auto max-w-screen-lg space-y-8">
        <div className="space-y-2">
          <h2 className="text-center text-3xl font-bold max-sm:text-xl max-sm:tracking-tight">
            Resources
          </h2>
          <p className="mx-auto max-w-lg text-center text-sm text-muted-foreground max-sm:max-w-xs max-sm:text-[13px]">
            Explore our resources and learn more about TokenOS and how to use it.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
          <MagicCard className="p-6" gradientSize={160}>
            <div className="flex-1 space-y-4">
              <div className="flex size-10 items-center justify-center rounded-md border border-primary/10 text-foreground ring-4 ring-primary/[0.05]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-[18px]"
                >
                  <path d="M10.4883 14.651L15.25 21H22.25L14.3917 10.5223L20.9308 3H18.2808L13.1643 8.88578L8.75 3H1.75L9.26086 13.0145L2.31915 21H4.96917L10.4883 14.651ZM16.25 19L5.75 5H7.75L18.25 19H16.25Z"></path>
                </svg>
              </div>
              <div className="w-full space-y-1">
                <p className="text-base">Community</p>
                <p className="text-sm text-muted-foreground">
                  Get engaged with the community and stay up to date with the latest news and
                  updates.
                </p>
              </div>
              <div className="flex gap-3 max-md:flex-col">
                <Button className="w-full justify-between" asChild>
                  <NextLink href="https://x.com/tokenosdotone" target="_blank">
                    <>
                      <span>Join the community</span>
                      <ArrowUpRight className="size-4" />
                    </>
                  </NextLink>
                </Button>
                {/* <Button
                  className="w-full justify-between"
                  variant="secondary"
                  onClick={() => setIsOpen(true)}
                >
                  <span>Import wallet</span>
                  <ArrowUpRight className="size-4" />
                </Button> */}
              </div>
            </div>
          </MagicCard>
          <MagicCard className="p-6" gradientSize={160}>
            <div className="space-y-4">
              <div className="flex size-10 items-center justify-center rounded-md border border-primary/10 text-foreground ring-4 ring-primary/[0.05]">
                <BookOpen className="size-[18px]" />
              </div>
              <div className="space-y-1">
                <p className="text-base">Documentation</p>
                <p className="text-sm text-muted-foreground">
                  Learn how to create/import wallets, manage your assets, and trade on the XRP
                  Ledger.
                </p>
              </div>
              <div className="flex gap-3 max-md:flex-col">
                <Button className="w-full justify-between" asChild>
                  <NextLink href="https://docs.tokenos.one" target="_blank">
                    <>
                      <span>Read the docs</span>
                      <ArrowUpRight className="size-4" />
                    </>
                  </NextLink>
                </Button>
                {/* <Button
                  className="w-full justify-between"
                  variant="secondary"
                  onClick={() => setIsOpen(true)}
                >
                  <span>Create wallet</span>
                  <ArrowUpRight className="size-4" />
                </Button> */}
              </div>
            </div>
          </MagicCard>
          <MagicCard className="p-6" gradientSize={160}>
            <div className="space-y-4">
              <div className="flex size-10 items-center justify-center rounded-md border border-primary/10 text-foreground ring-4 ring-primary/[0.05]">
                <BadgeHelp className="size-[18px]" />
              </div>
              <div className="space-y-1">
                <p className="text-base">Support</p>
                <p className="text-sm text-muted-foreground">
                  Need help or have any questions? Feel free to reach out and we&apos;ll be happy to
                  help!
                </p>
              </div>
              <div className="flex gap-3 max-md:flex-col">
                <Button className="w-full justify-between" asChild>
                  <NextLink href="mailto:support@tokenos.one">
                    <>
                      <span>Get in touch</span>
                      <ArrowUpRight className="size-4" />
                    </>
                  </NextLink>
                </Button>
                {/* <Button
                  className="w-full justify-between"
                  variant="secondary"
                  onClick={() => setIsOpen(true)}
                >
                  <span>Create wallet</span>
                  <ArrowUpRight className="size-4" />
                </Button> */}
              </div>
            </div>
          </MagicCard>
          {/* <MagicCard className="p-6" gradientSize={140}>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <HandCoins className="relative bottom-[1px] size-4" />
                <p className="text-sm">Decentralized exchange</p>
              </div>
              <p className="text-base">
                <span className="text-foreground">Trade tokens with ease.</span>{" "}
                <span className="text-muted-foreground"></span>
              </p>
            </div>
          </MagicCard> */}
        </div>
      </div>
    </div>
  );
};
