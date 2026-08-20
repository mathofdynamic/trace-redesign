import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAuthenticatedDashboardSummary } from '../../../../../lib/dashboard-server';
import { formatDate, formatRelativeDate, presentFindingDetail } from '../../../../../lib/dashboard-state';

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ reportId: string }>;
}) {
  const { reportId } = await params;
  const { summary } = await getAuthenticatedDashboardSummary();
  const report = summary.latestReports.find((r) => r.id === reportId);
  if (!report) notFound();

  const repository = summary.repositories.find((r) => r.id === report.repositoryId);
  const relatedChanges = summary.latestChanges.filter(
    (c) =>
      c.repositoryId === report.repositoryId &&
      (report.relatedChangeIds?.includes(c.id) ||
        report.items.some((i) => i.changeId === c.id || i.changeNumber === c.number)),
  );
  const relatedFindings = summary.attention.filter(
    (a) =>
      a.repositoryId === report.repositoryId &&
      (report.relatedFindingIds?.includes(a.id) ||
        report.items.some((i) => i.findingId === a.id)),
  );

  return (
    <div className="dashboard-page redesign-page report-detail-page">
      <nav className="breadcrumb-nav" aria-label="Breadcrumb">
        <Link href="/app/reports" className="breadcrumb-back-link">
          ← Back to reports
        </Link>
      </nav>

      <header className="redesign-header">
        <div>
          <div className="report-detail-eyebrow-row">
            <span className="eyebrow">{report.artifactType.replaceAll('_', ' ')}</span>
            {repository ? (
              <Link href={`/app/repositories/${repository.id}`} className="repository-link-badge">
                {repository.fullName}
              </Link>
            ) : (
              <span className="repository-link-badge">{report.repositoryName}</span>
            )}
          </div>
          <h1>{report.title}</h1>
          <p>{report.summary || 'Approved TRACE project-memory record.'}</p>
        </div>
      </header>

      {report.freshness === 'needs-refresh' ? (
        <div className="freshness-banner freshness-banner--warning">
          <strong>Needs refresh</strong>
          <p>
            This report represents analyzed commit <code>{report.analyzedCommit?.slice(0, 12)}</code>.
            GitHub remote HEAD has advanced to <code>{report.remoteHeadCommit?.slice(0, 12)}</code>.
            Synchronized intelligence remains truthful for the analyzed commit, but a local re-analysis
            is required for current state.
          </p>
          <div className="command-stack">
            <code>git pull origin main</code>
            <code>trace analyze</code>
            <code>trace sync</code>
          </div>
        </div>
      ) : report.freshness === 'attention' ? (
        <div className="freshness-banner freshness-banner--attention">
          <strong>Sync bridge attention</strong>
          <p>
            Local report intelligence is valid for commit <code>{report.analyzedCommit?.slice(0, 12)}</code>.
            The dashboard sync bridge requires a local CLI schema update to restore automated synchronization.
          </p>
        </div>
      ) : (
        <div className="freshness-banner freshness-banner--current">
          <strong>Intelligence current</strong>
          <p>
            Analyzed commit <code>{report.analyzedCommit?.slice(0, 12)}</code> matches GitHub remote HEAD.
          </p>
        </div>
      )}

      <div className="report-facts-card redesign-facts">
        <dl className="facts-grid">
          <div>
            <dt>Repository</dt>
            <dd>
              {repository ? (
                <Link href={`/app/repositories/${repository.id}`}>{repository.fullName}</Link>
              ) : (
                report.repositoryName
              )}
            </dd>
          </div>
          <div>
            <dt>Time Window</dt>
            <dd>{report.timeWindow ?? 'Single evaluation'}</dd>
          </div>
          <div>
            <dt>Generated</dt>
            <dd>{formatDate(report.generatedAt)}</dd>
          </div>
          <div>
            <dt>Synced</dt>
            <dd>{formatRelativeDate(report.syncedAt)}</dd>
          </div>
          <div>
            <dt>Origin</dt>
            <dd>{report.origin === 'local' ? 'Local TRACE run' : 'Cloud run'}</dd>
          </div>
          <div>
            <dt>Analyzed Commit</dt>
            <dd>
              <code>{report.analyzedCommit?.slice(0, 12) ?? 'Unknown'}</code>
            </dd>
          </div>
          <div>
            <dt>Privacy Guarantee</dt>
            <dd>Source code & snippets excluded</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd className="status-badge status-badge--approved">{report.status ?? 'Approved'}</dd>
          </div>
        </dl>
      </div>

      {relatedChanges.length ? (
        <section className="report-detail-section" aria-labelledby="changes-reviewed-heading">
          <div className="redesign-section-heading">
            <span className="eyebrow">Changes</span>
            <h2 id="changes-reviewed-heading">Changes Reviewed ({relatedChanges.length})</h2>
          </div>
          <div className="redesign-list record-list-redesign">
            {relatedChanges.map((change) => (
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
        </section>
      ) : null}

      {report.items.length ? (
        <section className="report-detail-section" aria-labelledby="recorded-intelligence-heading">
          <div className="redesign-section-heading">
            <span className="eyebrow">Intelligence</span>
            <h2 id="recorded-intelligence-heading">Recorded Findings & Verification</h2>
          </div>
          <div className="redesign-list finding-list-redesign">
            {report.items.map((item) => (
              <div className="finding-row-redesign" key={item.id}>
                <div className="finding-row-redesign__severity">
                  <span className="severity-label" data-severity={item.severity ?? 'low'}>
                    {item.severity ?? 'low'}
                  </span>
                  <small>{item.classification ?? 'deterministic'}</small>
                </div>
                <div className="finding-row-redesign__body">
                  <h3>{item.title}</h3>
                  <p>{presentFindingDetail(item.detail)}</p>
                  {item.evidence.length ? (
                    <div className="evidence-chip-list">
                      {item.evidence.map((ev) => (
                        <span key={ev} className="evidence-chip">
                          {ev}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="report-detail-section" aria-labelledby="approved-record-heading">
        <div className="redesign-section-heading">
          <span className="eyebrow">Approved Record</span>
          <h2 id="approved-record-heading">Canonical TRACE Markdown</h2>
        </div>
        <div className="approved-record-view">
          <pre className="safe-markdown">{report.content}</pre>
        </div>
      </section>
    </div>
  );
}
