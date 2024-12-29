import { MetadataRoute } from "next";

const getTokens = async () => {
  const res = await fetch("https://s1.xrplmeta.org/tokens?sort_by=exchanges_24h&limit=1000", {
    next: { revalidate: 60 * 60 * 24 }, // 24 hours
  });
  const data = await res.json();
  return data.tokens
    .filter(
      (token: { meta: { token: { name?: string; icon?: string; description?: string } } }) => {
        return token.meta.token.name && token.meta.token.icon && token.meta.token.description;
      },
    )
    .map((token: { currency: string; issuer: string }) => {
      return {
        url: `https://tokenos.one/tokens/${token.currency}:${token.issuer}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      };
    });
};

const sitemap = async (): Promise<MetadataRoute.Sitemap> => {
  const tokens = await getTokens();
  console.log("tokens", tokens);
  return [
    {
      url: "https://tokenos.one",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "https://tokenos.one/tokens",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: "https://tokenos.one/legal/privacy",
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: "https://tokenos.one/legal/terms",
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    ...tokens,
  ];
};

export default sitemap;
