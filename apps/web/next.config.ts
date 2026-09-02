import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { NextConfig } from 'next';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
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
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@trace/auth': path.resolve(rootDir, 'packages/auth/src/index.ts'),
      '@trace/db': path.resolve(rootDir, 'packages/db/src/index.ts'),
      '@trace/env': path.resolve(rootDir, 'packages/env/src/index.ts'),
      '@trace/github': path.resolve(rootDir, 'packages/trace-github/src/index.ts'),
      '@trace/schema': path.resolve(rootDir, 'packages/trace-schema/src/index.ts'),
      '@trace/ui': path.resolve(rootDir, 'packages/ui/src/index.ts'),
      '@trace/core': path.resolve(rootDir, 'packages/trace-core/src/index.ts'),
      '@trace/analysis': path.resolve(rootDir, 'packages/trace-analysis/src/index.ts'),
      '@trace/rules': path.resolve(rootDir, 'packages/trace-rules/src/index.ts'),
      '@trace/models': path.resolve(rootDir, 'packages/trace-models/src/index.ts'),
      '@trace/logger': path.resolve(rootDir, 'packages/logger/src/index.ts'),
      '@trace/config': path.resolve(rootDir, 'packages/config/src/index.ts'),
    };
    if (isServer) {
      if (process.env.OPENNEXT) {
        config.resolve.conditionNames = Array.from(
          new Set(['workerd', ...(config.resolve.conditionNames ?? ['...'])]),
        );
      }
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
