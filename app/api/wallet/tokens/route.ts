import { NextResponse } from "next/server";
import { withWallet } from "@/lib/auth/with-wallet";
import { testAddress } from "@/lib/xrp";
import xrplClient from "@/lib/xrp/xrp-client";
import { getXrpValueInUsd } from "@/lib/xrp/get-xrp-value-in-usd";

export const GET = withWallet(async ({ wallet }) => {
  const { address } = wallet;

  // get balance of XRP
  const accountInfo = await xrplClient.request({
    command: "account_info",
    account: process.env.NODE_ENV === "development" ? testAddress : address,
    ledger_index: "validated",
  });

  // only XRP balance
  const balance = accountInfo.result.account_data.Balance;

  // get other tokens
  const accountLines = await xrplClient.request({
    command: "account_lines",
    account: process.env.NODE_ENV === "development" ? testAddress : address,
    ledger_index: "validated",
  });

  const xrpPrice = await getXrpValueInUsd();

  const tokens: {
    currency: string;
    balance: string;
    balanceInUsd: number;
  }[] = [];
  for (const line of accountLines.result.lines) {
    // get book info and calculate price
    const offers = await xrplClient.request({
      command: "book_offers",
      taker_gets: {
        currency: line.currency,
        issuer: line.account,
      },
      taker_pays: {
        currency: "XRP",
      },
    });

    if (offers.result.offers.length > 0) {
      const bestOffer = offers.result.offers[0];
      const xrpAmount = Number(bestOffer.TakerPays) / 1_000_000;
      const tokenAmount =
        typeof bestOffer.TakerGets === "object"
          ? Number(bestOffer.TakerGets.value)
          : Number(bestOffer.TakerGets) / 1_000_000;
      const priceInXrp = xrpAmount / tokenAmount;
      const priceInUsd = priceInXrp * xrpPrice;
      const balanceInUsd = priceInUsd * Number(line.balance);
      tokens.push({
        currency: line.currency,
        balance: line.balance,
        balanceInUsd,
      });
    } else {
      tokens.push({
        currency: line.currency,
        balance: line.balance,
        balanceInUsd: 0,
      });
    }
  }

  return NextResponse.json({ balance, tokens });
});
