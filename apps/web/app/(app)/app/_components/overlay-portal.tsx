'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  EXIT_DURATION_MS,
  usePrefersReducedMotion,
} from '../../../../lib/entrance-motion';

export interface OverlayPortalProps {
  children: React.ReactNode;
}

let activeOverlayCount = 0;

/**
 * OverlayPortal renders children into document.body to break out of
 * local CSS stacking contexts, ensuring backdrops blur the entire application
 * (including sidebar, topbar, and project selector).
 */
export function OverlayPortal({ children }: OverlayPortalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    activeOverlayCount += 1;
    if (typeof document !== 'undefined') {
      document.body.setAttribute('data-overlay-active', 'true');
    }
    return () => {
      setMounted(false);
      activeOverlayCount = Math.max(0, activeOverlayCount - 1);
      if (typeof document !== 'undefined' && activeOverlayCount === 0) {
        document.body.removeAttribute('data-overlay-active');
      }
    };
  }, []);

  if (!mounted || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div className="trace-overlay-root" role="presentation">
      {children}
    </div>,
    document.body,
  );
}

export interface ModalBackdropProps {
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
  ariaLabel?: string;
}

/**
 * ModalBackdrop provides a full-viewport fixed layer with systemic background blur
 * covering the entire page beneath the modal.
 * Coordinates 200ms entrance and 66ms exit before unmounting.
 */
export function ModalBackdrop({
  children,
  onClose,
  className = '',
  ariaLabel = 'Close dialog',
}: ModalBackdropProps) {
  const prefersReduced = usePrefersReducedMotion();
  const [presenceState, setPresenceState] = useState<'opening' | 'open' | 'closing'>('opening');
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (prefersReduced) {
      setPresenceState('open');
      return;
    }
    let raf2: number | null = null;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        setPresenceState('open');
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      if (raf2 !== null) cancelAnimationFrame(raf2);
    };
  }, [prefersReduced]);

  const handleAnimatedClose = useCallback(() => {
    if (!onClose) return;
    if (prefersReduced) {
      onClose();
      return;
    }
    setPresenceState('closing');
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      onClose();
    }, EXIT_DURATION_MS);
  }, [onClose, prefersReduced]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if clicking directly on the backdrop container, not on its contents
    if (e.target === e.currentTarget && onClose) {
      handleAnimatedClose();
    }
  };

  return (
    <div
      className={`trace-modal-backdrop-layer ${className}`.trim()}
      role="presentation"
      data-trace-motion="surface"
      data-motion-variant="backdrop"
      data-presence-state={presenceState}
      data-trace-presence={presenceState}
      onClick={handleBackdropClick}
    >
      <div
        className="trace-modal-backdrop"
        aria-hidden="true"
        aria-label={ariaLabel}
        onClick={handleAnimatedClose}
      />
      {children}
    </div>
  );
}

export interface CenteredDialogProps {
  children: React.ReactNode;
  onClose: () => void;
  titleId?: string;
  descriptionId?: string;
  size?: 'sm' | 'md' | 'lg' | 'default';
  className?: string;
  role?: 'dialog' | 'alertdialog';
  initialFocusRef?: React.RefObject<HTMLElement | null>;
}

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * CenteredDialog encapsulates accessible modal behavior:
 * - Centered viewport placement on desktop
 * - Body scroll lock on mount with restoration on unmount
 * - Trap focus within dialog on Tab
 * - Escape key to close
 * - Focus restoration to previous active element on unmount
 * - Physical motion contract (200ms open, 66ms close)
 */
export function CenteredDialog({
  children,
  onClose,
  titleId,
  descriptionId,
  size = 'default',
  className = '',
  role = 'dialog',
  initialFocusRef,
}: CenteredDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  // Save previous active element to restore upon close
  useEffect(() => {
    if (typeof document !== 'undefined') {
      previousActiveElementRef.current = document.activeElement as HTMLElement | null;
    }
  }, []);

  // Body scroll lock
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    // Check scrollbar width to prevent layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, []);

  // Initial focus management
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus();
      } else if (dialogRef.current) {
        const firstFocusable = dialogRef.current.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
        if (firstFocusable) {
          firstFocusable.focus();
        } else {
          dialogRef.current.focus();
        }
      }
    }, 16);

    return () => clearTimeout(timer);
  }, [initialFocusRef]);

  // Focus restoration on unmount
  useEffect(() => {
    return () => {
      if (previousActiveElementRef.current && typeof previousActiveElementRef.current.focus === 'function') {
        previousActiveElementRef.current.focus();
      }
    };
  }, []);

  // Keyboard navigation: Escape to close, Tab to cycle focus
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        if (!dialogRef.current) return;
        const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
        if (focusableElements.length === 0) {
          e.preventDefault();
          return;
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement || document.activeElement === dialogRef.current) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    },
    [onClose],
  );

  const sizeClass =
    size === 'sm'
      ? 'trace-centered-dialog--sm'
      : size === 'md'
        ? 'trace-centered-dialog--md'
        : size === 'lg'
          ? 'trace-centered-dialog--lg'
          : '';

  return (
    <div
      ref={dialogRef}
      className={`trace-centered-dialog ${sizeClass} ${className}`.trim()}
      role={role}
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      tabIndex={-1}
      data-trace-motion="surface"
      data-motion-variant="dialog"
      onKeyDown={handleKeyDown}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );
}
