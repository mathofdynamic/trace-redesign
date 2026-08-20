import Link from 'next/link';
import { getAuthenticatedDashboardSummary } from '../../../../lib/dashboard-server';
import { eq } from 'drizzle-orm';
import { schema } from '@trace/db';
import { createRequestDatabase } from '../../../../lib/request-database';
import { ConnectionActions } from './connection-actions';
import { formatDate, formatRelativeDate } from '../../../../lib/dashboard-state';
import { isMockModeEnabled, mockDataProvider, MOCK_PRIMARY_USER } from '../../../../lib/mock';

export default async function SettingsPage() {
  const { summary, session } = await getAuthenticatedDashboardSummary();
  let connections: (typeof schema.cliConnections.$inferSelect)[] = [];
  const isMock = isMockModeEnabled() || session.user.id === MOCK_PRIMARY_USER.id;

  if (isMock) {
    connections = mockDataProvider.getDevices().map((dev) => ({
      ...dev,
      createdAt: new Date(dev.createdAt),
      updatedAt: new Date(dev.updatedAt),
      expiresAt: new Date(dev.expiresAt),
      lastUsedAt: dev.lastUsedAt ? new Date(dev.lastUsedAt) : null,
      revokedAt: dev.revokedAt ? new Date(dev.revokedAt) : null,
    }));
  } else {
    try {
      const { db, client } = await createRequestDatabase();
      connections = await db
        .select()
        .from(schema.cliConnections)
        .where(eq(schema.cliConnections.userId, session.user.id))
        .orderBy(schema.cliConnections.createdAt)
        .finally(async () => client.end().catch(() => {}));
    } catch (error) {
      console.warn('[TRACE] Error loading CLI connections from database:', error);
      connections = [];
    }
  }

  const activeConnections = connections.filter((connection) => !connection.revokedAt);
  const revokedConnections = connections.filter((connection) => Boolean(connection.revokedAt));

  return (
    <div className="dashboard-page redesign-page settings-page">
      <header className="redesign-header">
        <div>
          <span className="eyebrow">Settings</span>
          <h1>Workspace and trust boundaries.</h1>
          <p>
            Understand what is connected, what local TRACE sends, and which computers can
            synchronize approved records.
          </p>
        </div>
      </header>
      <div className="settings-layout">
        <section className="redesign-section">
          <span className="eyebrow">Workspace</span>
          <h2>{summary.workspace.name}</h2>
          <dl className="fact-list">
            <div>
              <dt>Organization ID</dt>
              <dd>ws-northstar-001</dd>
            </div>
            <div>
              <dt>Current User</dt>
              <dd>{session.user.name || 'Mohammad Mohammadi'} (Engineering Lead)</dd>
            </div>
            <div>
              <dt>Team Members</dt>
              <dd>9 team members</dd>
            </div>
            <div>
              <dt>Usage</dt>
              <dd>{summary.workspace.intendedUsage ?? 'Team'}</dd>
            </div>
            <div>
              <dt>Execution Mode</dt>
              <dd>{summary.workspace.executionMode ?? 'Local TRACE'}</dd>
            </div>
            <div>
              <dt>Connected Repositories</dt>
              <dd>{summary.repositories.length} repositories</dd>
            </div>
          </dl>
        </section>

        <section className="redesign-section">
          <span className="eyebrow">GitHub Connection</span>
          <h2>Repository Integration</h2>
          <dl className="fact-list">
            <div>
              <dt>Installation</dt>
              <dd>Northstar Engineering (GitHub App)</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>
                <span className="state-pill state-tone--success">Connected</span>
              </dd>
            </div>
            <div>
              <dt>Available Repositories</dt>
              <dd>{summary.repositories.length} repositories selected</dd>
            </div>
            <div>
              <dt>Permissions</dt>
              <dd>Read-only (Metadata, Pull Requests, Commits)</dd>
            </div>
            <div>
              <dt>Last Verification</dt>
              <dd>Aug 19, 2026, 10:45 AM</dd>
            </div>
            <div>
              <dt>Default Branch</dt>
              <dd><code>main</code></dd>
            </div>
          </dl>
        </section>

        <section className="redesign-section settings-wide" aria-labelledby="connections-title">
          <div className="section-heading-row redesign-section-heading">
            <div>
              <span className="eyebrow">Local TRACE</span>
              <h2 id="connections-title">Authorized computers</h2>
            </div>
            <span className="quiet-count">{activeConnections.length} active</span>
          </div>
          <p className="section-lead">
            These computers are authorized to send approved TRACE records to this workspace. Tokens are stored as one-way
            hashes on the server and never include your browser session credentials.
          </p>
          {activeConnections.length ? (
            <ul className="connection-list connection-list-redesign">
              {activeConnections.map((connection) => (
                <li key={connection.id}>
                  <div>
                    <strong>{connection.label}</strong>
                    <span>
                      Workspace: {summary.workspace.name} · Last used{' '}
                      {connection.lastUsedAt ? formatDate(connection.lastUsedAt.toISOString()) : 'never'} · expires{' '}
                      {connection.expiresAt ? formatDate(connection.expiresAt.toISOString()) : 'never'}
                    </span>
                  </div>
                  <ConnectionActions id={connection.id} label={connection.label} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="inline-empty redesign-empty">
              <strong>No active authorized computers</strong>
              <p>
                Run <code>trace login</code> locally to authorize a computer.
              </p>
            </div>
          )}
          {revokedConnections.length ? (
            <details className="technical-details">
              <summary>Revoked computers ({revokedConnections.length})</summary>
              <ul className="connection-list connection-list-redesign">
                {revokedConnections.map((connection) => (
                  <li key={connection.id}>
                    <div>
                      <strong>{connection.label}</strong>
                      <span>
                        Revoked {connection.revokedAt ? formatDate(connection.revokedAt.toISOString()) : 'recently'} · Future synchronization blocked · Historical project records preserved
                      </span>
                    </div>
                    <span className="state-pill state-tone--danger">Revoked</span>
                  </li>
                ))}
              </ul>
            </details>
          ) : null}
        </section>

        <section className="redesign-section settings-wide">
          <span className="eyebrow">Privacy and synchronization</span>
          <h2>What local TRACE sends</h2>
          <dl className="fact-list">
            <div>
              <dt>Synchronized Records</dt>
              <dd>Approved .trace projection manifests, rule checks, report summaries, checksum digests, branch ref, and commit SHA</dd>
            </div>
            <div>
              <dt>Excluded by Design</dt>
              <dd>Repository source files, inline code snippets, confidential environment variables, personal keys, and secrets</dd>
            </div>
            <div>
              <dt>Analysis Execution</dt>
              <dd>Runs locally on your workstation using the TRACE CLI engine</dd>
            </div>
            <div>
              <dt>Pre-Flight Review</dt>
              <dd>
                Run <code>trace sync --dry-run</code> to inspect approved manifests before transmission
              </dd>
            </div>
          </dl>
        </section>

        <section className="redesign-section">
          <span className="eyebrow">Local execution</span>
          <h2>Local CLI Workflow</h2>
          <p className="section-lead">
            Browser sessions do not execute repository analysis. Run the TRACE CLI locally to build and synchronize project intelligence.
          </p>
          <div className="command-guide" style={{ marginTop: '0.75rem' }}>
            <div style={{ marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-muted)' }}>1. Run local AST analysis</span>
              <div><code>trace analyze</code></div>
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-muted)' }}>2. Review manifest payload</span>
              <div><code>trace sync --dry-run</code></div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-muted)' }}>3. Synchronize approved records</span>
              <div><code>trace sync</code></div>
            </div>
          </div>
        </section>

        <section className="redesign-section">
          <span className="eyebrow">Account</span>
          <h2>Signed in as {session.user.name || 'Mohammad Mohammadi'}</h2>
          <dl className="fact-list" style={{ marginBottom: '1rem' }}>
            <div>
              <dt>Email</dt>
              <dd>{session.user.email || 'mohammad@northstar.engineering'}</dd>
            </div>
            <div>
              <dt>GitHub</dt>
              <dd>@{(session.user as { githubLogin?: string }).githubLogin || 'mohammadm'}</dd>
            </div>
            <div>
              <dt>Role</dt>
              <dd>Engineering Lead</dd>
            </div>
          </dl>
          <a className="trace-button trace-button--secondary" href="/api/auth/sign-out">
            Sign out
          </a>
        </section>
      </div>
    </div>
  );
}

