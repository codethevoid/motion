import { NextResponse, NextRequest } from "next/server";
import { getXrpValueInUsd } from "@/lib/xrp/get-xrp-value-in-usd";

export const GET = async (req: NextRequest) => {
  try {
    const url = req.nextUrl;
    const currency = url.searchParams.get("currency") || "";
    const issuer = url.searchParams.get("issuer") || "";

    if (!currency) return NextResponse.json({ price: 0 });
    if (!issuer && currency !== "XRP") return NextResponse.json({ price: 0 });

    if (currency === "XRP") {
      const price = await getXrpValueInUsd();
      return NextResponse.json({ price });
    }

    const res = await fetch(`https://s1.xrplmeta.org/token/${currency}:${issuer}`);
    if (!res.ok) return NextResponse.json({ price: 0 });
    const data = await res.json();
    const price = Number(data.metrics?.price); // price for token/XRP
    const xrpPrice = await getXrpValueInUsd();
    const priceInUsd = price * xrpPrice;

    return NextResponse.json({ price: priceInUsd });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ price: 0 });
  }
};
