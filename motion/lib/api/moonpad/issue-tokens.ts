import { xrpClient } from "@/lib/xrp/http-client";
import { Wallet, Payment } from "xrpl";

export const issueTokens = async ({
  issuer,
  hotWallet,
  currency,
  supply,
}: {
  issuer: Wallet;
  hotWallet: Wallet;
  currency: string;
  supply: number;
}) => {
  const [networkFee, sequence, currentLedger] = await Promise.all([
    xrpClient.getNetworkFee(),
    xrpClient.getSequence(issuer.address),
    xrpClient.getLedgerIndex(),
  ]);

  const payment: Payment = {
    TransactionType: "Payment",
    Account: issuer.address,
    Destination: hotWallet.address,
    Amount: {
      currency,
      issuer: issuer.address,
      value: supply.toString(),
    },
    Fee: networkFee.toString(),
    Sequence: sequence,
    LastLedgerSequence: currentLedger + 20,
  };

  const signed = issuer.sign(payment);
  const response = await xrpClient.submitAndWait(signed.tx_blob);
  if (typeof response.result?.meta === "object") {
    return response.result.meta.TransactionResult === "tesSUCCESS";
  }
  return false;
};
