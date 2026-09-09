import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Backend dev / local
      { protocol: "http", hostname: "localhost", port: "8000" },
      // Tambahkan domain backend production di sini setelah diketahui,
      // contoh:
      // { protocol: "https", hostname: "*.railway.app" },
      // { protocol: "https", hostname: "example.com" },
    ],
  },
};

export default nextConfig;
