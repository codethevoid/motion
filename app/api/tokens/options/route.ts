import { withWallet } from "@/lib/auth/with-wallet";
import { NextRequest, NextResponse } from "next/server";
import { xrpMeta } from "@/lib/xrp/meta";
import type { Token } from "@/hooks/use-token-options";

export const GET = async (req: NextRequest) => {
  try {
    const url = req.nextUrl;
    const nameLike = url.searchParams.get("name_like") || "";
    const limit = url.searchParams.get("limit") || 80;
    const res = await fetch(`https://s1.xrplmeta.org/tokens?name_like=${nameLike}&limit=${limit}`);
    if (!res.ok) throw new Error("Error fetching tokens");
    const data = await res.json();
    console.log(data);

    const tokens: Token[] = data.tokens.map(
      (token: {
        currency: string;
        issuer: string;
        meta: { token: { name: string; icon: string; description: string } };
      }) => {
        const rawCurrency = token.currency;
        // if currency is 40 characters, convert to string
        if (token.currency.length === 40) {
          token.currency = Buffer.from(token.currency, "hex").toString("utf-8").replace(/\0/g, "");
        }

        return {
          rawCurrency,
          currency: token.currency,
          issuer: token.issuer,
          icon: token.meta?.token?.icon,
          name: token?.meta?.token?.name,
          description: token?.meta?.token?.description,
        };
      },
    );

    // if there is no search param, add xrp to the front of the array
    // to make it the first option
    if (!nameLike) {
      tokens.unshift({ ...xrpMeta, description: "The native currency of the XRP Ledger" });
      tokens.pop();
    }
    return NextResponse.json(tokens);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error fetching tokens" }, { status: 500 });
  }
};
