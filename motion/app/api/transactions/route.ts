import { NextResponse, NextRequest } from "next/server";
import { xrpClient } from "@/lib/xrp/http-client";
import { AccountTxTransaction, TransactionMetadata } from "xrpl";

export const GET = async (req: NextRequest) => {
  try {
    const url = req.nextUrl;
    const currency = url.searchParams.get("currency");
    const issuer = url.searchParams.get("issuer");
    if (!currency || !issuer) {
      return NextResponse.json({ error: "Missing currency or issuer" }, { status: 400 });
    }

    const res = await xrpClient.getTransactions(issuer, 200);

    const transactions = res.result.transactions.filter((tx: AccountTxTransaction) => {
      const txType = tx.tx_json?.TransactionType;

      if (typeof tx.meta === "object") {
        if (tx.meta.TransactionResult !== "tesSUCCESS") return false;
      }

      if (txType === "OfferCreate") {
        const offerExecuted = (tx.meta as TransactionMetadata)?.AffectedNodes?.some((node) => {
          const modified =
            "ModifiedNode" in node
              ? node.ModifiedNode
              : "CreatedNode" in node
                ? node.CreatedNode
                : "DeletedNode" in node
                  ? node.DeletedNode
                  : null;

          return modified?.LedgerEntryType === "RippleState";
        });

        if (!offerExecuted) return false;

        // make sure one way is XRP
        if (typeof tx.tx_json?.TakerGets === "string") return true;
        if (typeof tx.tx_json?.TakerPays === "string") return true;
      }

      if (txType === "Payment") {
        if (typeof tx.tx_json?.SendMax === "string") return true;
        if (typeof tx.meta === "object") {
          if (typeof tx.meta.delivered_amount === "string") {
            return true;
          }
        }
      }

      return false;
    });

    return NextResponse.json(transactions);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
};
