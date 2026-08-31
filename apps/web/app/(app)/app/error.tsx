'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('TRACE dashboard route failed', { digest: error.digest });
  }, [error]);

  return (
    <section
      className="empty-panel empty-panel--large"
      role="alert"
      data-trace-motion="section"
      data-motion-section="dashboard-error"
    >
      <span
        aria-hidden="true"
        data-trace-motion="item"
        style={{ '--motion-index': 0 } as React.CSSProperties}
      >
        !
      </span>
      <h1
        data-trace-motion="item"
        style={{ '--motion-index': 1 } as React.CSSProperties}
      >
        Workspace view unavailable
      </h1>
      <p
        data-trace-motion="item"
        style={{ '--motion-index': 2 } as React.CSSProperties}
      >
        TRACE could not load this workspace view. Your local analysis and last verified dashboard
        record are unchanged.
      </p>
      <div
        className="error-actions"
        data-trace-motion="item"
        style={{ '--motion-index': 3 } as React.CSSProperties}
      >
        <button className="trace-button trace-button--primary" type="button" onClick={reset}>
          Retry
        </button>
        <Link className="trace-button trace-button--secondary" href="/app">
          Open overview
        </Link>
      </div>
      {error.digest ? (
        <details
          className="error-diagnostic"
          data-trace-motion="item"
          style={{ '--motion-index': 4 } as React.CSSProperties}
        >
          <summary>Technical details</summary>
          <small>Reference: {error.digest}</small>
        </details>
      ) : null}
    </section>
  );
}
