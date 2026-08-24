import { describe, expect, it } from 'vitest';
import { mockDataProvider } from '../mock/adapter';
import { MOCK_REPORTS, getReportById, getReportsForRepository, getRelatedEntitiesForReport } from '../mock/reports';

describe('Phase 17: Reports Library Surface (/app/reports)', () => {
  it('preserves all 12 frozen reports and exact repository distribution', () => {
    const universe = mockDataProvider.getUniverse();
    const reports = universe.reports;

    expect(reports).toHaveLength(12);

    const traceReports = reports.filter((r) => r.repositoryId === 'repo-trace-001');
    const radarReports = reports.filter((r) => r.repositoryId === 'repo-radar-002');
    const atlasReports = reports.filter((r) => r.repositoryId === 'repo-atlas-003');
    const orbitReports = reports.filter((r) => r.repositoryId === 'repo-orbit-004');
    const novaReports = reports.filter((r) => r.repositoryId === 'repo-nova-005');

    expect(traceReports).toHaveLength(5);
    expect(radarReports).toHaveLength(2);
    expect(atlasReports).toHaveLength(3);
    expect(orbitReports).toHaveLength(2);
    expect(novaReports).toHaveLength(0); // Truthful empty state for Nova
  });

  it('validates 5 distinct artifact types with accurate counts', () => {
    const universe = mockDataProvider.getUniverse();
    const reports = universe.reports;

    const dailyBriefs = reports.filter((r) => r.artifactType === 'daily_report');
    const weeklyRollups = reports.filter((r) => r.artifactType === 'weekly_report');
    const archReviews = reports.filter((r) => r.artifactType === 'architecture_review');
    const securityAudits = reports.filter((r) => r.artifactType === 'security_audit');
    const perfReviews = reports.filter((r) => r.artifactType === 'performance_review');

    expect(dailyBriefs).toHaveLength(4); // TRACE, Radar, Atlas, Orbit
    expect(weeklyRollups).toHaveLength(2); // TRACE, Radar
    expect(archReviews).toHaveLength(3); // TRACE, Atlas, Orbit
    expect(securityAudits).toHaveLength(2); // TRACE, Atlas
    expect(perfReviews).toHaveLength(1); // TRACE
  });

  it('verifies deterministic synchronization freshness states across repositories', () => {
    const universe = mockDataProvider.getUniverse();
    const reports = universe.reports;

    const currentReports = reports.filter((r) => !r.freshness || r.freshness === 'current');
    const needsRefreshReports = reports.filter((r) => r.freshness === 'needs-refresh');
    const attentionReports = reports.filter((r) => r.freshness === 'attention');

    expect(currentReports).toHaveLength(5); // Radar (2) + Atlas (3)
    expect(needsRefreshReports).toHaveLength(5); // TRACE (5)
    expect(attentionReports).toHaveLength(2); // Orbit (2)

    // TRACE analyzed commit is the benchmark commit
    for (const report of needsRefreshReports) {
      expect(report.repositoryId).toBe('repo-trace-001');
      expect(report.analyzedCommit).toBe('4953addc8992f882a1c983bad061fb8035213276');
      expect(report.freshness).toBe('needs-refresh');
    }

    // Orbit sync attention indicates CLI manifest schema discrepancy
    for (const report of attentionReports) {
      expect(report.repositoryId).toBe('repo-orbit-004');
      expect(report.freshness).toBe('attention');
    }
  });

  it('verifies privacy guarantees and anti-surveillance compliance', () => {
    const universe = mockDataProvider.getUniverse();
    const reports = universe.reports;

    for (const report of reports) {
      // Must not contain developer scores or rankings
      expect(report.content).not.toMatch(/developer score/i);
      expect(report.content).not.toMatch(/rank\s*#/i);
      expect(report.content).not.toMatch(/performance ranking/i);
      expect(report.content).not.toMatch(/productivity score/i);

      // Must explicitly note privacy preservation or excluded source code
      expect(report.content).toMatch(/source code.*(?:excluded|never transmitted|transmitted)|privacy-preserving/i);

      // Origin must be approved local sync
      expect(report.origin).toBe('local');
      expect(report.status).toBe('approved');
    }
  });

  it('verifies related entity relationships for reports', () => {
    // Check TRACE daily brief
    const traceDailyBrief = getReportById('report-trace-001');
    expect(traceDailyBrief).toBeDefined();

    const related = getRelatedEntitiesForReport('report-trace-001');
    expect(related.changes.length).toBeGreaterThanOrEqual(3);
    expect(related.findings.length).toBeGreaterThanOrEqual(1);
    expect(related.evidence.length).toBeGreaterThanOrEqual(1);

    // Verify change numbers match
    const changeNumbers = related.changes.map((c) => c.number);
    expect(changeNumbers).toContain(101);
    expect(changeNumbers).toContain(102);
    expect(changeNumbers).toContain(103);
  });

  it('validates helper functions for repository filtering', () => {
    const traceReports = getReportsForRepository('repo-trace-001');
    expect(traceReports).toHaveLength(5);

    const atlasReports = getReportsForRepository('repo-atlas-003');
    expect(atlasReports).toHaveLength(3);

    const novaReports = getReportsForRepository('repo-nova-005');
    expect(novaReports).toHaveLength(0);
  });
});
