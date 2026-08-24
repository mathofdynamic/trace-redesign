import Link from 'next/link';
import type { ReactNode } from 'react';
import { Wordmark } from './public';

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="auth-stage-wrapper">
      <div className="auth-ambient-halo" aria-hidden="true" />
      <main className="auth-shell" id="main-content">
        <header className="auth-shell__top">
          <Wordmark />
          <Link href="/" className="auth-back-link">
            Back to TRACE →
          </Link>
        </header>
        <section className="auth-card" aria-label="Sign in to TRACE">
          {children}
        </section>
        <footer className="auth-shell__footer">
          <p className="auth-trust-note">
            One account. Repository access stays under your control.
          </p>
        </footer>
      </main>
    </div>
  );
}
