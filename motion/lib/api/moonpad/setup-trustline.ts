import { xrpClient } from "@/lib/xrp/http-client";
import { Wallet, TrustSet } from "xrpl";

export const setupTrustline = async (issuer: string, wallet: Wallet, currency: string) => {
  const [networkFee, sequence, currentLedger] = await Promise.all([
    xrpClient.getNetworkFee(),
    xrpClient.getSequence(wallet.address),
    xrpClient.getLedgerIndex(),
  ]);

  const trustline: TrustSet = {
    TransactionType: "TrustSet",
    Account: wallet.address,
    LimitAmount: {
      currency,
      issuer,
      value: "100000000000000", // some stupid high number
    },
    Fee: networkFee.toString(),
    Sequence: sequence,
    LastLedgerSequence: currentLedger + 20,
  };

  const signed = wallet.sign(trustline);
  const response = await xrpClient.submitAndWait(signed.tx_blob);
  if (typeof response.result?.meta === "object") {
    return response.result.meta.TransactionResult === "tesSUCCESS";
  }
  return false;
};
