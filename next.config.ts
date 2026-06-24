import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Минимальный самодостаточный сервер (.next/standalone) для лёгкого Docker-образа.
  output: "standalone",
};

export default nextConfig;
