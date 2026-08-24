import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAuthenticatedDashboardSummary } from '../../../../../../lib/dashboard-server';
import {
  deriveTraceProjectState,
  formatDate,
  formatRelativeDate,
  presentFindingDetail,
  stateToneClass,
} from '../../../../../../lib/dashboard-state';
import {
  FindingDisclosure,
  ProjectStatusGlyph,
} from '../../../_components/trace-redesign';
import { RepositoryTabs } from '../../../_components/repository-tabs';
import { RepositoryFindingsView } from '../../../_components/repository-findings-view';

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
  const state = deriveTraceProjectState(repository, summary.attention);
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
    <div className="dashboard-page redesign-page repository-page" id={`repository-${view}-view`}>
      <header className="redesign-header repository-command-header">
        <div className="repository-identity-block">
          <div className="repository-identity-block__topline">
            <Link className="repository-identity-block__parent-link" href={`/app/repositories/${repository.id}`}>
              ← {repository.fullName}
            </Link>
            <span className="repository-identity-block__sep" aria-hidden="true">·</span>
            <span className="repository-identity-block__visibility">{repository.visibility}</span>
          </div>
          <div className="repository-identity-block__title-row">
            <h1 className="repository-identity-block__name">{getHeading()}</h1>
            <span className={`state-pill ${stateToneClass(state.tone)}`}>
              <ProjectStatusGlyph stateKey={state.key} />
              <span>{state.label}</span>
            </span>
          </div>
          <p className="repository-identity-block__description">
            {view === 'pull-requests'
              ? `Signed pull requests and branch changes processed for ${repository.fullName}.`
              : view === 'findings'
                ? `Active findings and deterministic engineering evidence for ${repository.fullName}.`
                : `Approved project memory reports and summaries synchronized for ${repository.fullName}.`}
          </p>
        </div>
        <div className="header-actions">
          <Link className="trace-button trace-button--secondary" href={`/app/repositories/${repository.id}`}>
            Repository overview
          </Link>
        </div>
      </header>

      <RepositoryTabs
        repositoryId={repositoryId}
        counts={{
          changes: changes.length,
          findings: findings.length,
          reports: reports.length,
        }}
      />

      {view === 'pull-requests' ? (
        changes.length ? (
          <div className="redesign-list record-list-redesign">
            {changes.map((change) => (
              <article className="repository-recent-row" key={change.id}>
                <div className="repository-recent-row__info">
                  <div className="repository-recent-row__header">
                    <span className="change-pr-number">PR #{change.number}</span>
                    <span className="change-state-tag" data-state={change.state}>{change.state}</span>
                    <span className="repository-recent-row__date">{formatRelativeDate(change.updatedAt)}</span>
                  </div>
                  <h2 className="repository-recent-row__title">{change.title}</h2>
                  <div className="repository-recent-row__meta">
                    <span>{change.authorLogin ?? 'Author unavailable'}</span>
                    {change.branch ? (
                      <>
                        <span className="meta-sep" aria-hidden="true">·</span>
                        <code>{change.branch}</code>
                      </>
                    ) : null}
                    {change.affectedAreas?.length ? (
                      <>
                        <span className="meta-sep" aria-hidden="true">·</span>
                        <span>{change.affectedAreas.join(', ')}</span>
                      </>
                    ) : null}
                  </div>
                </div>
                {change.url ? (
                  <div className="repository-recent-row__action">
                    <a
                      className="trace-button trace-button--secondary trace-button--small"
                      href={change.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open on GitHub ↗
                    </a>
                  </div>
                ) : null}
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
        <RepositoryFindingsView findings={findings} repository={repository} />
      ) : reports.length ? (
        <div className="redesign-list record-list-redesign">
          {reports.map((report) => (
            <article className="repository-recent-row" key={report.id}>
              <div className="repository-recent-row__info">
                <div className="repository-recent-row__header">
                  <span className="report-type-badge">{report.artifactType.replaceAll('_', ' ')}</span>
                  <span className="repository-recent-row__date">{formatRelativeDate(report.generatedAt)}</span>
                </div>
                <h2 className="repository-recent-row__title">
                  <Link href={`/app/reports/${report.id}`}>{report.title}</Link>
                </h2>
                <p className="repository-recent-row__summary">{report.summary || 'Approved local record.'}</p>
                <div className="repository-recent-row__meta">
                  <span className="report-freshness-tag" data-freshness={report.freshness}>
                    {report.freshness === 'needs-refresh'
                      ? 'Needs refresh'
                      : report.freshness === 'attention'
                        ? 'Sync attention'
                        : 'Current'}
                  </span>
                  <span className="meta-sep" aria-hidden="true">·</span>
                  <time dateTime={report.generatedAt}>{formatDate(report.generatedAt)}</time>
                </div>
              </div>
              <div className="repository-recent-row__action">
                <Link className="trace-button trace-button--secondary trace-button--small" href={`/app/reports/${report.id}`}>
                  View report
                </Link>
              </div>
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
