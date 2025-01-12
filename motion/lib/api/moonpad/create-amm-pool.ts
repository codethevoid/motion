import { xrpClient } from "@/lib/xrp/http-client";
import { Wallet, xrpToDrops, AMMCreate } from "xrpl";

export const createPool = async ({
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
  const [sequence, currentLedger] = await Promise.all([
    xrpClient.getSequence(wallet.address),
    xrpClient.getLedgerIndex(),
  ]);

  const pool: AMMCreate = {
    TransactionType: "AMMCreate",
    Account: wallet.address,
    Amount: {
      currency,
      issuer,
      value: tokenAmount.toString(),
    },
    Amount2: xrpToDrops(xrpAmount),
    TradingFee: poolFee * 1000,
    Fee: "200000",
    Sequence: sequence,
    LastLedgerSequence: currentLedger + 20,
  };

  const signed = wallet.sign(pool);
  const response = await xrpClient.submitAndWait(signed.tx_blob);

  return response;
};
