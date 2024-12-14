import { NextResponse, NextRequest } from "next/server";
import { withWallet } from "@/lib/auth/with-wallet";
import xrplClient from "@/lib/xrp/xrp-client";
import { getXrpValueInUsd } from "@/lib/xrp/get-xrp-value-in-usd";
import type { Coin } from "@/hooks/use-quote";
import type { BookOffersRequest, BookOffersResponse } from "xrpl";

export const GET = withWallet(async ({ wallet, req }) => {
  try {
    const url = req.nextUrl;
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");
    const { address } = wallet;

    // get xrp balance, fee, value in usd, reserve, available xrp
    const xrpBalance = await xrplClient.getXrpBalance(address);
    const fee = await xrplClient.request({ command: "fee", ledger_index: "current" });
    const networkFee = fee?.result.drops.median_fee || "5000";
    const xrpValueInUsd = await getXrpValueInUsd();
    const reserve = await getTotalReserve(address);
    // and we want to just go ahead and add 2 to the reserve
    // so we can have that for the trustline
    const totalReserve = reserve / 1_000_000 + 0.2;
    const availableXrp = xrpBalance - totalReserve - Number(networkFee) / 1_000_000;

    // get the quote if from and to are provided
    let offer: BookOffersResponse["result"]["offers"][number] | [] = [];
    if (from && to) {
      const fromCoin = JSON.parse(from) as Coin;
      const toCoin = JSON.parse(to) as Coin;

      const toCurrency = "SOLO";
      const hex = Buffer.from(toCurrency).toString("hex").toUpperCase().padEnd(40, "0");

      // get exchange rate
      const res = await xrplClient.request({
        command: "book_offers",
        taker: address,
        taker_pays: { currency: "XRP" },
        taker_gets: { currency: hex, issuer: "rsoLo2S1kiGeCcn6hCUXVrCpGMWLrRrLZz" },
      });

      console.log(res);
      offer = res.result.offers[0] || [];
    }

    return NextResponse.json({
      xrpBalance,
      networkFee,
      xrpValueInUsd,
      availableXrp,
      offer,
    });
  } catch (e) {
    console.error("Error getting swap info", e);
    return NextResponse.json({ error: "Error getting swap info" }, { status: 500 });
  }
});

async function getTotalReserve(address: string) {
  const walletInfo = await xrplClient.request({
    command: "account_info",
    account: address,
    ledger_index: "validated",
  });

  const serverState = await xrplClient.request({ command: "server_state" });

  const ownerCount = walletInfo.result.account_data.OwnerCount;
  const baseReserve = serverState.result.state.validated_ledger?.reserve_base;
  const countReserve = serverState.result.state.validated_ledger?.reserve_inc;
  const ownerReserve = ownerCount * (countReserve || 0);
  const totalReserve = ownerReserve + (baseReserve || 0);

  return totalReserve;
}
