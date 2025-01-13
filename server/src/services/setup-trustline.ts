import { xrplClient } from "../lib/xrpl-client.js";
import { Wallet, TrustSet } from "xrpl";

export const setupTrustline = async ({
  wallet,
  issuer,
  currency,
}: {
  wallet: Wallet;
  issuer: string;
  currency: string;
}) => {
  const client = await xrplClient.connect();

  const trustline: TrustSet = {
    TransactionType: "TrustSet",
    Account: wallet.classicAddress,
    LimitAmount: {
      currency,
      issuer,
      value: "100000000000000",
    },
  };

  const prepared = await client.autofill(trustline);
  const signed = wallet.sign(prepared);
  const res = await client.submitAndWait(signed.tx_blob);

  if (typeof res.result?.meta === "object") {
    return res.result.meta.TransactionResult === "tesSUCCESS";
  }
  return false;
};
