import { describe, expect, it } from 'vitest';
import { mockDataProvider } from '../adapter';
import {
  MOCK_REPORTS,
  getReportById,
  getReportsForRepository,
  getRelatedEntitiesForReport,
} from '../reports';

describe('Phase 3B: Reports, Report Details, and Project Memory', () => {
  it('preserves the required 5-repository universe and item counts', () => {
    const universe = mockDataProvider.getUniverse();
    const repos = universe.repositories;

    expect(repos).toHaveLength(5);

    const trace = repos.find((r) => r.id === 'repo-trace-001')!;
    const radar = repos.find((r) => r.id === 'repo-radar-002')!;
    const atlas = repos.find((r) => r.id === 'repo-atlas-003')!;
    const orbit = repos.find((r) => r.id === 'repo-orbit-004')!;
    const nova = repos.find((r) => r.id === 'repo-nova-005')!;

    expect(trace).toBeDefined();
    expect(radar).toBeDefined();
    expect(atlas).toBeDefined();
    expect(orbit).toBeDefined();
    expect(nova).toBeDefined();

    // Changes: TRACE=3, Radar=1, Atlas=3, Orbit=2, Nova=0 -> Total 9
    expect(universe.changes.filter((c) => c.repositoryId === trace.id)).toHaveLength(3);
    expect(universe.changes.filter((c) => c.repositoryId === radar.id)).toHaveLength(1);
    expect(universe.changes.filter((c) => c.repositoryId === atlas.id)).toHaveLength(3);
    expect(universe.changes.filter((c) => c.repositoryId === orbit.id)).toHaveLength(2);
    expect(universe.changes.filter((c) => c.repositoryId === nova.id)).toHaveLength(0);
    expect(universe.changes).toHaveLength(9);

    // Findings: TRACE=14, Radar=3, Atlas=8, Orbit=6, Nova=0 -> Total 31
    expect(universe.attention.filter((a) => a.repositoryId === trace.id)).toHaveLength(14);
    expect(universe.attention.filter((a) => a.repositoryId === radar.id)).toHaveLength(3);
    expect(universe.attention.filter((a) => a.repositoryId === atlas.id)).toHaveLength(8);
    expect(universe.attention.filter((a) => a.repositoryId === orbit.id)).toHaveLength(6);
    expect(universe.attention.filter((a) => a.repositoryId === nova.id)).toHaveLength(0);
    expect(universe.attention).toHaveLength(31);

    // Reports: TRACE=5, Radar=2, Atlas=3, Orbit=2, Nova=0 -> Total 12
    const traceReports = universe.reports.filter((r) => r.repositoryId === trace.id);
    const radarReports = universe.reports.filter((r) => r.repositoryId === radar.id);
    const atlasReports = universe.reports.filter((r) => r.repositoryId === atlas.id);
    const orbitReports = universe.reports.filter((r) => r.repositoryId === orbit.id);
    const novaReports = universe.reports.filter((r) => r.repositoryId === nova.id);

    expect(traceReports).toHaveLength(5);
    expect(radarReports).toHaveLength(2);
    expect(atlasReports).toHaveLength(3);
    expect(orbitReports).toHaveLength(2);
    expect(novaReports).toHaveLength(0);
    expect(universe.reports).toHaveLength(12);
  });

  it('verifies report types distribution across repositories', () => {
    const universe = mockDataProvider.getUniverse();

    const dailyReports = universe.reports.filter((r) => r.artifactType === 'daily_report');
    const weeklyReports = universe.reports.filter((r) => r.artifactType === 'weekly_report');
    const securityAudits = universe.reports.filter((r) => r.artifactType === 'security_audit');
    const archReviews = universe.reports.filter((r) => r.artifactType === 'architecture_review');
    const perfReviews = universe.reports.filter((r) => r.artifactType === 'performance_review');

    expect(dailyReports).toHaveLength(4); // TRACE, Radar, Atlas, Orbit
    expect(weeklyReports).toHaveLength(2); // TRACE, Radar
    expect(securityAudits).toHaveLength(2); // TRACE, Atlas
    expect(archReviews).toHaveLength(3); // TRACE, Atlas, Orbit
    expect(perfReviews).toHaveLength(1); // TRACE
  });

  it('correctly models TRACE analyzed commit vs remote HEAD freshness divergence', () => {
    const universe = mockDataProvider.getUniverse();
    const traceReports = universe.reports.filter((r) => r.repositoryId === 'repo-trace-001');

    expect(traceReports.length).toBe(5);

    const analyzedCommit = '4953addc8992f882a1c983bad061fb8035213276';
    const remoteHeadCommit = '8c74d21054a329e7104b689a7f3d5e219084c7aa';

    for (const report of traceReports) {
      expect(report.analyzedCommit).toBe(analyzedCommit);
      expect(report.freshness).toBe('needs-refresh');
      expect(report.content).toContain('Needs refresh');
    }

    // Daily brief explicitly notes divergence in content
    const dailyBrief = traceReports.find((r) => r.id === 'report-trace-001')!;
    expect(dailyBrief.remoteHeadCommit).toBe(remoteHeadCommit);
    expect(dailyBrief.content).toContain(analyzedCommit);
    expect(dailyBrief.content).toContain(remoteHeadCommit);
  });

  it('maintains referential integrity between reports, changes, findings, and evidence', () => {
    const universe = mockDataProvider.getUniverse();
    const changeIds = new Set(universe.changes.map((c) => c.id));
    const findingIds = new Set(universe.attention.map((a) => a.id));
    const evidenceIds = new Set(universe.evidence.map((e) => e.id));

    for (const report of universe.reports) {
      expect(report.repositoryId).toBeDefined();
      expect(report.title).toBeTruthy();
      expect(report.summary).toBeTruthy();
      expect(report.content).toBeTruthy();
      expect(report.origin).toBe('local');

      if (report.relatedChangeIds) {
        for (const changeId of report.relatedChangeIds) {
          expect(changeIds.has(changeId)).toBe(true);
        }
      }

      if (report.relatedFindingIds) {
        for (const findingId of report.relatedFindingIds) {
          expect(findingIds.has(findingId)).toBe(true);
        }
      }

      if (report.relatedEvidenceIds) {
        for (const evidenceId of report.relatedEvidenceIds) {
          expect(evidenceIds.has(evidenceId)).toBe(true);
        }
      }

      for (const item of report.items) {
        expect(item.id).toBeTruthy();
        expect(item.title).toBeTruthy();
        expect(item.detail).toBeTruthy();
        if (item.findingId) {
          expect(findingIds.has(item.findingId)).toBe(true);
        }
        if (item.changeId) {
          expect(changeIds.has(item.changeId)).toBe(true);
        }
        if (item.evidenceId) {
          expect(evidenceIds.has(item.evidenceId)).toBe(true);
        }
      }
    }
  });

  it('supports helper functions for report retrieval and entity relations', () => {
    const traceReport = getReportById('report-trace-001');
    expect(traceReport).toBeDefined();
    expect(traceReport?.repositoryId).toBe('repo-trace-001');

    const traceReports = getReportsForRepository('repo-trace-001');
    expect(traceReports).toHaveLength(5);

    const atlasCollisionReport = getReportById('report-atlas-001')!;
    expect(atlasCollisionReport).toBeDefined();

    const related = getRelatedEntitiesForReport('report-atlas-001');
    expect(related.changes.some((c) => c.number === 88)).toBe(true);
    expect(related.changes.some((c) => c.number === 89)).toBe(true);
    expect(related.findings.some((f) => f.id === 'att-atlas-001')).toBe(true);
  });
});
