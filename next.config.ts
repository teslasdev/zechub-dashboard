import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  
  // Exclude Nillion SDK from client-side bundle (server-only)
  serverExternalPackages: ['@nillion/nuc', '@nillion/secretvaults'],
  
  // Empty turbopack config to silence the warning
  // Nillion SDK runs only in API routes (server-side)
  turbopack: {},
};

export default nextConfig;
