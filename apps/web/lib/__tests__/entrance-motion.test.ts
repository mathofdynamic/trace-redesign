import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
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
  setupEntranceMotionObserver,
} from '../entrance-motion';

describe('TRACE Entrance Motion Timing Contract', () => {
  it('enforces exact timing and physical constants', () => {
    // 1. Duration is exactly 200ms
    expect(ENTRANCE_DURATION_MS).toBe(200);

    // 2. Lead is mathematically derived from duration / 3
    expect(ENTRANCE_LEAD_MS).toBe(ENTRANCE_DURATION_MS / 3);
    expect(ENTRANCE_LEAD_MS).toBeCloseTo(66.6667, 4);

    // 3. Distance is 20px translation
    expect(ENTRANCE_DISTANCE_PX).toBe(20);

    // 4. Opening easing is cubic-bezier(.16, 1, .3, 1)
    expect(ENTRANCE_EASING).toBe('cubic-bezier(.16, 1, .3, 1)');

    // 5. Exit duration is 66ms, distance is 8px, easing is cubic-bezier(.4, 0, 1, 1)
    expect(EXIT_DURATION_MS).toBe(66);
    expect(EXIT_DISTANCE_PX).toBe(8);
    expect(EXIT_EASING).toBe('cubic-bezier(.4, 0, 1, 1)');
  });

  it('calculates motion style variables accurately', () => {
    const style0 = getMotionStyle(0);
    expect(style0).toEqual({
      '--motion-index': 0,
    });

    const style3 = getMotionStyle(3, {
      delayMs: 100,
      durationMs: 250,
      easing: 'ease-out',
    });
    expect(style3).toEqual({
      '--motion-index': 3,
      '--motion-delay': '100ms',
      '--motion-duration': '250ms',
      '--motion-easing': 'ease-out',
    });
  });

  it('generates compliant semantic motion item props', () => {
    const itemProps = getMotionItemProps(2);
    expect(itemProps['data-trace-motion']).toBe('item');
    expect(itemProps['data-motion-item']).toBe('true');
    expect(itemProps.style).toEqual({
      '--motion-index': 2,
    });
  });

  it('generates compliant semantic motion section props', () => {
    const sectionProps = getMotionSectionProps('architecture');
    expect(sectionProps['data-trace-motion']).toBe('section');
    expect(sectionProps['data-motion-section']).toBe('architecture');
  });

  it('generates compliant surface props for dialogs, drawers, and popovers', () => {
    const dialogProps = getMotionSurfaceProps('dialog');
    expect(dialogProps['data-trace-motion']).toBe('surface');
    expect(dialogProps['data-motion-variant']).toBe('dialog');

    const drawerProps = getMotionSurfaceProps('drawer');
    expect(drawerProps['data-motion-variant']).toBe('drawer');
  });

  describe('Server-side and Progressive Enhancement safety', () => {
    it('returns a no-op cleanup and does not crash when window/document are absent', () => {
      const cleanup = setupEntranceMotionObserver();
      expect(typeof cleanup).toBe('function');
      cleanup();
    });

    it('handles simulated browser environment safely', () => {
      const mockAttributes: Record<string, string> = {};
      const mockDocElement = {
        setAttribute: vi.fn((key: string, val: string) => {
          mockAttributes[key] = val;
        }),
        getAttribute: vi.fn((key: string) => mockAttributes[key]),
      };

      const mockBody = {};
      const mockQuerySelectorAll = vi.fn().mockReturnValue([]);

      // Mock globals
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
            body: mockBody,
            querySelectorAll: mockQuerySelectorAll,
          },
          writable: true,
          configurable: true,
        });

        const cleanup = setupEntranceMotionObserver();
        expect(mockDocElement.setAttribute).toHaveBeenCalledWith('data-trace-motion-ready', 'true');
        expect(typeof cleanup).toBe('function');
        cleanup();
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

    it('does not set a global reveal-all timeout that prematurely marks unrevealed sections revealed', () => {
      vi.useFakeTimers();
      const mockAttributes: Record<string, string> = {};
      const belowFoldAttrs: Record<string, string> = {};
      const mockBelowFoldEl = {
        getAttribute: vi.fn((k: string) => belowFoldAttrs[k] || null),
        setAttribute: vi.fn((k: string, v: string) => {
          belowFoldAttrs[k] = v;
        }),
        getBoundingClientRect: vi.fn().mockReturnValue({
          top: 1500,
          bottom: 1800,
        }),
      };

      const mockDocElement = {
        setAttribute: vi.fn((key: string, val: string) => {
          mockAttributes[key] = val;
        }),
        getAttribute: vi.fn((key: string) => mockAttributes[key]),
      };

      const originalWindow = global.window;
      const originalDocument = global.document;
      const originalIntersectionObserver = global.IntersectionObserver;

      const observedElements: unknown[] = [];
      class MockIntersectionObserver {
        observe = vi.fn((el) => {
          observedElements.push(el);
        });
        unobserve = vi.fn();
        disconnect = vi.fn();
      }

      try {
        Object.defineProperty(global, 'window', {
          value: {
            innerHeight: 900,
            IntersectionObserver: MockIntersectionObserver,
            matchMedia: vi.fn().mockReturnValue({
              matches: false,
              addEventListener: vi.fn(),
              removeEventListener: vi.fn(),
            }),
            requestAnimationFrame: (cb: () => void) => {
              cb();
              return 1;
            },
            cancelAnimationFrame: vi.fn(),
          },
          writable: true,
          configurable: true,
        });
        Object.defineProperty(global, 'document', {
          value: {
            documentElement: mockDocElement,
            body: {},
            querySelectorAll: vi.fn().mockReturnValue([mockBelowFoldEl]),
          },
          writable: true,
          configurable: true,
        });
        Object.defineProperty(global, 'IntersectionObserver', {
          value: MockIntersectionObserver,
          writable: true,
          configurable: true,
        });

        const cleanup = setupEntranceMotionObserver();

        // Advance timers past 2500ms and 5000ms
        vi.advanceTimersByTime(5000);

        // Below-the-fold element MUST NOT have been prematurely marked revealed
        expect(belowFoldAttrs['data-motion-state']).not.toBe('revealed');

        cleanup();
      } finally {
        vi.useRealTimers();
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
        Object.defineProperty(global, 'IntersectionObserver', {
          value: originalIntersectionObserver,
          writable: true,
          configurable: true,
        });
      }
    });
  });
});
