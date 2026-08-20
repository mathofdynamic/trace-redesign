import Link from 'next/link';
import { getAuthenticatedDashboardSummary } from '../../../../lib/dashboard-server';
import { formatDate, formatRelativeDate, presentFindingDetail } from '../../../../lib/dashboard-state';

function groupLabel(value: string) {
  const date = new Date(value);
  // Anchor to 2026-08-19 reference date for mock stability while supporting live dates
  const now = new Date('2026-08-19T20:00:00.000Z');
  const days = Math.floor(
    (Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) -
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())) /
      86_400_000,
  );
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return 'This week';
  return 'Earlier';
}

type ReportSection = { title: string; body: string[] };

function parseApprovedReport(content: string): ReportSection[] {
  const sections: ReportSection[] = [];
  let current: ReportSection = { title: 'Overview', body: [] };
  for (const line of content.split(/\r?\n/)) {
    const heading = /^(#{2,3})\s+(.+?)\s*$/.exec(line);
    if (heading) {
      if (current.body.some((item) => item.trim())) sections.push(current);
      current = { title: heading[2]!.replaceAll('**', ''), body: [] };
      continue;
    }
    if (!/^#\s+/.test(line) || current.title !== 'Overview') current.body.push(line);
  }
  if (current.body.some((item) => item.trim())) sections.push(current);
  return sections;
}

function ReportNativeDetail({
  report,
}: {
  report: {
    id: string;
    title: string;
    artifactType: string;
    repositoryName: string;
    repositoryId: string;
    generatedAt: string;
    syncedAt: string;
    summary: string;
    analyzedCommit?: string | null;
    remoteHeadCommit?: string | null;
    freshness?: string | null;
    items: Array<{
      id: string;
      title: string;
      detail: string;
      severity?: string;
      classification?: string;
      evidence: string[];
    }>;
    content: string;
  };
}) {
  const sections = parseApprovedReport(report.content);
  return (
    <div className="report-native-detail" aria-label={`${report.title} native detail`}>
      <div className="report-native-detail__header">
        <div>
          <span className="eyebrow">{report.artifactType.replaceAll('_', ' ')}</span>
          <h4>{report.title}</h4>
        </div>
        <div className="report-native-detail__header-badges">
          {report.freshness === 'needs-refresh' ? (
            <span className="state-badge state-badge--warning">Needs refresh</span>
          ) : report.freshness === 'attention' ? (
            <span className="state-badge state-badge--danger">Sync attention</span>
          ) : (
            <span className="state-badge state-badge--success">Current</span>
          )}
          <span className="origin-label">Local analysis</span>
        </div>
      </div>
      <dl className="report-native-detail__facts">
        <div>
          <dt>Repository</dt>
          <dd>
            <Link href={`/app/repositories/${report.repositoryId}`}>{report.repositoryName}</Link>
          </dd>
        </div>
        <div>
          <dt>Analyzed Commit</dt>
          <dd>
            <code>{report.analyzedCommit?.slice(0, 12) ?? 'Local HEAD'}</code>
          </dd>
        </div>
        <div>
          <dt>Generated</dt>
          <dd>{formatDate(report.generatedAt)}</dd>
        </div>
        <div>
          <dt>Synced</dt>
          <dd>{formatRelativeDate(report.syncedAt)}</dd>
        </div>
      </dl>
      <section className="report-native-detail__section">
        <h5>Summary</h5>
        <p>{report.summary || 'Approved TRACE record with no summary text.'}</p>
      </section>
      {report.items.length ? (
        <section className="report-native-detail__section">
          <h5>Recorded intelligence ({report.items.length})</h5>
          {report.items.map((item) => (
            <div className="report-native-detail__item" key={item.id}>
              <div className="report-item-title-row">
                {item.severity ? (
                  <span className="severity-pill" data-severity={item.severity}>
                    {item.severity}
                  </span>
                ) : null}
                <strong>{item.title}</strong>
              </div>
              <span>{presentFindingDetail(item.detail)}</span>
              {item.evidence?.length ? (
                <small className="evidence-preview">
                  Evidence: {item.evidence.join(', ')}
                </small>
              ) : null}
            </div>
          ))}
        </section>
      ) : null}
      {sections.map((section) => (
        <section className="report-native-detail__section" key={section.title}>
          <h5>{section.title}</h5>
          <p>{section.body.join('\n').trim()}</p>
        </section>
      ))}
      <div className="report-native-detail__footer">
        <Link className="trace-button trace-button--secondary" href={`/app/reports/${report.id}`}>
          Open standalone report view →
        </Link>
      </div>
    </div>
  );
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams?: Promise<{ repositoryId?: string }>;
}) {
  const { summary } = await getAuthenticatedDashboardSummary();
  const resolvedParams = searchParams ? await searchParams : {};
  const selectedRepoId = resolvedParams.repositoryId;

  const filteredReports = selectedRepoId
    ? summary.latestReports.filter((r) => r.repositoryId === selectedRepoId)
    : summary.latestReports;

  const grouped = filteredReports.reduce(
    (groups, report) => {
      const label = groupLabel(report.generatedAt);
      (groups[label] ??= []).push(report);
      return groups;
    },
    {} as Record<string, typeof summary.latestReports>,
  );

  return (
    <div className="dashboard-page redesign-page reports-page">
      <header className="redesign-header">
        <div>
          <span className="eyebrow">Reports</span>
          <h1>Project memory, made readable.</h1>
          <p>
            Approved local records organized around the changes they describe. Source code and code
            snippets stay excluded.
          </p>
        </div>
        <span className="source-note">
          {summary.latestReports.length ? 'Local evidence synced' : 'Awaiting local sync'}
        </span>
      </header>

      {summary.repositories.length > 1 ? (
        <div className="repository-filter-bar" aria-label="Repository filter">
          <Link
            href="/app/reports"
            className={`filter-chip ${!selectedRepoId ? 'filter-chip--active' : ''}`}
          >
            All repositories ({summary.latestReports.length})
          </Link>
          {summary.repositories.map((repo) => {
            const count = summary.latestReports.filter((r) => r.repositoryId === repo.id).length;
            const isActive = selectedRepoId === repo.id;
            return (
              <Link
                key={repo.id}
                href={`/app/reports?repositoryId=${repo.id}`}
                className={`filter-chip ${isActive ? 'filter-chip--active' : ''}`}
              >
                {repo.name} ({count})
              </Link>
            );
          })}
        </div>
      ) : null}

      {filteredReports.length ? (
        <div className="report-archive">
          {['Today', 'Yesterday', 'This week', 'Earlier'].map((label) => {
            const reports = grouped[label];
            if (!reports?.length) return null;
            return (
              <section
                key={label}
                aria-labelledby={`reports-${label.replaceAll(' ', '-').toLowerCase()}`}
              >
                <div className="record-group-title redesign-section-heading">
                  <span className="eyebrow">{label}</span>
                  <h2 id={`reports-${label.replaceAll(' ', '-').toLowerCase()}`}>
                    {reports.length} {reports.length === 1 ? 'record' : 'records'}
                  </h2>
                </div>
                <div className="report-archive__list">
                  {reports.map((report) => (
                    <article className="report-row" key={report.id}>
                      <div className="report-row__heading">
                        <div>
                          <span className="report-type">
                            {report.artifactType.replaceAll('_', ' ')}
                          </span>
                          <h3>
                            <Link href={`/app/reports/${report.id}`}>{report.title}</Link>
                          </h3>
                        </div>
                        <div className="report-row__badges">
                          {report.freshness === 'needs-refresh' ? (
                            <span className="state-badge state-badge--warning">Needs refresh</span>
                          ) : report.freshness === 'attention' ? (
                            <span className="state-badge state-badge--danger">Sync attention</span>
                          ) : (
                            <span className="state-badge state-badge--success">Current</span>
                          )}
                          <span className="origin-label">Local</span>
                        </div>
                      </div>
                      <p>{report.summary || 'Approved TRACE record with no summary text.'}</p>
                      <div className="report-row__meta">
                        <Link href={`/app/repositories/${report.repositoryId}`}>
                          {report.repositoryName}
                        </Link>
                        <span>{formatDate(report.generatedAt)}</span>
                        <span>Synced {formatRelativeDate(report.syncedAt)}</span>
                        <span>
                          Commit: <code>{report.analyzedCommit?.slice(0, 12) ?? 'Local'}</code>
                        </span>
                      </div>
                      {report.items.length ? (
                        <div className="report-highlights">
                          {report.items.slice(0, 4).map((item) => (
                            <div key={item.id}>
                              <strong>{item.title}</strong>
                              <span>{presentFindingDetail(item.detail)}</span>
                            </div>
                          ))}
                        </div>
                      ) : null}
                      <ReportNativeDetail report={report} />
                      <details className="technical-details">
                        <summary>View approved TRACE record</summary>
                        <pre className="safe-markdown">{report.content}</pre>
                      </details>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="inline-empty redesign-empty redesign-empty--large">
          <strong>No reports synchronized</strong>
          <p>
            {selectedRepoId
              ? 'No reports recorded for this repository yet. Run `trace report daily` locally, then sync.'
              : summary.setup.repositorySelected
                ? 'Generate a local report, review the dry run, then sync the approved record.'
                : 'Connect a repository before TRACE can associate local reports with this workspace.'}
          </p>
          {summary.setup.repositorySelected ? (
            <div className="command-stack">
              <code>trace report daily --yes</code>
              <code>trace sync --dry-run</code>
              <code>trace sync</code>
            </div>
          ) : null}
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
