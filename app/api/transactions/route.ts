import { NextResponse, NextRequest } from "next/server";
import { xrpClient } from "@/lib/xrp/http-client";
import { AccountTxTransaction, dropsToXrp } from "xrpl";

export const GET = async (req: NextRequest) => {
  try {
    const url = req.nextUrl;
    const currency = url.searchParams.get("currency");
    const issuer = url.searchParams.get("issuer");
    if (!currency || !issuer) {
      return NextResponse.json({ error: "Missing currency or issuer" }, { status: 400 });
    }

    const res = await xrpClient.getTransactions(issuer);

    const transactions = res.result.transactions.filter((tx: AccountTxTransaction) => {
      const txType = tx.tx_json?.TransactionType;

      if (txType === "OfferCreate") {
        // const takerGets = tx.tx_json?.TakerGets;
        // const takerPays = tx.tx_json?.TakerPays;
        // if (typeof takerGets === "string") return true;
        // if (typeof takerPays === "string") return true;
        return true;
      }

      if (txType === "Payment") {
        // const amount = tx.tx_json?.Amount;
        // const deliveredAmount = typeof tx.meta === "object" ? tx.meta.delivered_amount : undefined;
        // if (typeof deliveredAmount === "string") return true;
        // if (typeof amount === "string") return true;
        return true;
      }

      return false;
    });

    return NextResponse.json(transactions);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
};
