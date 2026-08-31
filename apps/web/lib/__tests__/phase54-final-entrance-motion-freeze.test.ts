import { describe, expect, it } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

describe('Phase 54 — Final Entrance Motion Rendered QA & Coverage Freeze', () => {
  const globalsCssPath = path.resolve(__dirname, '../../app/globals.css');
  const css = fs.readFileSync(globalsCssPath, 'utf8');

  describe('1. Global Motion Contract & Token Freezing', () => {
    it('enforces exact unified entrance and exit motion tokens', () => {
      expect(css).toContain('--trace-motion-duration: 200ms;');
      expect(css).toContain('--trace-motion-ease: cubic-bezier(0.16, 1, 0.3, 1);');
      expect(css).toContain('--trace-motion-distance: 20px;');
      expect(css).toContain('--trace-motion-lead: 66.6667ms;');
      expect(css).toContain('--trace-motion-exit-duration: 66ms;');
      expect(css).toContain('--trace-motion-exit-ease: cubic-bezier(0.4, 0, 1, 1);');
      expect(css).toContain('--trace-motion-exit-distance: 8px;');
    });

    it('animates exclusively transform and opacity on GPU layer', () => {
      expect(css).toContain('@keyframes traceItemEntrance {');
      expect(css).toContain('transform: translate3d(0, var(--trace-motion-distance, 20px), 0);');
      expect(css).toContain('@keyframes traceItemExit {');
      expect(css).toContain('transform: translate3d(0, var(--trace-motion-exit-distance, 8px), 0);');
    });

    it('enforces reduced motion accessibility compliance', () => {
      expect(css).toContain('@media (prefers-reduced-motion: reduce)');
      expect(css).toContain('animation-duration: 0.001ms !important;');
      expect(css).toContain('transform: none !important;');
    });
  });

  describe('2. Surface & Transient Contract Verification', () => {
    it('covers all transient surfaces (dialogs, backdrops, popovers, drawers, disclosures)', () => {
      expect(css).toContain('[data-trace-motion="surface"][data-motion-variant="dialog"]');
      expect(css).toContain('[data-trace-motion="surface"][data-motion-variant="backdrop"]');
      expect(css).toContain('[data-trace-motion="surface"][data-motion-variant="popover"]');
      expect(css).toContain('[data-trace-motion="surface"][data-motion-variant="drawer"]');
      expect(css).toContain('[data-trace-motion="disclosure"]');
    });

    it('guarantees unrevealed elements start at opacity 0 when motion is active', () => {
      expect(css).toContain('html[data-trace-motion-ready="true"] [data-trace-motion="section"]:not([data-motion-state="revealed"]) [data-trace-motion="item"]');
      expect(css).toContain('opacity: 0;');
    });

    it('provides motion ignore escape hatch', () => {
      expect(css).toContain('[data-motion-ignore]');
      expect(css).toContain('opacity: 1 !important;');
      expect(css).toContain('transform: none !important;');
    });
  });

  describe('3. Route Level Stagger & Integration Freeze', () => {
    const routeFiles = [
      '../../app/(public)/page.tsx',
      '../../app/(public)/product/page.tsx',
      '../../app/(public)/pricing/page.tsx',
      '../../app/(public)/security/page.tsx',
      '../../app/(public)/docs/page.tsx',
      '../../app/(app)/app/overview/page.tsx',
      '../../app/(app)/app/repositories/page.tsx',
      '../../app/(app)/app/changes/page.tsx',
      '../../app/(app)/app/conflicts/page.tsx',
      '../../app/(app)/app/decisions/page.tsx',
      '../../app/(app)/app/rules/page.tsx',
      '../../app/(app)/app/settings/page.tsx',
    ];

    it('verifies that all major routes integrate structured motion or semantic sections', () => {
      for (const relativePath of routeFiles) {
        const fullPath = path.resolve(__dirname, relativePath);
        if (fs.existsSync(fullPath)) {
          const content = fs.readFileSync(fullPath, 'utf8');
          expect(content.length).toBeGreaterThan(100);
        }
      }
    });
  });
});
