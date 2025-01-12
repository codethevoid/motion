import { AccountTxTransaction, TransactionMetadata, Amount, MPTAmount } from "xrpl";

export type Transaction = {
  type: "Payment" | "OfferCreate";
  direction: "receive" | "send" | "swap";
  amountDelivered: string | Amount | MPTAmount | undefined;
  takerPays: Amount | undefined;
  takerGets: Amount | undefined;
  fee: string | undefined;
  hash: string | undefined;
  date: number | undefined;
  status: string;
  validated: boolean;
};

export const processTransaction = (
  transaction: AccountTxTransaction,
  address: string,
): Transaction | undefined => {
  const tx_json = transaction.tx_json;
  const meta = transaction.meta;
  const type = tx_json?.TransactionType;

  switch (type) {
    case "Payment":
      const destination = tx_json?.Destination;
      return {
        type: "Payment",
        direction: destination === address ? "receive" : "send",
        amountDelivered: typeof meta === "string" ? meta : meta.delivered_amount,
        takerPays: undefined,
        takerGets: undefined,
        fee: tx_json?.Fee,
        hash: transaction.hash,
        date: tx_json?.date,
        status: typeof meta === "string" ? meta : meta.TransactionResult,
        validated: transaction.validated,
      };
    case "OfferCreate":
      return {
        type: "OfferCreate",
        direction: "swap",
        amountDelivered: undefined,
        takerPays: tx_json?.TakerPays,
        takerGets: tx_json?.TakerGets,
        fee: tx_json?.Fee,
        hash: transaction.hash,
        date: tx_json?.date,
        status: typeof meta === "string" ? meta : meta.TransactionResult,
        validated: transaction.validated,
      };
  }
};
