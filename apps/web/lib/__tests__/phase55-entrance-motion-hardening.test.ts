import { describe, it, expect, vi } from 'vitest';
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
  setupEntranceMotionObserver,
} from '../entrance-motion';

describe('Phase 55 — TRACE Entrance Motion Runtime Hardening', () => {
  it('enforces mathematical physical motion tokens contract', () => {
    expect(ENTRANCE_DURATION_MS).toBe(200);
    expect(ENTRANCE_LEAD_MS).toBeCloseTo(66.6667, 3);
    expect(ENTRANCE_DISTANCE_PX).toBe(20);
    expect(ENTRANCE_EASING).toBe('cubic-bezier(.16, 1, .3, 1)');

    expect(EXIT_DURATION_MS).toBe(66);
    expect(EXIT_DISTANCE_PX).toBe(8);
    expect(EXIT_EASING).toBe('cubic-bezier(.4, 0, 1, 1)');
  });

  it('verifies non-circular dependency between presence and motion modules', () => {
    const presencePath = path.resolve(__dirname, '../presence.ts');
    const presenceContent = fs.readFileSync(presencePath, 'utf-8');

    // presence.ts must NOT import from entrance-motion.ts to prevent circular dependencies
    expect(presenceContent).not.toMatch(/from\s+['"]\.\/entrance-motion['"]/);
    expect(presenceContent).toMatch(/from\s+['"]\.\/motion-tokens['"]/);
    expect(presenceContent).toMatch(/from\s+['"]\.\/use-prefers-reduced-motion['"]/);
  });

  it('generates consistent presence props with both data-presence-state and data-trace-presence', () => {
    const openingProps = getPresenceProps('opening');
    expect(openingProps['data-presence-state']).toBe('opening');
    expect(openingProps['data-trace-presence']).toBe('opening');

    const openProps = getPresenceProps('open');
    expect(openProps['data-presence-state']).toBe('open');
    expect(openProps['data-trace-presence']).toBe('open');

    const closingProps = getPresenceProps('closing');
    expect(closingProps['data-presence-state']).toBe('closing');
    expect(closingProps['data-trace-presence']).toBe('closing');

    const closedProps = getPresenceProps('closed');
    expect(closedProps['data-presence-state']).toBe('closed');
    expect(closedProps['data-trace-presence']).toBe('closed');
  });

  it('generates deterministic motion styles and indices', () => {
    const style0 = getMotionStyle(0);
    expect(style0).toEqual({ '--motion-index': 0 });

    const style3 = getMotionStyle(3, { delayMs: 100, durationMs: 200, easing: 'ease-out' });
    expect(style3).toEqual({
      '--motion-index': 3,
      '--motion-delay': '100ms',
      '--motion-duration': '200ms',
      '--motion-easing': 'ease-out',
    });

    const itemProps = getMotionItemProps(2);
    expect(itemProps['data-trace-motion']).toBe('item');
    expect(itemProps['data-motion-item']).toBe('true');
    expect(itemProps.style).toEqual({ '--motion-index': 2 });

    const sectionProps = getMotionSectionProps('metrics');
    expect(sectionProps['data-trace-motion']).toBe('section');
    expect(sectionProps['data-motion-section']).toBe('metrics');

    const surfaceProps = getMotionSurfaceProps('dialog');
    expect(surfaceProps['data-trace-motion']).toBe('surface');
    expect(surfaceProps['data-motion-variant']).toBe('dialog');
  });

  it('tracks seen elements to prevent re-triggering animations on re-renders', () => {
    const attrs: Record<string, string> = {};
    const dummyEl = {
      getAttribute: (k: string) => attrs[k] || null,
      setAttribute: (k: string, v: string) => { attrs[k] = v; },
    } as unknown as Element;

    expect(isElementSeen(dummyEl)).toBe(false);

    markElementSeen(dummyEl);
    expect(isElementSeen(dummyEl)).toBe(true);
    expect(dummyEl.getAttribute('data-motion-state')).toBe('revealed');
  });

  it('verifies setupEntranceMotionObserver activates document and cleans up safely in browser simulation', () => {
    const mockAttributes: Record<string, string> = {};
    const mockDocElement = {
      setAttribute: vi.fn((key: string, val: string) => {
        mockAttributes[key] = val;
      }),
      getAttribute: vi.fn((key: string) => mockAttributes[key]),
    };

    const originalWindow = global.window;
    const originalDocument = global.document;

    try {
      Object.defineProperty(global, 'window', {
        value: {
          innerHeight: 900,
          matchMedia: vi.fn().mockReturnValue({
            matches: false,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
          }),
        },
        writable: true,
        configurable: true,
      });
      Object.defineProperty(global, 'document', {
        value: {
          documentElement: mockDocElement,
          body: {},
          querySelectorAll: vi.fn().mockReturnValue([]),
        },
        writable: true,
        configurable: true,
      });

      const cleanup = setupEntranceMotionObserver();
      expect(mockDocElement.setAttribute).toHaveBeenCalledWith('data-trace-motion-ready', 'true');
      expect(typeof cleanup).toBe('function');
      expect(() => cleanup()).not.toThrow();
    } finally {
      Object.defineProperty(global, 'window', {
        value: originalWindow,
        writable: true,
        configurable: true,
      });
      Object.defineProperty(global, 'document', {
        value: originalDocument,
        writable: true,
        configurable: true,
      });
    }
  });

  it('verifies gitignore includes .playwright-browsers/', () => {
    const gitignorePath = path.resolve(__dirname, '../../../../../.gitignore');
    if (fs.existsSync(gitignorePath)) {
      const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
      expect(gitignoreContent).toContain('.playwright-browsers/');
    }
  });
});
