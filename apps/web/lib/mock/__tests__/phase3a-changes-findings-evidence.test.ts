import { describe, expect, it } from 'vitest';
import { mockDataProvider } from '../adapter';
import { MOCK_EVIDENCE, getEvidenceForFinding, getEvidenceForRepository } from '../evidence';

describe('Phase 3A: Changes, Findings, and Structured Evidence', () => {
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
    const traceChanges = universe.changes.filter((c) => c.repositoryId === trace.id);
    const radarChanges = universe.changes.filter((c) => c.repositoryId === radar.id);
    const atlasChanges = universe.changes.filter((c) => c.repositoryId === atlas.id);
    const orbitChanges = universe.changes.filter((c) => c.repositoryId === orbit.id);
    const novaChanges = universe.changes.filter((c) => c.repositoryId === nova.id);

    expect(traceChanges).toHaveLength(3);
    expect(radarChanges).toHaveLength(1);
    expect(atlasChanges).toHaveLength(3);
    expect(orbitChanges).toHaveLength(2);
    expect(novaChanges).toHaveLength(0);
    expect(universe.changes).toHaveLength(9);

    // Findings: TRACE=14, Radar=3, Atlas=8, Orbit=6, Nova=0 -> Total 31
    const traceFindings = universe.attention.filter((a) => a.repositoryId === trace.id);
    const radarFindings = universe.attention.filter((a) => a.repositoryId === radar.id);
    const atlasFindings = universe.attention.filter((a) => a.repositoryId === atlas.id);
    const orbitFindings = universe.attention.filter((a) => a.repositoryId === orbit.id);
    const novaFindings = universe.attention.filter((a) => a.repositoryId === nova.id);

    expect(traceFindings).toHaveLength(14);
    expect(radarFindings).toHaveLength(3);
    expect(atlasFindings).toHaveLength(8);
    expect(orbitFindings).toHaveLength(6);
    expect(novaFindings).toHaveLength(0);
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

  it('enforces strict privacy boundary on all structured evidence', () => {
    const universe = mockDataProvider.getUniverse();
    expect(universe.evidence.length).toBeGreaterThan(0);

    for (const record of universe.evidence) {
      expect(record.sourceCodeIncluded).toBe(false);
      expect(record.codeSnippetsIncluded).toBe(false);
      expect(record).not.toHaveProperty('sourceCode');
      expect(record).not.toHaveProperty('snippet');
      expect(record.path).toBeDefined();
      expect(record.verificationSource).toBeDefined();
    }
  });

  it('maintains referential integrity across findings, changes, and evidence', () => {
    const universe = mockDataProvider.getUniverse();
    const repoIds = new Set(universe.repositories.map((r) => r.id));
    const changeIds = new Set(universe.changes.map((c) => c.id));
    const findingIds = new Set(universe.attention.map((a) => a.id));

    // Every change references a valid repository
    for (const change of universe.changes) {
      expect(repoIds.has(change.repositoryId)).toBe(true);
      expect(change.number).toBeGreaterThan(0);
      expect(change.branch).toBeDefined();
      expect(change.affectedAreas).toBeDefined();
      if (change.relatedFindingIds) {
        for (const findingId of change.relatedFindingIds) {
          expect(findingIds.has(findingId)).toBe(true);
        }
      }
    }

    // Every finding references a valid repository
    for (const finding of universe.attention) {
      expect(finding.repositoryId).not.toBeNull();
      expect(repoIds.has(finding.repositoryId!)).toBe(true);
      if (finding.relatedChangeId) {
        expect(changeIds.has(finding.relatedChangeId)).toBe(true);
      }
    }

    // Every evidence record references a valid finding and matching repository
    for (const evidence of universe.evidence) {
      expect(findingIds.has(evidence.findingId)).toBe(true);
      expect(repoIds.has(evidence.repositoryId)).toBe(true);

      const parentFinding = universe.attention.find((a) => a.id === evidence.findingId)!;
      expect(evidence.repositoryId).toBe(parentFinding.repositoryId);

      if (evidence.changeId) {
        expect(changeIds.has(evidence.changeId)).toBe(true);
        const parentChange = universe.changes.find((c) => c.id === evidence.changeId)!;
        expect(evidence.repositoryId).toBe(parentChange.repositoryId);
      }
    }
  });

  it('correctly attributes TRACE provenance to analyzed commit rather than newer remote head', () => {
    const universe = mockDataProvider.getUniverse();
    const traceFindings = universe.attention.filter((a) => a.repositoryId === 'repo-trace-001');

    for (const finding of traceFindings) {
      expect(finding.analyzedCommit).toBe('4953addc8992f882a1c983bad061fb8035213276');
      expect(finding.provenance?.analyzedCommit).toBe('4953addc8992f882a1c983bad061fb8035213276');
      expect(finding.provenance?.remoteHeadCommit).toBe('8c74d21054a329e7104b689a7f3d5e219084c7aa');
      expect(finding.provenance?.isStaleWithRemote).toBe(true);
    }
  });

  it('links Atlas conflict relationship to PR #88 and PR #89', () => {
    const universe = mockDataProvider.getUniverse();
    const atlasConflictFinding = universe.attention.find((a) => a.id === 'att-atlas-001')!;

    expect(atlasConflictFinding).toBeDefined();
    expect(atlasConflictFinding.kind).toBe('conflict');

    const pr88 = universe.changes.find((c) => c.id === 'change-atlas-88')!;
    const pr89 = universe.changes.find((c) => c.id === 'change-atlas-89')!;

    expect(pr88.number).toBe(88);
    expect(pr89.number).toBe(89);
    expect(pr88.relatedFindingIds).toContain('att-atlas-001');
    expect(pr89.relatedFindingIds).toContain('att-atlas-001');
    expect(pr88.relatedConflictId).toBe('conflict-atlas-001');
    expect(pr89.relatedConflictId).toBe('conflict-atlas-001');

    const conflictRecord = universe.conflicts.find((c) => c.id === 'conflict-atlas-001')!;
    expect(conflictRecord).toBeDefined();
    expect(conflictRecord.summary).toContain('PR #88');
    expect(conflictRecord.summary).toContain('PR #89');
  });

  it('provides working evidence lookup helpers', () => {
    const traceFindingEvidence = getEvidenceForFinding('att-trace-001');
    expect(traceFindingEvidence.length).toBeGreaterThan(0);
    expect(traceFindingEvidence[0]?.findingId).toBe('att-trace-001');

    const atlasRepoEvidence = getEvidenceForRepository('repo-atlas-003');
    expect(atlasRepoEvidence.length).toBeGreaterThan(0);
    for (const record of atlasRepoEvidence) {
      expect(record.repositoryId).toBe('repo-atlas-003');
    }

    const novaEvidence = getEvidenceForRepository('repo-nova-005');
    expect(novaEvidence).toHaveLength(0);
  });
});
