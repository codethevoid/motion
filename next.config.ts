import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  poweredByHeader: false,
  experimental: {
    after: true,
  },
  images: {
    remotePatterns: [
      {
        hostname: "cdn.qryptic.io",
      },
    ],
  },
};

export default nextConfig;
