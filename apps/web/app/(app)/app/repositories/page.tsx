import { headers } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { inArray } from 'drizzle-orm';
import { getTraceSession } from '@trace/auth';
import { schema } from '@trace/db';
import { RepositorySelector } from '../../../components/repository-selector';
import { SetupProgress } from '../../../components/setup-progress';
import { createRequestDatabase } from '../../../../lib/request-database';
import { getUserOrganizationIds } from '../../../../lib/workspace';
import {
  getActiveMockScenario,
  isMockModeEnabled,
  mockDataProvider,
  MOCK_PRIMARY_USER,
} from '../../../../lib/mock';
import { getAuthenticatedDashboardSummary } from '../../../../lib/dashboard-server';

type RepositoriesPageProps = {
  searchParams: Promise<{ setup?: string | string[] }>;
};

function setupMessage(value: string | string[] | undefined) {
  const setup = Array.isArray(value) ? value[0] : value;
  return setup === 'connected'
    ? 'GitHub connected. TRACE has discovered the repositories in your workspace.'
    : setup === 'cancelled'
      ? 'GitHub App installation was cancelled.'
      : setup === 'not-configured'
        ? 'Repository connection is not configured in this environment yet.'
        : setup === 'github-app'
          ? 'We could not finish connecting GitHub. Your account is still signed in.'
          : null;
}

export default async function RepositoriesPage({ searchParams }: RepositoriesPageProps) {
  const rawSession = await getTraceSession(await headers());
  const isMock = isMockModeEnabled() || rawSession?.user?.id === MOCK_PRIMARY_USER.id;
  const session = isMock ? (rawSession ?? mockDataProvider.getSession()) : rawSession;
  if (!session?.user) redirect('/sign-in?next=/app/repositories');
  const query = await searchParams;
  const message = setupMessage(query.setup);
  const setupStatusStr = Array.isArray(query.setup) ? query.setup[0] : query.setup;

  let installations: Array<{
    id: string;
    accountLogin: string;
    accountType: string;
    state: string;
  }> = [];

  if (isMock) {
    installations = [
      {
        id: 'mock-gh-inst-001',
        accountLogin: 'northstar-engineering',
        accountType: 'Organization',
        state: 'active',
      },
    ];
  } else {
    try {
      const { db, client } = await createRequestDatabase();
      try {
        const organizationIds = await getUserOrganizationIds(db, session.user.id);
        installations = organizationIds.length
          ? await db
              .select({
                id: schema.githubInstallations.id,
                accountLogin: schema.githubInstallations.accountLogin,
                accountType: schema.githubInstallations.accountType,
                state: schema.githubInstallations.state,
              })
              .from(schema.githubInstallations)
              .where(inArray(schema.githubInstallations.organizationId, organizationIds))
          : [];
      } finally {
        await client.end().catch(() => {});
      }
    } catch (error) {
      console.warn('[TRACE] Error loading installations from database:', error);
      installations = [];
    }
  }

  // Load authenticated dashboard summary to get rich project intelligence
  const { summary } = await getAuthenticatedDashboardSummary();
  const repositories = summary.repositories;

  // 1. Zero state: No GitHub installations connected
  if (!installations.length) {
    return (
      <div className="dashboard-page redesign-page repositories-page">
        <SetupProgress current={2} />
        <div className="dashboard-page-header">
          <div>
            <span className="eyebrow">WORKSPACE SETUP</span>
            <h1>Connect your repositories.</h1>
            <p>
              TRACE uses read-only access to understand commits, pull requests, issues, and project
              changes. You choose which repositories it can access.
            </p>
          </div>
          <span className="connection-state">Not connected</span>
        </div>

        {message ? (
          <p className="auth-error-block" role="status">
            {message}
          </p>
        ) : null}

        <section className="empty-panel empty-panel--large repository-connect-panel">
          <span className="empty-glyph" aria-hidden="true">
            ↗
          </span>
          <h2>Connect GitHub</h2>
          <p>
            Choose the GitHub account and repositories TRACE may read. No source write access is
            requested.
          </p>
          <Link
            className="trace-button trace-button--primary"
            href="/api/github/install?next=/app/repositories"
          >
            Connect GitHub
          </Link>
          <details className="access-disclosure">
            <summary>What TRACE can access</summary>
            <p>
              Repository metadata, contents, pull requests, and issues for repositories you
              select. Source code remains on your computer.
            </p>
          </details>
        </section>
      </div>
    );
  }

  // 2. Degraded state: GitHub connected, but 0 repositories granted
  if (!repositories.length) {
    return (
      <div className="dashboard-page redesign-page repositories-page">
        <SetupProgress current={3} />
        <div className="dashboard-page-header">
          <div>
            <span className="eyebrow">REPOSITORY ACCESS</span>
            <h1>No repositories granted</h1>
            <p>
              GitHub account <strong>{installations[0]?.accountLogin}</strong> is connected, but no
              repositories were selected for this workspace.
            </p>
          </div>
          <span className="connection-state">0 repositories</span>
        </div>

        {message ? (
          <p className="auth-error-block" role="status">
            {message}
          </p>
        ) : null}

        <section className="empty-panel empty-panel--large">
          <span className="empty-glyph" aria-hidden="true">
            ◌
          </span>
          <h2>No repositories were granted</h2>
          <p>Update the GitHub App installation to grant access to at least one repository.</p>
          <Link
            className="trace-button trace-button--primary"
            href="/api/github/install?next=/app/repositories"
          >
            Update GitHub access
          </Link>
        </section>
      </div>
    );
  }

  // 3. Complete state: Managed Repositories Surface
  return (
    <div className="dashboard-page redesign-page repositories-page">
      <RepositorySelector
        repositories={repositories}
        attention={summary.attention}
        reports={summary.latestReports}
        installations={installations}
        workspaceName={summary.workspace?.name}
        setupMessage={message}
        setupStatus={setupStatusStr ?? null}
      />
    </div>
  );
}
