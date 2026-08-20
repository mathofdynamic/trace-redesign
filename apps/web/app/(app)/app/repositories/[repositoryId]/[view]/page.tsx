import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAuthenticatedDashboardSummary } from '../../../../../../lib/dashboard-server';
import { FindingDisclosure, ProjectContextSummary } from '../../../_components/trace-redesign';
import { formatDate, formatRelativeDate, presentFindingDetail } from '../../../../../../lib/dashboard-state';
import { RepositoryTabs } from '../../../_components/repository-tabs';

export default async function RepositoryViewPage({
  params,
}: {
  params: Promise<{ repositoryId: string; view: string }>;
}) {
  const { repositoryId, view } = await params;
  if (view !== 'pull-requests' && view !== 'findings' && view !== 'reports') notFound();
  const { summary } = await getAuthenticatedDashboardSummary();
  const repository = summary.repositories.find((item) => item.id === repositoryId);
  if (!repository) notFound();
  const changes = summary.latestChanges.filter((item) => item.repositoryId === repository.id);
  const findings = summary.attention.filter(
    (item) =>
      item.repositoryId === repository.id && ['finding', 'risk', 'conflict'].includes(item.kind),
  );
  const reports = summary.latestReports.filter((item) => item.repositoryId === repository.id);

  const getHeading = () => {
    switch (view) {
      case 'pull-requests':
        return 'Changes';
      case 'findings':
        return 'Findings';
      case 'reports':
        return 'Reports';
      default:
        return 'Overview';
    }
  };

  return (
    <div className="dashboard-page redesign-page repository-page">
      <header className="redesign-header">
        <div>
          <span className="eyebrow">{repository.fullName}</span>
          <h1>{getHeading()}</h1>
          <ProjectContextSummary repository={repository} attention={summary.attention} />
        </div>
      </header>
      <RepositoryTabs repositoryId={repositoryId} />
      {view === 'pull-requests' ? (
        changes.length ? (
          <div className="redesign-list record-list-redesign">
            {changes.map((change) => (
              <article className="redesign-list-row" key={change.id}>
                <div>
                  <span className="record-index">#{change.number}</span>
                  <strong>{change.title}</strong>
                  <small>
                    {change.state} · {change.authorLogin ?? 'Author unavailable'}
                    {change.branch ? ` · ${change.branch}` : ''}
                    {change.affectedAreas?.length ? ` · ${change.affectedAreas.join(', ')}` : ''}
                  </small>
                </div>
                {change.url ? <a href={change.url}>Open on GitHub</a> : null}
              </article>
            ))}
          </div>
        ) : (
          <div className="inline-empty redesign-empty redesign-empty--large">
            <strong>No pull request snapshots yet</strong>
            <p>Signed GitHub activity will appear here when it is processed for this repository.</p>
          </div>
        )
      ) : view === 'findings' ? (
        findings.length ? (
          <div className="redesign-list finding-list-redesign finding-list-redesign--standalone">
            {findings.map((finding) => (
              <div className="finding-row-redesign" key={finding.id}>
                <div className="finding-row-redesign__severity">
                  <span className="severity-label" data-severity={finding.severity}>
                    {finding.severity}
                  </span>
                  <small>
                    {finding.evidence.length} evidence reference
                    {finding.evidence.length === 1 ? '' : 's'}
                  </small>
                </div>
                <div className="finding-row-redesign__body">
                  <h2>{finding.title}</h2>
                  <p>{presentFindingDetail(finding.detail)}</p>
                  <small>
                    {finding.classification === 'deterministic'
                      ? 'Verified local evidence'
                      : `${finding.classification} interpretation`}
                  </small>
                </div>
                <FindingDisclosure
                  finding={finding}
                  repositoryName={repository.fullName}
                  repository={repository}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="inline-empty redesign-empty redesign-empty--large">
            <strong>
              {repository.analysis?.status === 'completed'
                ? 'No unresolved findings'
                : 'No findings yet'}
            </strong>
            <p>
              {repository.analysis?.status === 'completed'
                ? 'The latest persisted run has nothing requiring review.'
                : 'Run local TRACE analysis before expecting findings here.'}
            </p>
          </div>
        )
      ) : reports.length ? (
        <div className="redesign-list record-list-redesign">
          {reports.map((report) => (
            <article className="redesign-list-row report-row" key={report.id}>
              <div>
                <span className="report-type">{report.artifactType.replaceAll('_', ' ')}</span>
                <h3>
                  <Link href={`/app/reports/${report.id}`}>{report.title}</Link>
                </h3>
                <p>{report.summary || 'Approved TRACE record.'}</p>
                <small>
                  {formatDate(report.generatedAt)} · Synced {formatRelativeDate(report.syncedAt)}
                  {report.freshness === 'needs-refresh'
                    ? ' · Needs refresh (newer commits on GitHub)'
                    : report.freshness === 'attention'
                      ? ' · Sync attention'
                      : ' · Current'}
                </small>
              </div>
              <Link className="trace-button trace-button--secondary" href={`/app/reports/${report.id}`}>
                View report
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <div className="inline-empty redesign-empty redesign-empty--large">
          <strong>No reports synchronized for this repository</strong>
          <p>
            {repository.analysis?.status === 'completed'
              ? 'Generate and approve a local report (`trace report daily`), then execute `trace sync`.'
              : 'Run local TRACE analysis before generating reports for this repository.'}
          </p>
        </div>
      )}
    </div>
  );
}
