import { describe, expect, it } from 'vitest';
import { getOptionalServerEnv } from './index.js';

describe('environment validation', () => {
  it('rejects invalid runtime configuration without throwing at import time', () => {
    expect(getOptionalServerEnv({ TRACE_AUTH_SECRET: 'too-short' })).toBeNull();
  });
});
