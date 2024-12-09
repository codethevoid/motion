import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        hostname: "cdn.qryptic.io",
      },
    ],
  },
};

export default nextConfig;
