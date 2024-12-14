import { NextResponse } from "next/server";
import { withWallet } from "@/lib/auth/with-wallet";
import { getXrpValueInUsd } from "@/lib/xrp/get-xrp-value-in-usd";
import xrplClient from "@/lib/xrp/xrp-client";

export const GET = withWallet(async ({ req }) => {
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

    // get the price of the currency in USD if it's not XRP (custom token)
    const res = await xrplClient.request({
      command: "book_offers",
      taker_gets: {
        currency,
        issuer: issuer as string,
      },
      taker_pays: {
        currency: "XRP",
      },
      ledger_index: "current",
    });

    const offer = res?.result.offers[0];
    if (!offer) return NextResponse.json({ price: 0 });

    const xrpPrice = await getXrpValueInUsd();
    const xrpAmount = Number(offer.TakerPays) / 1_000_000;
    const tokenAmount =
      typeof offer.TakerGets === "object"
        ? Number(offer.TakerGets.value)
        : Number(offer.TakerGets) / 1_000_000;
    const priceInXrp = xrpAmount / tokenAmount;
    const priceInUsd = priceInXrp * xrpPrice;

    return NextResponse.json({ price: priceInUsd });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ price: 0 });
  }
});
