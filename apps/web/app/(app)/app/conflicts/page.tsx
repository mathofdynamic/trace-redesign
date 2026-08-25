import Link from 'next/link';
import { getAuthenticatedDashboardSummary } from '../../../../lib/dashboard-server';
import { ConflictsView } from '../_components/conflicts-view';

export default async function ConflictsPage() {
  const { summary } = await getAuthenticatedDashboardSummary();
  return (
    <div className="dashboard-page conflicts-page-redesign">
      <div className="dashboard-page-header">
        <div>
          <span className="eyebrow">Engineering Coordination</span>
          <h1>Active Conflicts</h1>
          <p>
            Deterministic cross-PR AST collision discovery and architectural boundary analysis.
            Evidence remains distinct from interpretation.
          </p>
        </div>
        <span className="availability-label">
          {summary.conflicts.length ? `${summary.conflicts.length} synced` : 'No records synced'}
        </span>
      </div>

      {summary.conflicts.length ? (
        <ConflictsView
          conflicts={summary.conflicts}
          changes={summary.latestChanges}
          repositories={summary.repositories}
          attention={summary.attention}
        />
      ) : (
        <div className="empty-panel empty-panel--large">
          <h2>No conflict records synced</h2>
          <p>
            {summary.setup.repositorySelected
              ? 'This is not yet a claim that no conflicts exist. Run local analysis and sync an approved conflict artifact.'
              : 'Connect a repository before TRACE can associate conflict evidence.'}
          </p>
          <Link
            className="trace-button trace-button--secondary"
            href={summary.setup.repositorySelected ? '/docs#local-dashboard' : '/app/repositories'}
          >
            {summary.setup.repositorySelected ? 'View local workflow' : 'Connect repository'}
          </Link>
        </div>
      )}
    </div>
  );
}

