import path from "node:path";
import type { NextConfig } from "next";
import { apiOrigin, loadRootEnv, uploadImageRemotePatterns } from "../../scripts/load-root-env.mjs";

loadRootEnv(__dirname);

const API_ORIGIN = apiOrigin();

const nextConfig: NextConfig = {
  transpilePackages: ["@echo/shared"],
  turbopack: {
    root: path.join(__dirname, "../.."),
  },
  async rewrites() {
    return [
      {
        source: "/echo-api/:path*",
        destination: `${API_ORIGIN}/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${API_ORIGIN}/uploads/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      ...uploadImageRemotePatterns() as Array<{
        protocol: "http" | "https";
        hostname: string;
        port?: string;
        pathname: string;
      }>,
    ],
  },
};

export default nextConfig;
