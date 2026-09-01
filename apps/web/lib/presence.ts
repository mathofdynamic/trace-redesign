/**
 * TRACE Unified Presence Lifecycle Engine — 200ms Open / 66ms Close Contract
 * 
 * Manages the deterministic presence lifecycle for all transient surfaces:
 * - Menus, popovers, dropdowns, drawers, disclosures, dialogs, modals, prompt builders.
 * 
 * Physical Contract:
 * - Open: 200ms duration, cubic-bezier(.16, 1, .3, 1), translate3d(0, 20px, 0) -> 0, opacity 0 -> 1.
 * - Stagger lead: ~66.6667ms (ENTRANCE_LEAD_MS = 200 / 3).
 * - Close: 66ms duration, cubic-bezier(.4, 0, 1, 1), translate3d(0, 0, 0) -> translate3d(0, 8px, 0), opacity 1 -> 0.
 * - Close stagger: NONE (all elements exit together).
 * - Reopen during close: Immediately aborts close timer and cleanly transitions back to opening (200ms).
 * - Reduced motion: Immediate mount / unmount with 0ms transition.
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ENTRANCE_DURATION_MS, EXIT_DURATION_MS } from './motion-tokens';
import { usePrefersReducedMotion } from './use-prefers-reduced-motion';

export type PresenceState = 'closed' | 'opening' | 'open' | 'closing';

export interface UsePresenceOptions {
  openDurationMs?: number;
  closeDurationMs?: number;
  onCloseComplete?: () => void;
}

export interface UsePresenceReturn {
  isMounted: boolean;
  presenceState: PresenceState;
  isOpening: boolean;
  isOpen: boolean;
  isClosing: boolean;
  isClosed: boolean;
  presenceProps: {
    'data-presence-state': PresenceState;
    'data-trace-presence': PresenceState;
  };
}

/**
 * Generates DOM attributes for presence state reflection.
 */
export function getPresenceProps(state: PresenceState) {
  return {
    'data-presence-state': state,
    'data-trace-presence': state,
  };
}

/**
 * usePresence hook controls mounting, opening transition, closing transition, and unmounting.
 */
export function usePresence(
  isOpenInput: boolean,
  options: UsePresenceOptions = {},
): UsePresenceReturn {
  const {
    openDurationMs = ENTRANCE_DURATION_MS,
    closeDurationMs = EXIT_DURATION_MS,
    onCloseComplete,
  } = options;

  const prefersReducedMotion = usePrefersReducedMotion();
  const [presenceState, setPresenceState] = useState<PresenceState>(
    isOpenInput ? (prefersReducedMotion ? 'open' : 'opening') : 'closed',
  );

  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafId1Ref = useRef<number | null>(null);
  const rafId2Ref = useRef<number | null>(null);
  const onCloseCompleteRef = useRef(onCloseComplete);
  onCloseCompleteRef.current = onCloseComplete;

  const cancelPending = useCallback(() => {
    if (closeTimerRef.current !== null) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    if (rafId1Ref.current !== null) {
      cancelAnimationFrame(rafId1Ref.current);
      rafId1Ref.current = null;
    }
    if (rafId2Ref.current !== null) {
      cancelAnimationFrame(rafId2Ref.current);
      rafId2Ref.current = null;
    }
  }, []);

  useEffect(() => {
    if (isOpenInput) {
      cancelPending();

      if (prefersReducedMotion) {
        setPresenceState('open');
        return;
      }

      // Start in opening state to allow initial layout paint
      setPresenceState('opening');

      // Double RAF ensures initial transform & opacity are painted before transition starts
      if (typeof window !== 'undefined') {
        rafId1Ref.current = requestAnimationFrame(() => {
          rafId2Ref.current = requestAnimationFrame(() => {
            setPresenceState('open');
            rafId1Ref.current = null;
            rafId2Ref.current = null;
          });
        });
      } else {
        setPresenceState('open');
      }
    } else {
      cancelPending();

      // If already closed, do nothing
      if (presenceState === 'closed') {
        return;
      }

      if (prefersReducedMotion) {
        setPresenceState('closed');
        onCloseCompleteRef.current?.();
        return;
      }

      // Enter closing state
      setPresenceState('closing');

      // Bounded fallback timer for exit animation before unmounting
      closeTimerRef.current = setTimeout(() => {
        setPresenceState('closed');
        closeTimerRef.current = null;
        onCloseCompleteRef.current?.();
      }, closeDurationMs);
    }

    return () => {
      cancelPending();
    };
  }, [isOpenInput, closeDurationMs, prefersReducedMotion, cancelPending]);

  const isMounted = presenceState !== 'closed';

  return {
    isMounted,
    presenceState,
    isOpening: presenceState === 'opening',
    isOpen: presenceState === 'open',
    isClosing: presenceState === 'closing',
    isClosed: presenceState === 'closed',
    presenceProps: getPresenceProps(presenceState),
  };
}
