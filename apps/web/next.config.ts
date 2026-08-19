import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: 'standalone',
  transpilePackages: [
    '@trace/auth',
    '@trace/db',
    '@trace/env',
    '@trace/github',
    '@trace/schema',
    '@trace/ui',
    '@trace/core',
    '@trace/analysis',
    '@trace/rules',
    '@trace/models',
    '@trace/logger',
    '@trace/config',
  ],
  serverExternalPackages: ['pg', 'pg-cloudflare'],
  webpack(config, { isServer }) {
    if (isServer) {
      config.resolve ??= {};
      config.resolve.conditionNames = Array.from(
        new Set(['workerd', ...(config.resolve.conditionNames ?? ['...'])]),
      );
      config.externals = [
        'cloudflare:sockets',
        ...(Array.isArray(config.externals) ? config.externals : []),
      ];
    }
    return config;
  },
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
