import { xrpClient } from "@/lib/xrp/http-client";
import { Wallet, Payment } from "xrpl";

export const fundWallet = async (issuer: string, sender: Wallet) => {
  const [networkFee, sequence, currentLedger] = await Promise.all([
    xrpClient.getNetworkFee(),
    xrpClient.getSequence(sender.address),
    xrpClient.getLedgerIndex(),
  ]);

  const payment: Payment = {
    TransactionType: "Payment",
    Account: sender.address,
    Destination: issuer,
    Amount: process.env.NODE_ENV === "development" ? "1010000" : "1010000", // 10.01 xrp in dev, 1.01xrp in prod
    Fee: networkFee.toString(),
    Sequence: sequence,
    LastLedgerSequence: currentLedger + 20,
  };

  const signed = sender.sign(payment);
  const response = await xrpClient.submitAndWait(signed.tx_blob);
  if (typeof response.result?.meta === "object") {
    return response.result.meta.TransactionResult === "tesSUCCESS";
  }
  return false;
};
