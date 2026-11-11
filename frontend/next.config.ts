import type { NextConfig } from "next";
import path from "path";

const appRoot = process.cwd();
const workspaceRoot = path.resolve(appRoot, "..");
const backendRoot = path.resolve(workspaceRoot, "backend");

const nextConfig: NextConfig = {
  outputFileTracingRoot: workspaceRoot,
  experimental: {
    externalDir: true,
  },
  webpack: (config) => {
    config.resolve.modules = [
      path.resolve(appRoot, "node_modules"),
      ...(config.resolve.modules ?? ["node_modules"]),
    ];
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      "@backend": backendRoot,
    };
    return config;
  },
};

export default nextConfig;
