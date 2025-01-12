import { NextResponse } from "next/server";
import { withWallet } from "@/lib/auth/with-wallet";
import { xrpMeta } from "@/lib/xrp/meta";
import { dropsToXrp, xrpToDrops } from "xrpl";
import { xrpClient } from "@/lib/xrp/http-client";
import prisma from "@/db/prisma";
import { formatCurrency } from "@/utils/format-currency";

// Route used to getting available balances for wallet
// used for sending crypto to other wallets
export const GET = withWallet(async ({ wallet }) => {
  try {
    // const xrplClient = await getXrpClient();
    const balancesRes = await xrpClient.getBalances(wallet.address);

    const balances: {
      rawCurrency: string;
      currency: string;
      value: string;
      name: string | undefined;
      icon: string | undefined;
      issuer: string | undefined;
    }[] = [];

    for (const balance of balancesRes) {
      if (balance.currency === "XRP") {
        // calculate reserve
        const networkFee = await xrpClient.getNetworkFee();
        const reserve = await calculateReserves(wallet.address);
        const balanceInDrops = xrpToDrops(Number(balance.value));
        const availableBalance = Number(balanceInDrops) - reserve - networkFee;
        const availableBalanceInXrp = dropsToXrp(availableBalance);
        const { icon, name } = xrpMeta;

        balances.push({
          rawCurrency: "XRP",
          currency: "XRP",
          value: availableBalanceInXrp.toString(),
          icon,
          name,
          issuer: undefined,
        });
        continue;
      }

      if (balance.value === "0") continue;

      // conver to string if currency is hex
      const rawCurrency = balance.currency;
      balance.currency = formatCurrency(balance.currency);

      const metadataRes = await fetch(
        `https://s1.xrplmeta.org/token/${balance.currency}:${balance.issuer}`,
      );

      let icon;
      let name;
      if (metadataRes.ok) {
        const data = await metadataRes.json();
        icon = data.meta?.token?.icon;
        name = data.meta?.token?.name;
      }

      const tokenInfo = await prisma.token.findFirst({
        where: {
          currency: balance.currency,
          issuer: balance.issuer,
        },
      });

      balances.push({
        rawCurrency,
        ...balance,
        icon: tokenInfo?.icon || icon,
        name: tokenInfo?.name || name,
        issuer: balance.issuer || undefined,
      });
    }

    return NextResponse.json(balances);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch balances" }, { status: 500 });
  }
});

async function calculateReserves(address: string) {
  const accountInfo = await xrpClient.getAccountInfo(address);
  // Base reserve (1 XRP)
  const baseReserve = 1_000_000; // in drops
  // Owner reserve (0.2 XRP per owned object)
  const ownerCount = accountInfo.result.account_data.OwnerCount;
  const ownerReserve = ownerCount * 200_000; // 0.2 XRP = 200,000 drops per item
  return baseReserve + ownerReserve;
}
