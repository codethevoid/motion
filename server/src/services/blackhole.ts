import { xrplClient } from "../lib/xrpl-client.js";
import { AccountSet, AccountSetAsfFlags, SetRegularKey, Wallet } from "xrpl";

export const blackhole = async (wallet: Wallet) => {
  const client = await xrplClient.connect();

  // set a dummy regular key
  const setRegularKey: SetRegularKey = {
    TransactionType: "SetRegularKey",
    Account: wallet.classicAddress,
    RegularKey: "rrrrrrrrrrrrrrrrrrrrBZbvji",
  };

  const preparedRegularKey = await client.autofill(setRegularKey);
  const signedRegularKey = wallet.sign(preparedRegularKey);
  const regularKeyRes = await client.submitAndWait(signedRegularKey.tx_blob);

  if (typeof regularKeyRes.result?.meta === "object") {
    if (regularKeyRes.result.meta.TransactionResult !== "tesSUCCESS") {
      console.error("Failed to set regular key");
      return false;
    }
  }

  // disable master key
  const disableMasterKey: AccountSet = {
    TransactionType: "AccountSet",
    Account: wallet.classicAddress,
    SetFlag: AccountSetAsfFlags.asfDisableMaster,
  };

  const preparedDisable = await client.autofill(disableMasterKey);
  const signedDisable = wallet.sign(preparedDisable);
  const disableRes = await client.submitAndWait(signedDisable.tx_blob);

  if (typeof disableRes.result?.meta === "object") {
    return disableRes.result.meta.TransactionResult === "tesSUCCESS";
  }

  return false;
};
