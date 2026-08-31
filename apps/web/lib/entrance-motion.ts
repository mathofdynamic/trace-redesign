/**
 * TRACE Unified Entrance Motion Engine — 200ms Physical Runtime
 * 
 * Implements the shared TRACE entrance-motion contract:
 * - Opening duration: 200ms
 * - Opening easing: cubic-bezier(.16, 1, .3, 1)
 * - Opening properties: opacity + transform only
 * - Initial transform: translate3d(0, 20px, 0)
 * - Final transform: translate3d(0, 0, 0)
 * - Inter-item gap: 0ms
 * - Next-item lead: ENTRANCE_DURATION_MS / 3 (66.66666666666667ms)
 * - Close duration: 66ms
 * - Close easing: cubic-bezier(.4, 0, 1, 1)
 * - Close transform: translate3d(0, 8px, 0)
 * - Close stagger: none
 */

import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';

// Core Timing & Motion Constants
export const ENTRANCE_DURATION_MS = 200;
export const ENTRANCE_LEAD_MS = ENTRANCE_DURATION_MS / 3;
export const ENTRANCE_DISTANCE_PX = 20;
export const ENTRANCE_EASING = 'cubic-bezier(.16, 1, .3, 1)';

export const EXIT_DURATION_MS = 66;
export const EXIT_DISTANCE_PX = 8;
export const EXIT_EASING = 'cubic-bezier(.4, 0, 1, 1)';

// Re-export shared presence lifecycle
export { usePresence, getPresenceProps } from './presence';
export type { PresenceState, UsePresenceOptions, UsePresenceReturn } from './presence';

// Backward compatibility alias
export const STAGGER_DELAY_MS = ENTRANCE_LEAD_MS;

/**
 * WeakSet of elements that have already completed entrance motion or have been revealed.
 * Ensures an element is never animated twice and avoids memory leaks on detached nodes.
 */
export const seenMotionElements = new WeakSet<Element>();

/**
 * Marks an element as seen in the global motion tracker and ensures it is marked revealed.
 */
export function markElementSeen(el: Element): void {
  seenMotionElements.add(el);
  if (el.getAttribute('data-motion-state') !== 'revealed') {
    el.setAttribute('data-motion-state', 'revealed');
  }
}

/**
 * Checks if an element has already been seen / revealed by the motion engine.
 */
export function isElementSeen(el: Element): boolean {
  return seenMotionElements.has(el) || el.getAttribute('data-motion-state') === 'revealed';
}

/**
 * Resets seen tracking state (primarily for test environments).
 */
export function resetSeenTracking(): void {
  // WeakSet cannot be cleared directly, but existing references will be re-evaluated
}

export interface MotionStyleOptions {
  index?: number;
  delayMs?: number;
  durationMs?: number;
  easing?: string;
}

/**
 * Computes inline CSS variables for deterministic DOM-order entrance staggering.
 */
export function getMotionStyle(
  index: number = 0,
  options: MotionStyleOptions = {},
): CSSProperties {
  const { delayMs, durationMs, easing } = options;
  const style: Record<string, string | number> = {
    '--motion-index': index,
  };

  if (typeof delayMs === 'number') {
    style['--motion-delay'] = `${delayMs}ms`;
  }
  if (typeof durationMs === 'number') {
    style['--motion-duration'] = `${durationMs}ms`;
  }
  if (easing) {
    style['--motion-easing'] = easing;
  }

  return style as CSSProperties;
}

/**
 * Generates semantic props for an entrance item.
 */
export function getMotionItemProps(index: number = 0, options: MotionStyleOptions = {}) {
  return {
    'data-trace-motion': 'item',
    'data-motion-item': 'true',
    style: getMotionStyle(index, options),
  };
}

/**
 * Generates semantic props for an entrance section boundary.
 */
export function getMotionSectionProps(id?: string) {
  return {
    'data-trace-motion': 'section',
    'data-motion-section': id || 'section',
  };
}

/**
 * Generates semantic props for transient surface elements (dialogs, popovers, drawers, backdrops).
 */
export function getMotionSurfaceProps(variant: 'dialog' | 'popover' | 'drawer' | 'backdrop' = 'dialog') {
  return {
    'data-trace-motion': 'surface',
    'data-motion-variant': variant,
  };
}

/**
 * Hook to reactively track user reduced-motion preference.
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setPrefersReduced(event.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      mediaQuery.addListener(handler);
      return () => mediaQuery.removeListener(handler);
    }
  }, []);

  return prefersReduced;
}

/**
 * Global IntersectionObserver manager for coordinate section reveals.
 * 
 * Rules:
 * 1. Progressively enhances: Content is visible by default when JS is absent.
 * 2. Positively activates: Marks document.documentElement with data-trace-motion-ready="true".
 * 3. Threshold ~0.05, rootMargin ~'0px 0px -6% 0px'.
 * 4. Above-fold sections reveal immediately on mount.
 * 5. Below-fold sections reveal once when intersecting, then unobserve.
 * 6. Simultaneous entries sorted in document/DOM order.
 * 7. Live reduced-motion listener reconciliation (settles pending sections immediately).
 * 8. Bounded fail-safe timeout guarantees all content is revealed even on observer stall.
 */
export function setupEntranceMotionObserver(rootMargin = '0px 0px -6% 0px'): () => void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return () => {};
  }

  try {
    // Positively mark runtime ready
    document.documentElement.setAttribute('data-trace-motion-ready', 'true');

    // Fallback: If IntersectionObserver is unsupported, reveal all immediately
    if (typeof IntersectionObserver === 'undefined') {
      const sections = document.querySelectorAll(
        '[data-trace-motion="section"], [data-motion-section], [data-trace-motion-observed]',
      );
      sections.forEach((sec) => markElementSeen(sec));
      return () => {};
    }

    const observer = new IntersectionObserver(
      (entries) => {
        // Sort simultaneous entries in document order and filter out already seen elements
        const intersectingEntries = entries
          .filter((entry) => entry.isIntersecting && !seenMotionElements.has(entry.target))
          .sort((a, b) => {
            const pos = a.target.compareDocumentPosition(b.target);
            if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
            if (pos & Node.DOCUMENT_POSITION_PRECEDING) return 1;
            return 0;
          });

        intersectingEntries.forEach((entry) => {
          const target = entry.target as HTMLElement;
          seenMotionElements.add(target);
          target.setAttribute('data-motion-state', 'revealed');
          observer.unobserve(target);
        });
      },
      {
        rootMargin,
        threshold: 0.05,
      },
    );

    const observeElements = () => {
      const sections = document.querySelectorAll(
        '[data-trace-motion="section"]:not([data-motion-state="revealed"]), [data-motion-section]:not([data-motion-state="revealed"]), [data-trace-motion-observed]:not([data-motion-state="revealed"])',
      );

      sections.forEach((el) => {
        if (seenMotionElements.has(el)) {
          if (el.getAttribute('data-motion-state') !== 'revealed') {
            el.setAttribute('data-motion-state', 'revealed');
          }
          return;
        }

        const rect = el.getBoundingClientRect();
        // Above-the-fold elements reveal immediately
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          seenMotionElements.add(el);
          el.setAttribute('data-motion-state', 'revealed');
        } else {
          observer.observe(el);
        }
      });
    };

    // Synchronize initial reveal with safe paint frame
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        observeElements();
      });
    });

    // Observe dynamically added sections (client-side route navigation)
    const mutationObserver = new MutationObserver(() => {
      observeElements();
    });

    if (document.body) {
      mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }

    // Live Reduced-Motion Reconciliation:
    // If the preference switches to reduce at runtime, immediately reveal all pending sections
    const mediaQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    const handleReducedMotionChange = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) {
        const unrevealed = document.querySelectorAll(
          '[data-trace-motion="section"]:not([data-motion-state="revealed"]), [data-motion-section]:not([data-motion-state="revealed"])',
        );
        unrevealed.forEach((el) => markElementSeen(el));
      }
    };

    if (mediaQuery) {
      if (mediaQuery.matches) {
        handleReducedMotionChange(mediaQuery);
      }
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleReducedMotionChange);
      } else if (mediaQuery.addListener) {
        mediaQuery.addListener(handleReducedMotionChange);
      }
    }

    // Bounded fail-safe: Force-reveal everything after 2500ms in case of unexpected observer stalls
    const failSafeTimer = setTimeout(() => {
      const unrevealed = document.querySelectorAll(
        '[data-trace-motion="section"]:not([data-motion-state="revealed"]), [data-motion-section]:not([data-motion-state="revealed"])',
      );
      unrevealed.forEach((el) => markElementSeen(el));
    }, 2500);

    return () => {
      clearTimeout(failSafeTimer);
      observer.disconnect();
      mutationObserver.disconnect();
      if (mediaQuery) {
        if (mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener('change', handleReducedMotionChange);
        } else if (mediaQuery.removeListener) {
          mediaQuery.removeListener(handleReducedMotionChange);
        }
      }
    };
  } catch (error) {
    // Fail-safe error handling: Reveal all content and remove any blockers
    const unrevealed = document.querySelectorAll(
      '[data-trace-motion="section"]:not([data-motion-state="revealed"]), [data-motion-section]:not([data-motion-state="revealed"])',
    );
    unrevealed.forEach((el) => {
      el.setAttribute('data-motion-state', 'revealed');
    });
    return () => {};
  }
}
