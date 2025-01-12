import { xrplClient } from "../lib/xrpl-client";
import { Wallet, AMMCreate, xrpToDrops } from "xrpl";

export const createAmmPool = async ({
  wallet,
  issuer,
  tokenAmount,
  xrpAmount,
  poolFee,
  currency,
}: {
  wallet: Wallet;
  issuer: string;
  tokenAmount: number;
  xrpAmount: number;
  poolFee: number;
  currency: string;
}) => {
  const client = await xrplClient.connect();

  const createPool: AMMCreate = {
    TransactionType: "AMMCreate",
    Account: wallet.classicAddress,
    Amount: {
      currency,
      issuer,
      value: tokenAmount.toString(),
    },
    Amount2: xrpToDrops(xrpAmount.toFixed(6)),
    TradingFee: poolFee * 1000,
  };

  const prepared = await client.autofill(createPool);
  const signed = wallet.sign(prepared);
  const res = await client.submitAndWait(signed.tx_blob);
  return res;
};
