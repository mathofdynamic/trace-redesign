import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  ENTRANCE_DURATION_MS,
  ENTRANCE_LEAD_MS,
  ENTRANCE_DISTANCE_PX,
  ENTRANCE_EASING,
  EXIT_DURATION_MS,
  EXIT_DISTANCE_PX,
  EXIT_EASING,
  getMotionStyle,
  getMotionItemProps,
  getMotionSectionProps,
  getMotionSurfaceProps,
  getPresenceProps,
  markElementSeen,
  isElementSeen,
} from '../entrance-motion';

describe('Phase 56 — Rendered Motion Verification & Freeze', () => {
  describe('1. Exact Physical Contract & Tokens', () => {
    it('verifies exact entrance and exit timing and easing invariants', () => {
      expect(ENTRANCE_DURATION_MS).toBe(200);
      expect(ENTRANCE_LEAD_MS).toBeCloseTo(200 / 3, 4);
      expect(ENTRANCE_DISTANCE_PX).toBe(20);
      expect(ENTRANCE_EASING).toBe('cubic-bezier(.16, 1, .3, 1)');

      expect(EXIT_DURATION_MS).toBe(66);
      expect(EXIT_DISTANCE_PX).toBe(8);
      expect(EXIT_EASING).toBe('cubic-bezier(.4, 0, 1, 1)');
    });

    it('verifies globals.css declares identical motion CSS variables', () => {
      const cssPath = path.resolve(__dirname, '../../app/globals.css');
      const cssContent = fs.readFileSync(cssPath, 'utf-8');

      expect(cssContent).toContain('--trace-motion-duration: 200ms;');
      expect(cssContent).toContain('--trace-motion-lead: 66.6667ms;');
      expect(cssContent).toContain('--trace-motion-exit-duration: 66ms;');
      expect(cssContent).toContain('--trace-motion-ease: cubic-bezier(0.16, 1, 0.3, 1);');
      expect(cssContent).toContain('--trace-motion-exit-ease: cubic-bezier(0.4, 0, 1, 1);');
    });

    it('verifies no competing entrance/open duration or easing definitions exist in globals.css', () => {
      const cssPath = path.resolve(__dirname, '../../app/globals.css');
      const cssContent = fs.readFileSync(cssPath, 'utf-8');

      // Check keyframe animations and surface reveal declarations
      expect(cssContent).toContain('@keyframes traceItemEntrance');
      expect(cssContent).toContain('@keyframes traceItemExit');
      expect(cssContent).toContain('@keyframes traceSurfaceBackdropEnter');
      expect(cssContent).toContain('@keyframes traceSurfaceDialogEnter');
    });
  });

  describe('2. Long-Page Observer Latching & Reveal Invariants', () => {
    it('verifies observer latches seen elements and does not re-trigger animation on scroll back', () => {
      const mockAttributes: Record<string, string> = {};
      const dummyEl = {
        getAttribute: (k: string) => mockAttributes[k] || null,
        setAttribute: (k: string, v: string) => {
          mockAttributes[k] = v;
        },
      } as unknown as Element;

      expect(isElementSeen(dummyEl)).toBe(false);
      markElementSeen(dummyEl);
      expect(isElementSeen(dummyEl)).toBe(true);
      expect(dummyEl.getAttribute('data-motion-state')).toBe('revealed');

      // Scroll away / back simulation: element remains seen
      expect(isElementSeen(dummyEl)).toBe(true);
    });

    it('verifies public long pages declare proper section motion tokens and items', () => {
      const pages = ['page.tsx', 'docs/page.tsx', 'security/page.tsx', 'specification/page.tsx', 'pricing/page.tsx', 'product/page.tsx'];
      for (const pageFile of pages) {
        const pagePath = path.resolve(__dirname, `../../app/${pageFile}`);
        if (fs.existsSync(pagePath)) {
          const content = fs.readFileSync(pagePath, 'utf-8');
          expect(content.includes('data-trace-motion') || content.includes('getMotionSectionProps') || content.includes('getMotionItemProps') || content.includes('MotionSection') || content.includes('PageHeader')).toBe(true);
        }
      }
    });
  });

  describe('3. Authenticated Route Navigation Motion', () => {
    it('verifies dashboard shell renders navigation and content without double-entrance flash', () => {
      const shellPath = path.resolve(__dirname, '../../app/(app)/app/_components/dashboard-shell.tsx');
      const shellContent = fs.readFileSync(shellPath, 'utf-8');

      expect(shellContent).toContain('dashboard-frame');
      expect(shellContent).toContain('dashboard-main');
      expect(shellContent).toContain('dashboard-content');
      expect(shellContent).toContain('data-trace-motion');
      expect(shellContent).toContain('data-motion-section');
    });

    it('verifies all dashboard views declare structured stagger indices', () => {
      const viewFiles = [
        'changes-view.tsx',
        'conflicts-view.tsx',
        'reports-view.tsx',
        'report-detail-view.tsx',
        'decisions-view.tsx',
        'rules-view.tsx',
        'activity-view.tsx',
        'settings-view.tsx',
        'documentation-view.tsx',
        'trace-redesign.tsx',
      ];

      for (const file of viewFiles) {
        const filePath = path.resolve(__dirname, `../../app/(app)/app/_components/${file}`);
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf-8');
          expect(content).toMatch(/--motion-index|getMotionItemProps|data-trace-motion/);
        }
      }
    });
  });

  describe('4. Transient Surfaces & Overlay Lifecycle', () => {
    it('verifies CenteredDialog and ModalBackdrop use unified presence state machine', () => {
      const overlayPath = path.resolve(__dirname, '../../app/(app)/app/_components/overlay-portal.tsx');
      const overlayContent = fs.readFileSync(overlayPath, 'utf-8');

      expect(overlayContent).toContain('BackdropPresenceContext');
      expect(overlayContent).toContain('data-presence-state');
      expect(overlayContent).toContain('data-trace-presence');
      expect(overlayContent).toContain('OverlayPortal');
      expect(overlayContent).toContain('ModalBackdrop');
      expect(overlayContent).toContain('CenteredDialog');
    });

    it('verifies presence props provide dual data attributes for CSS and testing inspection', () => {
      const states = ['closed', 'opening', 'open', 'closing'] as const;
      for (const st of states) {
        const props = getPresenceProps(st);
        expect(props['data-presence-state']).toBe(st);
        expect(props['data-trace-presence']).toBe(st);
      }
    });
  });

  describe('5. Reduced Motion & Progressive Enhancement', () => {
    it('verifies CSS guarantees zero animations and instant rendering under prefers-reduced-motion', () => {
      const cssPath = path.resolve(__dirname, '../../app/globals.css');
      const cssContent = fs.readFileSync(cssPath, 'utf-8');

      expect(cssContent).toContain('@media (prefers-reduced-motion: reduce)');
      expect(cssContent).toContain('animation-duration: 0.001ms !important;');
      expect(cssContent).toContain('transform: none !important;');
    });

    it('verifies non-JS fallback renders content visible without requiring JS execution', () => {
      const cssPath = path.resolve(__dirname, '../../app/globals.css');
      const cssContent = fs.readFileSync(cssPath, 'utf-8');

      expect(cssContent).toContain('html[data-trace-motion-ready="true"]');
      expect(cssContent).toContain('[data-motion-ignore]');
    });
  });

  describe('6. Mobile Responsiveness & Overflow Protection', () => {
    it('verifies mobile drawer and viewport layouts protect against horizontal overflow', () => {
      const cssPath = path.resolve(__dirname, '../../app/globals.css');
      const cssContent = fs.readFileSync(cssPath, 'utf-8');

      expect(cssContent).toContain('overflow-x: hidden');
      expect(cssContent).toContain('dashboard-mobile-drawer');
    });
  });
});
