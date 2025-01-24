import { TokenClient } from "./client";
import { constructMetadata } from "@/utils/construct-metadata";
import { Metadata } from "next";
import { formatCurrency } from "@/utils/format-currency";
import prisma from "@/db/prisma";
import { API_BASE_URL } from "@/utils/api-base-url";

export const dynamicParams = true;

export const generateStaticParams = async () => {
  const [externalRes, tokensFromDb] = await Promise.all([
    fetch(`${API_BASE_URL}/tokens?limit=1000`, {
      next: { revalidate: 60 * 60 * 24, tags: ["tokens"] }, // 24 hours
    }),
    prisma.token.findMany({
      select: { issuer: true, currencyHex: true },
    }),
  ]);
  const data = await externalRes.json();
  // filter through data and just keep the ones that have a name, description, and icon
  // get tokens from the database

  const dbIdentifiers = new Set(
    tokensFromDb.map((token) => `${token.currencyHex}:${token.issuer}`),
  );

  const dbTokenParams = tokensFromDb.map((token) => ({
    identifier: `${token.currencyHex}:${token.issuer}`,
  }));

  // Then get external tokens that aren't in our DB
  const externalTokenParams = data.tokens
    .filter(
      (token: {
        issuer: string;
        currency: string;
        meta: { token: { name?: string; description?: string; icon?: string } };
      }) => {
        const identifier = `${token.currency}:${token.issuer}`;
        return (
          token.meta.token.name &&
          token.meta.token.description &&
          token.meta.token.icon &&
          !dbIdentifiers.has(identifier)
        );
      },
    )
    .map((token: { issuer: string; currency: string }) => ({
      identifier: `${token.currency}:${token.issuer}`,
    }));

  return [...dbTokenParams, ...externalTokenParams];
};

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ identifier: string }>;
}): Promise<Metadata> => {
  const decoded = decodeURIComponent((await params).identifier);
  const [currency, issuer] = decoded.split(":");

  const token = await prisma.token.findFirst({
    where: { AND: [{ currencyHex: currency }, { issuer }] },
    select: { banner: true, name: true },
  });

  if (!token) {
    return constructMetadata({
      title: `${formatCurrency(currency)} • motion.zip`,
      description: `Trade ${formatCurrency(currency)} on Motion. View real-time prices, market performance, and recent transactions. Buy, sell, or hold ${formatCurrency(currency)} easily while exploring market insights.`,
    });
  }

  return constructMetadata({
    title: `${token.name || formatCurrency(currency)} • motion.zip`,
    description: `Trade ${token.name || formatCurrency(currency)} on Motion. View real-time prices, market performance, and recent transactions. Buy, sell, or hold ${token.name || formatCurrency(currency)} easily while exploring market insights.`,
    image: token.banner,
  });
};

const TokenPage = async ({ params }: { params: Promise<{ identifier: string }> }) => {
  const awaitedParams = await params;
  const identifier = awaitedParams.identifier;
  console.log("identifier", identifier);
  return <TokenClient identifier={identifier} />;
};

export default TokenPage;
