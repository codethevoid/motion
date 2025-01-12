import { NextResponse } from "next/server";
import { xrpClient } from "@/lib/xrp/http-client";
import { withWallet } from "@/lib/auth/with-wallet";
import { TrustlineWithMeta } from "@/hooks/use-trustlines";
import prisma from "@/db/prisma";
import { formatCurrency } from "@/utils/format-currency";

export const GET = withWallet(async ({ wallet }) => {
  const response = await xrpClient.getAccountLines(wallet.address);
  const trustlines = response.result?.lines || [];

  const trustlinesWithMeta: TrustlineWithMeta[] = [];

  for (const trustline of trustlines) {
    let formattedCurrency: string = trustline.currency;
    formattedCurrency = formatCurrency(formattedCurrency);

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

    const tokenInfo = await prisma.token.findFirst({
      where: {
        currency: formattedCurrency,
        issuer: trustline.account,
      },
    });

    trustlinesWithMeta.push({
      ...trustline,
      formattedCurrency,
      icon: tokenInfo?.icon || icon,
      name: tokenInfo?.name || name,
    });
  }

  return NextResponse.json(trustlinesWithMeta);
});
