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
    ],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

export default nextConfig;
