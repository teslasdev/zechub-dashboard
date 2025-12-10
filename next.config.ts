import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  
  // Exclude Nillion SDK from client-side bundle (server-only)
  serverExternalPackages: ['@nillion/nuc', '@nillion/secretvaults'],
  
  // Enable external packages in serverless functions
  experimental: {
    serverComponentsExternalPackages: ['@nillion/nuc', '@nillion/secretvaults'],
  },
  
  // Webpack config for native modules
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        '@nillion/nuc': 'commonjs @nillion/nuc',
        '@nillion/secretvaults': 'commonjs @nillion/secretvaults',
      });
    }
    return config;
  },
  
  // Empty turbopack config to silence the warning
  // Nillion SDK runs only in API routes (server-side)
  turbopack: {},
};

export default nextConfig;
