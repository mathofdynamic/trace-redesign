import { describe, expect, it } from 'vitest';
import { safeAuthNext } from '@trace/auth';

describe('Sign-in Experience & Auth Safety Invariants', () => {
  it('enforces safe auth redirects and falls back securely to /onboarding', () => {
    expect(safeAuthNext('/app')).toBe('/app');
    expect(safeAuthNext('/onboarding')).toBe('/onboarding');
    expect(safeAuthNext('/app/repositories')).toBe('/app/repositories');

    // Untrusted / protocol-relative / external domains must fall back to /onboarding
    expect(safeAuthNext('https://evil.com')).toBe('/onboarding');
    expect(safeAuthNext('//evil.com')).toBe('/onboarding');
    expect(safeAuthNext('javascript:alert(1)')).toBe('/onboarding');
    expect(safeAuthNext(undefined)).toBe('/onboarding');
  });

  it('determines the correct demo destination target', () => {
    const getDemoTarget = (requestedNext?: string) => {
      const next = safeAuthNext(requestedNext);
      return next !== '/onboarding' ? next : '/app';
    };

    expect(getDemoTarget('/app/investigations')).toBe('/app/investigations');
    expect(getDemoTarget('/onboarding')).toBe('/app');
    expect(getDemoTarget(undefined)).toBe('/app');
    expect(getDemoTarget('https://malicious.org')).toBe('/app');
  });

  it('confirms privacy and permission boundary contracts', () => {
    const boundaryNotice =
      'TRACE requests identity access first. You choose repository access during setup.';
    const pilotNotice = 'TRACE is an early pilot. Review the current security boundaries.';
    const trustStatement = 'One account. Repository access stays under your control.';

    expect(boundaryNotice).toContain('identity access first');
    expect(boundaryNotice).toContain('choose repository access during setup');
    expect(pilotNotice).toContain('current security boundaries');
    expect(trustStatement).toContain('stays under your control');
  });
});

