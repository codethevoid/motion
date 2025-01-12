import type { MetadataRoute } from "next";

const robots = (): MetadataRoute.Robots => {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/proxy",
    },
    sitemap: "https://motion.zip/sitemap.xml",
  };
};

export default robots;
