import { TokenClient } from "./client";
import { constructMetadata } from "@/utils/construct-metadata";
import { Metadata } from "next";
import { formatCurrency } from "@/utils/format-currency";

export const dynamicParams = true;

export const generateStaticParams = async () => {
  const res = await fetch("https://s1.xrplmeta.org/tokens?sort_by=exchanges_24h&limit=1000", {
    next: { revalidate: 60 * 60 * 24 }, // 24 hours
  });
  const data = await res.json();
  // filter through data and just keep the ones that have a name, description, and icon
  const tokens = data.tokens
    .filter(
      (token: {
        issuer: string;
        currency: string;
        meta: { token: { name?: string; description?: string; icon?: string } };
      }) => {
        return token.meta.token.name && token.meta.token.description && token.meta.token.icon;
      },
    )
    .map((token: { issuer: string; currency: string }) => {
      return {
        identifier: `${token.currency}:${token.issuer}`,
      };
    });

  return tokens;
};

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ identifier: string }>;
}): Promise<Metadata> => {
  const decoded = decodeURIComponent((await params).identifier);
  const [currency] = decoded.split(":");
  return constructMetadata({
    title: `${formatCurrency(currency)} • TokenOS`,
    description: `Trade ${formatCurrency(currency)} on TokenOS. View real-time prices, market performance, and recent transactions. Buy, sell, or hold ${formatCurrency(currency)} easily while exploring market insights. `,
  });
};

const TokenPage = async ({ params }: { params: Promise<{ identifier: string }> }) => {
  const awaitedParams = await params;
  const identifier = awaitedParams.identifier;
  console.log("identifier", identifier);
  return <TokenClient identifier={identifier} />;
};

export default TokenPage;
