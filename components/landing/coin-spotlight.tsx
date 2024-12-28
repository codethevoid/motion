"use client";

import Marquee from "../ui/marquee";
import { Card } from "../ui/card";
import { useMetaTokens } from "@/hooks/use-meta-tokens";
import { useMemo } from "react";
import { formatCurrency } from "@/utils/format-currency";
import NextLink from "next/link";
import { RainbowButton } from "../ui/rainbow-button";

export type MetaToken = {
  name?: string;
  currency: string;
  issuer: string;
  icon: string;
  description: string;
};

export const CoinSpotlight = () => {
  const { tokens } = useMetaTokens();
  console.log(tokens);

  const [firstRow, secondRow] = useMemo(() => {
    if (!tokens) return [[], []];
    const half = Math.ceil(tokens.length / 2);
    return [tokens.slice(0, half), tokens.slice(half)];
  }, [tokens]);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-center text-3xl font-bold max-sm:text-xl max-sm:tracking-tight">
          Your tokens, your way
        </h2>
        <p className="mx-auto max-w-lg text-center text-sm text-muted-foreground max-sm:max-w-xs max-sm:text-[13px]">
          Gain access to thousands of tokens and start trading with ease directly from our
          decentralized exchange using our self-custody wallet.
        </p>
      </div>
      <div className="relative flex h-[265px] w-full flex-col items-center justify-center overflow-hidden">
        <Marquee pauseOnHover className="[--duration:80s]">
          {firstRow.map((token) => (
            <CoinCard key={`${token.currency}-${token.issuer}`} {...token} />
          ))}
        </Marquee>
        <Marquee reverse pauseOnHover className="[--duration:80s]">
          {secondRow.map((token) => (
            <CoinCard key={`${token.currency}-${token.issuer}`} {...token} />
          ))}
        </Marquee>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-white dark:from-background"></div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-white dark:from-background"></div>
      </div>
      <div className="mx-auto w-full max-w-[200px]">
        <NextLink href="/tokens">
          <RainbowButton className="h-10 w-full px-8 transition-[scale_300ms] ease-in-out hover:scale-[1.02]">
            Explore all tokens
          </RainbowButton>
        </NextLink>
      </div>
    </div>
  );
};

const CoinCard = (token: MetaToken) => {
  return (
    <NextLink href={`/tokens/${token.currency}:${token.issuer}`}>
      <Card className="h-full w-64 cursor-pointer p-4 transition-colors dark:hover:bg-secondary/60">
        <div className="flex items-center gap-2">
          <img
            className="size-8 rounded-md"
            alt={token.name || formatCurrency(token.currency)}
            src={token.icon}
          />
          <div>
            <p className="text-[13px] text-foreground">
              {token.name ? token.name : formatCurrency(token.currency)}
            </p>
            <p className="text-xs text-muted-foreground">{formatCurrency(token.currency)}</p>
          </div>
        </div>
        <p className="mt-2 line-clamp-2 text-[13px]">{token.description}</p>
      </Card>
    </NextLink>
  );
};
