import { xrpClient } from "@/lib/xrp/http-client";
import { AccountSet, AccountSetAsfFlags, SetRegularKey, Wallet } from "xrpl";

export const blackhole = async (wallet: Wallet) => {
  const [sequence, currentLedger] = await Promise.all([
    xrpClient.getSequence(wallet.address),
    xrpClient.getLedgerIndex(),
  ]);

  // First, set a dummy regular key
  const setRegularKey: SetRegularKey = {
    TransactionType: "SetRegularKey",
    Account: wallet.address,
    RegularKey: "rrrrrrrrrrrrrrrrrrrrBZbvji",
    Fee: "50",
    Sequence: sequence,
    LastLedgerSequence: currentLedger + 50,
  };

  const signedRegularKey = wallet.sign(setRegularKey);
  const regularKeyResult = await xrpClient.submitAndWait(signedRegularKey.tx_blob);

  if (typeof regularKeyResult.result?.meta === "object") {
    if (regularKeyResult.result.meta.TransactionResult !== "tesSUCCESS") {
      console.error("Failed to set regular key");
      return false;
    }
  }

  await new Promise((resolve) => setTimeout(resolve, 1500));

  const [sequenceTwo, currentLedgerTwo] = await Promise.all([
    xrpClient.getSequence(wallet.address),
    xrpClient.getLedgerIndex(),
  ]);

  // Then disable the master key
  const disableMasterKey: AccountSet = {
    TransactionType: "AccountSet",
    Account: wallet.address,
    SetFlag: AccountSetAsfFlags.asfDisableMaster,
    Fee: "50",
    Sequence: sequenceTwo,
    LastLedgerSequence: currentLedgerTwo + 20,
  };

  const signedDisable = wallet.sign(disableMasterKey);
  const res = await xrpClient.submitAndWait(signedDisable.tx_blob);

  if (typeof res.result?.meta === "object") {
    if (res.result.meta.TransactionResult !== "tesSUCCESS") {
      console.error("Failed to disable master key");
      return false;
    }
  }

  return true;
};
