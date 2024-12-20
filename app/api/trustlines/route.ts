import { NextResponse } from "next/server";
import { xrpClient } from "@/lib/xrp/http-client";
import { withWallet } from "@/lib/auth/with-wallet";
import { TrustlineWithMeta } from "@/hooks/use-trustlines";

export const GET = withWallet(async ({ wallet }) => {
  const response = await xrpClient.getAccountLines(wallet.address);
  const trustlines = response.result?.lines || [];

  const trustlinesWithMeta: TrustlineWithMeta[] = [];

  for (const trustline of trustlines) {
    let formattedCurrency: string = trustline.currency;
    if (trustline.currency.length === 40) {
      formattedCurrency = Buffer.from(trustline.currency, "hex")
        .toString("utf-8")
        .replace(/\0/g, "");
    }

    const metadataRes = await fetch(
      `https://s1.xrplmeta.org/token/${formattedCurrency}:${trustline.account}`,
    );

    let icon: string | undefined = undefined;
    let name: string | undefined = undefined;
    if (metadataRes.ok) {
      const data = await metadataRes.json();
      icon = data.meta?.token?.icon;
      name = data.meta?.token?.name;
    }

    trustlinesWithMeta.push({
      ...trustline,
      formattedCurrency,
      icon,
      name,
    });
  }

  return NextResponse.json(trustlinesWithMeta);
});
