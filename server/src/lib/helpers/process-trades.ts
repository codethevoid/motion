import { Amount, dropsToXrp, Transaction, TransactionMetadata } from "xrpl";
import { Prisma } from "@prisma/client";

type ProcessedTrade = Prisma.TradeCreateManyInput;

export const processTrades = ({
  transactions,
  timestamp,
  ledger,
}: {
  transactions: { tx_json: Transaction; meta: TransactionMetadata; hash: string }[];
  timestamp: number;
  ledger: number;
}): ProcessedTrade[] => {
  const trades: ProcessedTrade[] = [];

  // Process Payment transactions
  for (const tx of transactions) {
    // skip if the transaction failed
    if (tx.meta?.TransactionResult !== "tesSUCCESS") {
      continue;
    }

    // Process Payment transactions
    if (tx.tx_json.TransactionType === "Payment") {
      // make sure the sender is receiving something and not just sending something
      if (tx.tx_json.Account !== tx.tx_json.Destination) {
        continue;
      }

      // also make sure it is either XRP/IOU or IOU/XRP
      if (
        (typeof tx.tx_json.SendMax === "string" && typeof tx.meta.delivered_amount !== "object") ||
        (typeof tx.meta.delivered_amount === "string" && typeof tx.tx_json.SendMax !== "object")
      ) {
        continue;
      }

      const deliveredAmount = tx.meta.delivered_amount;
      const sendMax = tx.tx_json.SendMax;
      let issuer = "";
      let currency = "";
      let xrpAmount = "0";
      let tokenAmount = "0";
      let price = 0;

      if (typeof sendMax === "string" && typeof deliveredAmount === "object") {
        xrpAmount = sendMax;
        if (
          "value" in deliveredAmount &&
          "issuer" in deliveredAmount &&
          "currency" in deliveredAmount
        ) {
          issuer = deliveredAmount.issuer;
          currency = deliveredAmount.currency;
          tokenAmount = deliveredAmount.value;
          price = dropsToXrp(xrpAmount) / parseFloat(tokenAmount);
        } else {
          // we dont track mp trades
          continue;
        }
      } else if (typeof sendMax === "object" && typeof deliveredAmount === "string") {
        xrpAmount = deliveredAmount;
        if ("value" in sendMax && "issuer" in sendMax && "currency" in sendMax) {
          issuer = sendMax.issuer;
          currency = sendMax.currency;
          tokenAmount = sendMax.value;
          price = dropsToXrp(xrpAmount) / parseFloat(tokenAmount);
        } else {
          // we dont track mp trades
          continue;
        }
      }

      // skip dust trades
      if (Number(xrpAmount) < 1000) continue;

      trades.push({
        ledger,
        timestamp: new Date(timestamp),
        type: "Payment",
        account: tx.tx_json.Account,
        hash: tx.hash,
        currency,
        issuer,
        xrpAmount,
        tokenAmount,
        price: price.toString(),
        affectedNodes:
          tx.meta?.AffectedNodes?.length > 0
            ? JSON.parse(JSON.stringify(tx.meta.AffectedNodes))
            : [],
      });
    }

    // Process OfferCreate transactions
    if (tx.tx_json.TransactionType === "OfferCreate") {
      // skip if transaction does not involve XRP
      if (typeof tx.tx_json.TakerPays !== "string" && typeof tx.tx_json.TakerGets !== "string") {
        continue;
      }

      const takerPays = tx.tx_json.TakerPays;
      const takerGets = tx.tx_json.TakerGets;
      let issuer = "";
      let currency = "";
      let xrpAmount = "0";
      let tokenAmount = "0";
      let price = 0;
      if (typeof takerPays === "string" && typeof takerGets === "object") {
        xrpAmount = takerPays;
        tokenAmount = takerGets.value;
        issuer = takerGets.issuer;
        currency = takerGets.currency;
        price = dropsToXrp(xrpAmount) / parseFloat(tokenAmount);
      } else if (typeof takerGets === "string" && typeof takerPays === "object") {
        xrpAmount = takerGets;
        tokenAmount = takerPays.value;
        issuer = takerPays.issuer;
        currency = takerPays.currency;
        price = dropsToXrp(xrpAmount) / parseFloat(tokenAmount);
      }

      // skip dust trades
      if (Number(xrpAmount) < 1000) continue;

      trades.push({
        ledger,
        timestamp: new Date(timestamp),
        type: "OfferCreate",
        account: tx.tx_json.Account,
        hash: tx.hash,
        currency,
        issuer,
        xrpAmount,
        tokenAmount,
        price: price.toString(),
        affectedNodes:
          tx.meta?.AffectedNodes?.length > 0
            ? JSON.parse(JSON.stringify(tx.meta.AffectedNodes))
            : [],
      });
    }
  }

  return trades;
};
