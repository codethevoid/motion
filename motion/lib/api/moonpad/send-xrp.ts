import { Payment } from "xrpl";
import { xrpClient } from "@/lib/xrp/http-client";
import { Wallet, xrpToDrops } from "xrpl";

export const sendXrp = async (sender: Wallet, receiver: string, amount: number) => {
  const [networkFee, sequence, currentLedger] = await Promise.all([
    xrpClient.getNetworkFee(),
    xrpClient.getSequence(sender.address),
    xrpClient.getLedgerIndex(),
  ]);

  const payment: Payment = {
    TransactionType: "Payment",
    Account: sender.address,
    Destination: receiver,
    Amount: xrpToDrops(amount),
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
