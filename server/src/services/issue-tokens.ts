import { xrplClient } from "../lib/xrpl-client";
import { Wallet, Payment } from "xrpl";

export const issueTokens = async ({
  from,
  to,
  currency,
  amount,
}: {
  from: Wallet;
  to: string;
  currency: string;
  amount: number;
}) => {
  const client = await xrplClient.connect();

  const payment: Payment = {
    TransactionType: "Payment",
    Account: from.classicAddress,
    Destination: to,
    Amount: {
      currency,
      issuer: from.classicAddress,
      value: amount.toString(),
    },
  };

  const prepared = await client.autofill(payment);
  const signed = from.sign(prepared);
  const res = await client.submitAndWait(signed.tx_blob);

  if (typeof res.result?.meta === "object") {
    return res.result.meta.TransactionResult === "tesSUCCESS";
  }

  return false;
};
