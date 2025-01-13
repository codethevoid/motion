import { Wallet, xrpToDrops, Payment } from "xrpl";
import { xrplClient } from "../lib/xrpl-client.js";

export const sendXrp = async ({
  from,
  to,
  amount,
}: {
  from: Wallet;
  to: string;
  amount: number;
}) => {
  const client = await xrplClient.connect();

  const payment: Payment = {
    TransactionType: "Payment",
    Account: from.classicAddress,
    Amount: xrpToDrops(amount.toFixed(6)),
    Destination: to,
  };

  const prepared = await client.autofill(payment);
  const signed = from.sign(prepared);
  const tx = await client.submitAndWait(signed.tx_blob);

  if (typeof tx.result?.meta === "object") {
    if (tx.result.meta.TransactionResult !== "tesSUCCESS") {
      return false;
    }
  }

  return true;
};
