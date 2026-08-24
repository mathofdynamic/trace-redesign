import { describe, expect, it } from 'vitest';
import { mockDataProvider } from '../mock/adapter';
import { getReportById, getRelatedEntitiesForReport } from '../mock/reports';

describe('Phase 18: Report Detail Surface (/app/reports/[reportId])', () => {
  it('loads TRACE weekly report with exact change and finding associations', () => {
    const report = getReportById('report-trace-004');
    expect(report).toBeDefined();
    expect(report?.id).toBe('report-trace-004');
    expect(report?.artifactType).toBe('weekly_report');
    expect(report?.repositoryId).toBe('repo-trace-001');
    expect(report?.freshness).toBe('needs-refresh');
    expect(report?.analyzedCommit).toBe('4953addc8992f882a1c983bad061fb8035213276');
    expect(report?.remoteHeadCommit).toBe('8c74d21054a329e7104b689a7f3d5e219084c7aa');

    const related = getRelatedEntitiesForReport('report-trace-004');
    expect(related.changes.length).toBeGreaterThanOrEqual(3);
    const prNumbers = related.changes.map((c) => c.number);
    expect(prNumbers).toContain(101);
    expect(prNumbers).toContain(102);
    expect(prNumbers).toContain(103);

    // Verify findings are present
    expect(related.findings.length).toBeGreaterThanOrEqual(1);
    expect(related.evidence.length).toBeGreaterThanOrEqual(1);
  });

  it('loads Atlas architecture review with boundary and invariant records', () => {
    const report = getReportById('report-atlas-001');
    expect(report).toBeDefined();
    expect(report?.id).toBe('report-atlas-001');
    expect(report?.artifactType).toBe('architecture_review');
    expect(report?.repositoryId).toBe('repo-atlas-003');
    expect(report?.freshness).toBe('current');
    expect(report?.analyzedCommit).toBe('5b2e917409218201a4e129304194019283401294');

    const related = getRelatedEntitiesForReport('report-atlas-001');
    expect(related.changes.length).toBeGreaterThanOrEqual(1);
    expect(related.changes[0]?.number).toBe(87);
  });

  it('verifies Orbit bridge attention state and metadata', () => {
    const report = getReportById('report-orbit-001');
    expect(report).toBeDefined();
    expect(report?.id).toBe('report-orbit-001');
    expect(report?.freshness).toBe('attention');
    expect(report?.repositoryId).toBe('repo-orbit-004');
  });

  it('verifies privacy guarantees and anti-surveillance invariant in detail view data', () => {
    const universe = mockDataProvider.getUniverse();
    const reports = universe.reports;

    for (const rep of reports) {
      expect(rep.content).not.toMatch(/developer score/i);
      expect(rep.content).not.toMatch(/developer rank/i);
      expect(rep.content).not.toMatch(/productivity rank/i);
      expect(rep.origin).toBe('local');
      expect(rep.status).toBe('approved');
    }
  });
});
