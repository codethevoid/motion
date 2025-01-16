import { Client } from "xrpl";

export const calculateReserves = async (address: string, client: Client) => {
  const accountInfo = await client.request({
    command: "account_info",
    account: address,
    ledger_index: "validated",
  });
  const baseReserve = 1_000_000;
  const ownerCount = accountInfo.result?.account_data.OwnerCount;
  const ownerReserve = ownerCount * 200_000;
  return baseReserve + ownerReserve;
};
