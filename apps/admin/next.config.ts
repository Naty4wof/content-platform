import type { NextConfig } from "next";

const nextConfig = {
  transpilePackages: ["@repo/ui", "@repo/api", "@repo/db"],
};

export default nextConfig;
