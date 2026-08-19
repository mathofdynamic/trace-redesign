import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@trace/auth': path.resolve(__dirname, '../../packages/auth/src/index.ts'),
      '@trace/db': path.resolve(__dirname, '../../packages/db/src/index.ts'),
      '@trace/schema': path.resolve(__dirname, '../../packages/trace-schema/src/index.ts'),
      '@trace/env': path.resolve(__dirname, '../../packages/env/src/index.ts'),
      '@trace/github': path.resolve(__dirname, '../../packages/trace-github/src/index.ts'),
      '@trace/ui': path.resolve(__dirname, '../../packages/ui/src/index.ts'),
    },
  },
  test: { environment: 'node', passWithNoTests: true },
});
