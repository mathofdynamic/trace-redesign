import Link from 'next/link';
import { safeAuthNext } from '@trace/auth';
import { GithubAuthButton } from '../components/auth-button';
import { AuthShell } from '../components/auth-shell';

export const metadata = { title: 'Sign in — TRACE', robots: { index: false, follow: false } };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const query = await searchParams;
  const requestedNext = Array.isArray(query.next) ? query.next[0] : query.next;
  const next = safeAuthNext(requestedNext);
  const demoTarget = next !== '/onboarding' ? next : '/app';
  return (
    <AuthShell>
      <div className="auth-card__header">
        <p className="section-label">TRACE</p>
        <h1 className="auth-card__title">
          Understand what changed, why it changed, and what needs attention.
        </h1>
        <p className="auth-intro">Continue with the GitHub account you use for your projects.</p>
      </div>

      <div className="auth-card__actions">
        <GithubAuthButton callbackURL={next} />
        <div className="auth-secondary-action">
          <a
            href={`/api/auth/demo?next=${encodeURIComponent(demoTarget)}`}
            className="trace-button trace-button--secondary auth-demo-btn"
          >
            Explore Preview Dashboard
          </a>
        </div>
      </div>

      <div className="auth-card__boundaries">
        <p className="auth-boundary">
          TRACE requests identity access first. You choose repository access during setup.
        </p>
        <p className="auth-privacy">
          TRACE is an early pilot. Review the <Link href="/security">current security boundaries</Link>.
        </p>
      </div>
    </AuthShell>
  );
}
