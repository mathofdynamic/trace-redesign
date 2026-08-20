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
import { getActiveMockScenario, isMockModeEnabled, mockDataProvider, MOCK_PRIMARY_USER } from '../../../../lib/mock';

type RepositoriesPageProps = {
  searchParams: Promise<{ setup?: string | string[] }>;
};

function setupMessage(value: string | string[] | undefined) {
  const setup = Array.isArray(value) ? value[0] : value;
  return setup === 'connected'
    ? 'GitHub connected. Now choose the repositories TRACE should understand.'
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

  let installations: Array<{
    id: string;
    accountLogin: string;
    accountType: string;
    state: string;
  }> = [];

  let repositories: Array<{
    id: string;
    fullName: string;
    defaultBranch: string | null;
    visibility: string | null;
    state: string;
  }> = [];

  if (isMock) {
    const mockRepos = mockDataProvider.getRepositories(getActiveMockScenario());
    installations = [
      {
        id: 'mock-gh-inst-001',
        accountLogin: 'northstar-engineering',
        accountType: 'Organization',
        state: 'active',
      },
    ];
    repositories = mockRepos.map((repo) => ({
      id: repo.id,
      fullName: repo.fullName,
      defaultBranch: repo.defaultBranch,
      visibility: repo.visibility,
      state: repo.state,
    }));
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
        repositories = organizationIds.length
          ? await db
              .select({
                id: schema.githubRepositories.id,
                fullName: schema.githubRepositories.fullName,
                defaultBranch: schema.githubRepositories.defaultBranch,
                visibility: schema.githubRepositories.visibility,
                state: schema.githubRepositories.state,
              })
              .from(schema.githubRepositories)
              .where(inArray(schema.githubRepositories.organizationId, organizationIds))
          : [];
      } finally {
        await client.end().catch(() => {});
      }
    } catch (error) {
      console.warn('[TRACE] Error loading repositories from database:', error);
      installations = [];
      repositories = [];
    }
  }

  const activeRepositories = repositories.filter((repository) => repository.state === 'active');
  const currentStep = activeRepositories.length ? 4 : installations.length ? 3 : 2;
    return (
      <div className="dashboard-page">
        <SetupProgress current={currentStep} />
        <div className="dashboard-page-header">
          <div>
            <p className="section-label">Repository setup</p>
            <h1>
              {installations.length ? 'Choose your repositories.' : 'Connect your repositories.'}
            </h1>
            <p>
              {installations.length
                ? 'GitHub is connected. Select which projects should become part of this TRACE workspace.'
                : 'TRACE uses read-only access to understand commits, pull requests, issues, and project changes. You choose which repositories it can access.'}
            </p>
          </div>
          <span className="connection-state">
            {installations.length ? 'Connected' : 'Not connected'}
          </span>
        </div>
        {message ? (
          <p
            className={query.setup === 'connected' ? 'form-success' : 'auth-error-block'}
            role="status"
          >
            {message}
          </p>
        ) : null}
        {!installations.length ? (
          <section className="empty-panel empty-panel--large repository-connect-panel">
            <span aria-hidden="true">↗</span>
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
                select.
              </p>
            </details>
          </section>
        ) : repositories.length ? (
          <>
            <div className="connection-list">
              {installations.map((installation) => (
                <article className="connection-card" key={installation.id}>
                  <span className="card-label">Installation account</span>
                  <strong>{installation.accountLogin}</strong>
                  <small>
                    {installation.accountType} · {installation.state}
                  </small>
                </article>
              ))}
            </div>
            {activeRepositories.length ? (
              <section className="connected-summary">
                <div>
                  <span className="success-mark" aria-hidden="true">
                    ✓
                  </span>
                  <div>
                    <p className="section-label">TRACE is connected</p>
                    <h2>
                      {activeRepositories.length === 1
                        ? activeRepositories[0]!.fullName
                        : `${activeRepositories.length} repositories connected`}
                    </h2>
                    <p>
                      Repository access is active. Cloud analysis is not enabled in this
                      environment.
                    </p>
                  </div>
                </div>
                <Link
                  className="trace-button trace-button--secondary"
                  href={`/app/repositories/${activeRepositories[0]!.id}`}
                >
                  Open repository
                </Link>
              </section>
            ) : null}
            <RepositorySelector repositories={repositories} />
          </>
        ) : (
          <section className="empty-panel empty-panel--large">
            <span aria-hidden="true">◌</span>
            <h2>No repositories were granted</h2>
            <p>Update the GitHub App installation to grant access to at least one repository.</p>
            <Link
              className="trace-button trace-button--secondary"
              href="/api/github/install?next=/app/repositories"
            >
              Update GitHub access
            </Link>
          </section>
        )}
      </div>
    );
}
