import type { NextConfig } from "next";
import { resolve } from "path";

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
