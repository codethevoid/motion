import { MetadataRoute } from "next";
import prisma from "@/db/prisma";

const getTokens = async () => {
  const [externalRes, tokensFromDb] = await Promise.all([
    fetch("https://s1.xrplmeta.org/tokens?sort_by=exchanges_24h&limit=1000", {
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

  return [...dbTokenParams, ...externalTokenParams].map((token) => {
    return {
      url: `https://motion.zip/tokens/${token.identifier}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    };
  });
};

const sitemap = async (): Promise<MetadataRoute.Sitemap> => {
  const tokens = await getTokens();
  console.log("tokens", tokens);
  return [
    {
      url: "https://motion.zip",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "https://motion.zip/tokens",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: "https://motion.zip/legal/privacy",
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: "https://motion.zip/legal/terms",
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    ...tokens,
  ];
};

export default sitemap;
