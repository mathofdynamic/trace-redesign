import { describe, expect, it } from 'vitest';
import {
  MOCK_REPOSITORIES,
  MOCK_ATTENTION,
} from '../mock';
import {
  presentFindingDetail,
  isFileEvidenceReference,
} from '../dashboard-state';

describe('Phase 14: Repository Findings & Evidence View (/app/repositories/[repositoryId]/findings)', () => {
  const traceRepo = MOCK_REPOSITORIES.find((r) => r.id === 'repo-trace-001')!;
  const traceFindings = MOCK_ATTENTION.filter(
    (a) => a.repositoryId === traceRepo.id && ['finding', 'risk', 'conflict'].includes(a.kind),
  );

  describe('1. 8-Point Finding Question Structure & Integrity', () => {
    it('answers 1. What happened? for every finding', () => {
      traceFindings.forEach((finding) => {
        expect(finding.title).toBeTruthy();
        expect(finding.title.length).toBeGreaterThan(5);
        expect(finding.detail).toBeTruthy();
        const presented = presentFindingDetail(finding.detail);
        expect(presented).toBeTruthy();
      });
    });

    it('answers 2. Why it matters? (deterministic AST invariant vs probabilistic heuristic drift)', () => {
      traceFindings.forEach((finding) => {
        expect(['deterministic', 'probabilistic']).toContain(finding.classification);
        if (finding.classification === 'deterministic') {
          expect(finding.provenance?.ruleId).toBeDefined();
        }
      });
    });

    it('answers 3. How severe is it? (CRITICAL, HIGH, MEDIUM, LOW, INFO)', () => {
      const validSeverities = ['critical', 'high', 'medium', 'low', 'info'];
      traceFindings.forEach((finding) => {
        expect(validSeverities).toContain(finding.severity);
      });
    });

    it('answers 4. Is it deterministic evidence or interpretation?', () => {
      const deterministic = traceFindings.filter((f) => f.classification === 'deterministic');
      const probabilistic = traceFindings.filter((f) => f.classification === 'probabilistic');
      expect(deterministic.length).toBeGreaterThan(0);
      expect(deterministic.length + probabilistic.length).toBe(traceFindings.length);
    });

    it('answers 5. Which change or area is related?', () => {
      traceFindings.forEach((finding) => {
        // Every finding has an affected area or related change context
        expect(finding.affectedArea || finding.relatedChangeNumber).toBeTruthy();
      });
    });

    it('answers 6. What evidence exists? (File locations and TRACE records, no raw code snippets)', () => {
      traceFindings.forEach((finding) => {
        expect(Array.isArray(finding.evidence)).toBe(true);
        finding.evidence.forEach((evidenceItem) => {
          // Confirm evidence item is a file path or TRACE record identifier, NOT raw source code
          expect(typeof evidenceItem).toBe('string');
          expect(evidenceItem.length).toBeGreaterThan(2);
          // Never contain multiline source code
          expect(evidenceItem).not.toContain('\n');
          expect(evidenceItem).not.toContain('function(');
          expect(evidenceItem).not.toContain('class ');
        });
      });
    });

    it('answers 7. Which analyzed commit produced it? (Freshness context)', () => {
      traceFindings.forEach((finding) => {
        const commitSha =
          finding.provenance?.analyzedCommit ??
          finding.analyzedCommit ??
          traceRepo.latestSync?.headCommit;
        expect(commitSha).toBeDefined();
        expect(commitSha?.length).toBeGreaterThanOrEqual(7);
      });
    });

    it('answers 8. What is the privacy and provenance boundary?', () => {
      traceFindings.forEach((finding) => {
        expect(finding.provenance).toBeDefined();
        expect(finding.provenance?.ruleId).toBeTruthy();
        expect(finding.provenance?.source).toBe('local');
      });
    });
  });

  describe('2. Evidence Classification Helpers', () => {
    it('accurately distinguishes file-level evidence from trace record evidence', () => {
      const fileSample = 'packages/auth/src/index.ts:160';
      const recordSample = 'trace:decision:dec-001';

      expect(isFileEvidenceReference(fileSample)).toBe(true);
      expect(isFileEvidenceReference(recordSample)).toBe(false);
    });
  });

  describe('3. Repository-Scoped Finding Distribution', () => {
    it('verifies finding counts across all 5 universe repositories', () => {
      const countsByRepo: Record<string, number> = {};
      MOCK_REPOSITORIES.forEach((repo) => {
        const count = MOCK_ATTENTION.filter(
          (a) => a.repositoryId === repo.id && ['finding', 'risk', 'conflict'].includes(a.kind),
        ).length;
        countsByRepo[repo.name] = count;
      });

      expect(countsByRepo['TRACE']).toBe(14);
      expect(countsByRepo['Radar']).toBe(3);
      expect(countsByRepo['Atlas']).toBe(8);
      expect(countsByRepo['Orbit']).toBe(5);
      expect(countsByRepo['Nova']).toBe(0);
    });
  });

  describe('4. Finding Filter Simulation', () => {
    it('filters by severity correctly', () => {
      const highFindings = traceFindings.filter((f) => f.severity === 'high');
      expect(highFindings.length).toBeGreaterThan(0);
      highFindings.forEach((f) => expect(f.severity).toBe('high'));

      const criticalFindings = traceFindings.filter((f) => f.severity === 'critical');
      criticalFindings.forEach((f) => expect(f.severity).toBe('critical'));
    });

    it('filters by classification correctly', () => {
      const deterministicFindings = traceFindings.filter((f) => f.classification === 'deterministic');
      expect(deterministicFindings.length).toBeGreaterThan(0);
      deterministicFindings.forEach((f) => expect(f.classification).toBe('deterministic'));
    });

    it('filters by search keyword across title, detail, rule ID, and evidence paths', () => {
      const authQuery = 'auth';
      const matches = traceFindings.filter((finding) => {
        const q = authQuery.toLowerCase();
        return (
          finding.title.toLowerCase().includes(q) ||
          finding.detail.toLowerCase().includes(q) ||
          finding.provenance?.ruleId?.toLowerCase().includes(q) ||
          finding.evidence.some((e) => e.toLowerCase().includes(q)) ||
          finding.affectedArea?.toLowerCase().includes(q)
        );
      });
      expect(matches.length).toBeGreaterThan(0);
    });

    it('filters by affected area', () => {
      const uniqueAreas = Array.from(
        new Set(traceFindings.map((f) => f.affectedArea).filter(Boolean)),
      );
      expect(uniqueAreas.length).toBeGreaterThan(0);

      const firstArea = uniqueAreas[0]!;
      const areaMatches = traceFindings.filter((f) => f.affectedArea === firstArea);
      expect(areaMatches.length).toBeGreaterThan(0);
      areaMatches.forEach((f) => expect(f.affectedArea).toBe(firstArea));
    });
  });

  describe('5. Read-Only Immutable Finding Philosophy', () => {
    it('verifies findings have immutable identifiers and no mock mutable status fields', () => {
      traceFindings.forEach((finding) => {
        expect(finding.id.startsWith('att-')).toBe(true);
        expect(finding.updatedAt).toBeTruthy();
        // Check that no artificial mutable ticket overrides exist
        expect((finding as Record<string, unknown>).resolutionState).toBeUndefined();
        expect((finding as Record<string, unknown>).assignedDeveloper).toBeUndefined();
      });
    });
  });
});
