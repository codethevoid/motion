import { NextResponse, NextRequest } from "next/server";
import { withWallet } from "@/lib/auth/with-wallet";
import xrplClient from "@/lib/xrp/xrp-client";
import { processTransaction } from "@/utils/process-transaction";

export const GET = withWallet(async ({ wallet, req }) => {
  try {
    const url = req.nextUrl;
    const marker = url.searchParams.get("marker") || "";

    const allTransactions = await xrplClient.request({
      command: "account_tx",
      account: wallet.address,
    });

    // only going to track transaction types of
    // Payment (send)
    // Payment (receive)
    // OfferCreate (swap)

    const transactions = allTransactions.result.transactions
      .filter((tx) => {
        return (
          tx.tx_json?.TransactionType === "Payment" || tx.tx_json?.TransactionType === "OfferCreate"
        );
      })
      .map((tx) => processTransaction(tx, wallet.address));

    return NextResponse.json(transactions);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
});
