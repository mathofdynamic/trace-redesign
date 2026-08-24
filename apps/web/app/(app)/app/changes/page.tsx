import Link from 'next/link';
import { getAuthenticatedDashboardSummary } from '../../../../lib/dashboard-server';
import { ChangesView } from '../_components/changes-view';

export default async function ChangesPage() {
  const { summary } = await getAuthenticatedDashboardSummary();
  return (
    <div className="dashboard-page redesign-page" id="changes-dashboard-page">
      <header className="redesign-header">
        <div>
          <p className="section-label">Active changes</p>
          <h1>Work currently moving through the project.</h1>
          <p className="redesign-header__description">
            Pull request snapshots stored from connected GitHub repositories. This is project
            context, not individual activity scoring.
          </p>
        </div>
      </header>
      {summary.latestChanges.length ? (
        <ChangesView
          changes={summary.latestChanges}
          repositories={summary.repositories}
          conflicts={summary.conflicts}
          attention={summary.attention}
        />
      ) : (
        <div className="empty-panel empty-panel--large">
          <span aria-hidden="true">↗</span>
          <h2>No active changes stored</h2>
          <p>
            {summary.setup.repositorySelected
              ? 'This is normal when no pull request webhook snapshots have reached TRACE.'
              : 'Connect a repository before TRACE can receive project changes.'}
          </p>
          <Link className="trace-button trace-button--secondary" href="/app/repositories">
            {summary.setup.repositorySelected ? 'View repositories' : 'Connect repository'}
          </Link>
        </div>
      )}
    </div>
  );
}

