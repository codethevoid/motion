import { NextResponse } from "next/server";
import type { MetaToken } from "@/components/landing/coin-spotlight";

export const GET = async () => {
  const res = await fetch(`https://s1.xrplmeta.org/tokens?limit=250`);
  if (!res.ok) return NextResponse.json([]);
  const data = await res.json();

  let tokens: MetaToken[] = [];

  data.tokens.forEach(
    (token: {
      currency: string;
      issuer: string;
      meta: { token: { name?: string; icon?: string; description?: string } };
    }) => {
      if (
        token.meta.token.icon &&
        !token.meta.token.icon.includes("null") &&
        token.meta.token.description
      ) {
        tokens.push({
          name: token.meta?.token?.name,
          currency: token.currency,
          issuer: token.issuer,
          icon: token.meta?.token?.icon,
          description: token.meta?.token?.description,
        });
      }
    },
  );

  // if tokens length is odd, remove the last token
  if (tokens.length % 2 !== 0) tokens.pop();
  // if tokens lengh is greater than 50, get length and make it no more than 50
  if (tokens.length > 50) tokens = tokens.slice(0, 50);
  return NextResponse.json(tokens);
};
