import type { NextConfig } from "next";
import { API_BASE_URL } from "./utils/api-base-url";

const nextConfig: NextConfig = {
  /* config options here */
  poweredByHeader: false,
  experimental: {
    after: true,
  },
  images: {
    remotePatterns: [
      {
        hostname: "cdn.motion.zip",
      },
      {
        hostname: "s1.xrplmeta.org",
      },
      {
        hostname: "s2.xrplmeta.org",
      },
    ],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

export default nextConfig;
