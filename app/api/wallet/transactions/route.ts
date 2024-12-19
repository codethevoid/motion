import { NextResponse } from "next/server";
import { withWallet } from "@/lib/auth/with-wallet";
import { processTransaction } from "@/utils/process-transaction";
import { xrpClient } from "@/lib/xrp/http-client";

export const GET = withWallet(async ({ wallet }) => {
  try {
    // const url = req.nextUrl;
    // const marker = url.searchParams.get("marker") || "";
    // const xrplClient = await getXrpClient();

    const allTransactions = await xrpClient.getTransactions(wallet.address);

    // only going to track transaction types of
    // Payment (send)
    // Payment (receive)
    // OfferCreate (swap)

    const transactions = allTransactions.result.transactions
      .filter((tx) => {
        if (
          tx.tx_json?.TransactionType === "Payment" ||
          tx.tx_json?.TransactionType === "OfferCreate"
        ) {
          if (typeof tx.meta === "object") {
            return tx.meta.TransactionResult === "tesSUCCESS";
          }
        }
      })
      .map((tx) => processTransaction(tx, wallet.address));

    return NextResponse.json(transactions);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
});
