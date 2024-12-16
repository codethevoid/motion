import { NextResponse } from "next/server";
import { withWallet } from "@/lib/auth/with-wallet";
import xrplClient from "@/lib/xrp/xrp-client";

export const GET = withWallet(async ({ wallet, req }) => {
  try {
    const url = req.nextUrl;
    const currency = url.searchParams.get("currency");
    const issuer = url.searchParams.get("issuer");

    if (!currency) return NextResponse.json({ balance: 0 });
    if (!issuer && currency !== "XRP") return NextResponse.json({ balance: 0 });

    if (currency === "XRP") {
      const balance = await xrplClient.getXrpBalance(wallet.address);
      const fee = await xrplClient.request({ command: "fee", ledger_index: "current" });
      const networkFee = Number(fee?.result.drops.median_fee) * 2 || 5000 * 2; // 2x because we need to pay for the swap and the trustline
      const reserve = await getTotalReserve(wallet.address);
      // and we want to just go ahead and add 2 to the reserve
      // so we can have that for the trustline
      const totalReserve = reserve / 1_000_000 + 0.2;
      const availableXrp = balance - totalReserve - Number(networkFee) / 1_000_000;
      return NextResponse.json({ balance: availableXrp });
    }

    // get the balance of the token
    const balances = await xrplClient.getBalances(wallet.address);
    const balance = balances.find((b) => b.currency === currency && b.issuer === issuer);
    if (!balance) return NextResponse.json({ balance: 0 });

    return NextResponse.json({ balance: Number(balance.value) });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error fetching balance" }, { status: 500 });
  }
});

async function getTotalReserve(address: string) {
  const walletInfo = await xrplClient.request({
    command: "account_info",
    account: address,
    ledger_index: "validated",
  });

  const serverState = await xrplClient.request({ command: "server_state" });

  const ownerCount = walletInfo.result.account_data.OwnerCount;
  const baseReserve = serverState.result.state.validated_ledger?.reserve_base;
  const countReserve = serverState.result.state.validated_ledger?.reserve_inc;
  const ownerReserve = ownerCount * (countReserve || 0);
  const totalReserve = ownerReserve + (baseReserve || 0);

  return totalReserve;
}
