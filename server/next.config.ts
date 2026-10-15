import type { NextConfig } from 'next';

// API only: every route lives under app/api. The client app proxies /api here.
const nextConfig: NextConfig = {
  serverExternalPackages: ['better-sqlite3'],
};

export default nextConfig;
