'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { setupEntranceMotionObserver, markElementSeen } from '../../lib/entrance-motion';

/**
 * EntranceMotionProvider initializes the shared TRACE entrance motion engine.
 * 
 * Rules enforced:
 * - Marks html element with `data-trace-motion-ready="true"` strictly in browser.
 * - Progressive enhancement: Content without JS is 100% visible with zero animations.
 * - IntersectionObserver scans below-the-fold content and coordinates single reveal.
 * - Route navigation triggers re-scan for new route elements without replaying revealed ones.
 */
export function EntranceMotionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    // Setup observer on initial provider mount
    const cleanup = setupEntranceMotionObserver();
    return cleanup;
  }, []);

  // On route changes, evaluate newly mounted DOM elements
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const frame1 = requestAnimationFrame(() => {
      const frame2 = requestAnimationFrame(() => {
        const unrevealedSections = document.querySelectorAll(
          '[data-trace-motion="section"]:not([data-motion-state="revealed"]), [data-motion-section]:not([data-motion-state="revealed"])',
        );
        unrevealedSections.forEach((el) => {
          const rect = el.getBoundingClientRect();
          if (rect.top < window.innerHeight && rect.bottom > 0) {
            markElementSeen(el);
          }
        });
      });
      return () => cancelAnimationFrame(frame2);
    });

    return () => cancelAnimationFrame(frame1);
  }, [pathname]);

  return <>{children}</>;
}
