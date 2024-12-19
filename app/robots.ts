import type { MetadataRoute } from "next";

const robots = (): MetadataRoute.Robots => {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/wallet.davincii.io/", "/main/"],
    },
    sitemap: "https://davincii.io/sitemap.xml",
  };
};

export default robots;
