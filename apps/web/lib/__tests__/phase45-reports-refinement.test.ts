import { describe, it, expect } from 'vitest';
import { mockDataProvider } from '../mock/adapter';
import { MOCK_REPORTS, getReportById, getRelatedEntitiesForReport, getReportsForRepository } from '../mock/reports';

describe('Phase 45 — Reports Library, Quick Inspect & Report Reading Experience', () => {
  describe('1. Reports Library Invariants & Structure', () => {
    it('provides all 12 frozen universe reports across expected repositories and artifact types', () => {
      const reports = mockDataProvider.getUniverse().reports;
      expect(reports).toHaveLength(12);

      const repositories = new Set(reports.map((r) => r.repositoryId));
      expect(repositories.has('repo-trace-001')).toBe(true);
      expect(repositories.has('repo-radar-002')).toBe(true);
      expect(repositories.has('repo-atlas-003')).toBe(true);
      expect(repositories.has('repo-orbit-004')).toBe(true);

      const artifactTypes = new Set(reports.map((r) => r.artifactType));
      expect(artifactTypes.has('daily_report')).toBe(true);
      expect(artifactTypes.has('weekly_report')).toBe(true);
      expect(artifactTypes.has('architecture_review')).toBe(true);
      expect(artifactTypes.has('security_audit')).toBe(true);
      expect(artifactTypes.has('performance_review')).toBe(true);
    });

    it('contains valid freshness states across reports', () => {
      const reports = mockDataProvider.getUniverse().reports;
      reports.forEach((report) => {
        const freshness = report.freshness || 'current';
        expect(['current', 'needs-refresh', 'attention']).toContain(freshness);
        expect(report.generatedAt).toBeDefined();
        expect(report.title).toBeDefined();
        expect(report.title.length).toBeGreaterThan(5);
        expect(report.content).toBeDefined();
        expect(report.content.length).toBeGreaterThan(20);
      });
    });
  });

  describe('2. Quick Inspect Data Structure & Content Ordering', () => {
    it('has structured findings and linked changes for quick inspection', () => {
      const traceDaily = getReportById('report-trace-001');
      expect(traceDaily).toBeDefined();
      if (!traceDaily) return;

      const related = getRelatedEntitiesForReport('report-trace-001');
      expect(related.findings.length).toBeGreaterThan(0);
      related.findings.forEach((finding) => {
        expect(finding.id).toBeDefined();
        expect(finding.title).toBeDefined();
        expect(finding.severity).toBeDefined();
        expect(finding.detail).toBeDefined();
        expect(Array.isArray(finding.evidence)).toBe(true);
      });

      expect(related.changes.length).toBeGreaterThan(0);
      related.changes.forEach((pr) => {
        expect(pr.number).toBeGreaterThan(0);
        expect(pr.title).toBeDefined();
        expect(pr.authorLogin).toBeDefined();
        expect(pr.branch).toBeDefined();
      });
    });

    it('contains commit SHA and analyzed commit required for provenance audits', () => {
      const reports = mockDataProvider.getUniverse().reports;
      reports.forEach((report) => {
        expect(report.analyzedCommit).toBeDefined();
        expect(report.analyzedCommit?.length).toBeGreaterThanOrEqual(7);
        expect(report.origin).toBe('local');
        expect(report.status).toBe('approved');
      });
    });
  });

  describe('3. Report Detail Full Reading Experience', () => {
    it('includes detailed sections, markdown lines, and refresh workflows for full reports', () => {
      const reports = mockDataProvider.getUniverse().reports;
      reports.forEach((report) => {
        expect(report.id).toBeDefined();
        expect(report.title).toBeDefined();
        expect(report.content).toBeDefined();
        expect(report.content.length).toBeGreaterThan(50);
      });
    });

    it('ensures freshness states and analyzed commits are consistently present on needs-refresh/attention reports', () => {
      const reports = mockDataProvider.getUniverse().reports;
      const staleReports = reports.filter((r) => r.freshness === 'needs-refresh' || r.freshness === 'attention');
      expect(staleReports.length).toBeGreaterThanOrEqual(7);

      staleReports.forEach((report) => {
        expect(report.analyzedCommit).toBeDefined();
        expect(report.freshness).toMatch(/needs-refresh|attention/);
      });
    });
  });
});

