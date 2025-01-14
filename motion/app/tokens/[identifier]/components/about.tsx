"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTokenMetrics } from "@/hooks/use-token-metrics";
import { Coin } from "@/components/ui/icons/coin";
import { formatCurrency } from "@/utils/format-currency";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export const About = ({ currency, issuer }: { currency: string; issuer: string }) => {
  const { data: tokenData, isLoading } = useTokenMetrics(currency, issuer);

  if (!isLoading) {
    // if there is no weblinks, description, or icon, return null
    if (
      !tokenData?.meta.token.weblinks?.length &&
      !tokenData?.meta.token.description &&
      !tokenData?.meta.token.icon
    ) {
      return null;
    }
  }

  return (
    <Card className={cn("overflow-hidden p-0", tokenData?.meta.token.banner && "!bg-transparent")}>
      {tokenData?.meta.token.banner && (
        <div className="relative z-[-1]">
          <Image
            src={tokenData?.meta.token.banner}
            alt={tokenData?.meta.token.name}
            width={1200}
            height={630}
            className="aspect-[1200/630] object-cover"
          />
          <div className="absolute inset-0 rounded-t-lg bg-gradient-to-b from-transparent via-transparent to-background" />
        </div>
      )}
      <div className={cn("space-y-4 p-4", tokenData?.meta.token.banner && "-mt-12 pt-0")}>
        <div className="space-y-2">
          <div className="flex justify-center">
            {isLoading ? (
              <Skeleton className="size-16 rounded-md" />
            ) : tokenData?.meta.token.icon ? (
              <img
                src={tokenData?.meta.token.icon}
                alt={tokenData?.meta.token.name}
                className="size-16 rounded-md object-cover"
              />
            ) : (
              <div className="flex size-16 items-center justify-center rounded-md border bg-zinc-950">
                <Coin />
              </div>
            )}
          </div>
          <div>
            {isLoading ? (
              <div className="mx-auto w-fit space-y-1">
                <Skeleton className="h-5 w-24 rounded-md" />
                <Skeleton className="h-[19.5px] w-24 rounded-md" />
              </div>
            ) : (
              <>
                <p className="text-center font-mono text-sm">
                  {formatCurrency(tokenData?.currency ?? "")}
                </p>
                <p className="text-center text-[13px] text-muted-foreground">
                  {tokenData?.meta.token.name || formatCurrency(tokenData?.currency ?? "")}
                </p>
              </>
            )}
          </div>
        </div>
        {isLoading ? (
          <div className="space-y-1">
            <Skeleton className="h-8 w-full rounded-md" />
            <Skeleton className="h-8 w-full rounded-md" />
            <Skeleton className="h-8 w-full rounded-md" />
          </div>
        ) : (
          <>
            {tokenData?.meta.token.weblinks?.length && (
              <div className="flex flex-col gap-1">
                {tokenData?.meta.token.weblinks
                  ?.filter((link) => link.title?.length > 0)
                  .map((link) => (
                    <Button
                      key={`${link.title}-${link.url}`}
                      variant="secondary"
                      size="sm"
                      className="w-full justify-between"
                      asChild
                    >
                      <a href={link.url} target="_blank" rel="noopener noreferrer">
                        <span>
                          {link.title
                            ? link.title.includes("Social Media")
                              ? link.title.split(" ")[0]
                              : link.title
                            : link.type}
                        </span>
                        <ExternalLink className="size-[14px] text-muted-foreground" />
                      </a>
                    </Button>
                  ))}
              </div>
            )}
          </>
        )}
        {/* {isLoading ? (
        <Skeleton className="h-8 w-full rounded-md" />
      ) : (
        tokenData?.meta.token.description && (
          <Accordion type="single" collapsible>
            <AccordionItem
              value="item-1"
              className="rounded-md border border-border/80 bg-secondary/40"
            >
              <AccordionTrigger className="px-3 py-2 text-xs text-muted-foreground hover:no-underline">
                <p className="text-[13px] font-medium">About</p>
              </AccordionTrigger>
              <AccordionContent className="px-3 pb-2">
                <p className="text-[13px] text-muted-foreground">
                  {tokenData?.meta.token.description}
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )
      )} */}
        <div className="space-y-1 rounded-md border bg-secondary/40 p-3">
          <p className="text-[13px] font-medium">About {tokenData?.meta.token.name || ""}</p>
          <p className="text-[13px] text-muted-foreground">
            {tokenData?.meta.token.description || "No description available"}
          </p>
        </div>
      </div>
    </Card>
  );
};
