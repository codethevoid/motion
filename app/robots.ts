import type { MetadataRoute } from "next";

const robots = (): MetadataRoute.Robots => {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/wallet.tokenos.one/", "/main/"],
    },
    sitemap: "https://tokenos.one/sitemap.xml",
  };
};

export default robots;
