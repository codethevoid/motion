import { Wallet, Payment } from "xrpl";
import { xrpClient } from "./http-client";

export const burnLp = async ({
  wallet,
  lpTokenCurrency,
  ammAccount,
  value,
}: {
  wallet: Wallet;
  lpTokenCurrency: string;
  ammAccount: string;
  value: string;
}) => {
  const [networkFee, sequence, currentLedger] = await Promise.all([
    xrpClient.getNetworkFee(),
    xrpClient.getSequence(wallet.address),
    xrpClient.getLedgerIndex(),
  ]);

  const burnTx: Payment = {
    TransactionType: "Payment",
    Account: wallet.address,
    Destination: ammAccount,
    Amount: {
      currency: lpTokenCurrency,
      issuer: ammAccount,
      value,
    },
    Fee: networkFee.toString(),
    Sequence: sequence,
    LastLedgerSequence: currentLedger + 20,
  };

  const signed = wallet.sign(burnTx);
  await xrpClient.submit(signed.tx_blob);
};
