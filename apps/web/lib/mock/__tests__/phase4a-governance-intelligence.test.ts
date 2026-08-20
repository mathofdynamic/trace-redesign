import { describe, expect, it } from 'vitest';
import { mockDataProvider } from '../adapter';
import { MOCK_CONFLICTS, getConflictById, getConflictsForRepository } from '../conflicts';
import { MOCK_DECISIONS, getDecisionById, getDecisionsForRepository } from '../decisions';
import { MOCK_RULES, getRuleById, getRulesForRepository } from '../rules';
import { MOCK_ACTIVITY, getActivityByRepository } from '../activity';

describe('Phase 4A: Conflicts, Decisions, Rules, and Activity', () => {
  it('preserves the required 5-repository universe and core item counts', () => {
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
    expect(universe.reports.filter((r) => r.repositoryId === trace.id)).toHaveLength(5);
    expect(universe.reports.filter((r) => r.repositoryId === radar.id)).toHaveLength(2);
    expect(universe.reports.filter((r) => r.repositoryId === atlas.id)).toHaveLength(3);
    expect(universe.reports.filter((r) => r.repositoryId === orbit.id)).toHaveLength(2);
    expect(universe.reports.filter((r) => r.repositoryId === nova.id)).toHaveLength(0);
    expect(universe.reports).toHaveLength(12);

    // Commit integrity: TRACE analyzed vs remote HEAD
    expect(trace.latestSync?.headCommit).toBe('4953addc8992f882a1c983bad061fb8035213276');
    expect(trace.remoteHeadSha).toBe('8c74d21054a329e7104b689a7f3d5e219084c7aa');
    expect(trace.latestSync?.stale).toBe(true);
  });

  describe('Conflicts', () => {
    it('contains valid conflicts across Atlas, TRACE, and Orbit', () => {
      const universe = mockDataProvider.getUniverse();
      expect(universe.conflicts.length).toBeGreaterThanOrEqual(4);

      const atlasConflicts = universe.conflicts.filter((c) => c.repositoryId === 'repo-atlas-003');
      const traceConflicts = universe.conflicts.filter((c) => c.repositoryId === 'repo-trace-001');
      const orbitConflicts = universe.conflicts.filter((c) => c.repositoryId === 'repo-orbit-004');
      const novaConflicts = universe.conflicts.filter((c) => c.repositoryId === 'repo-nova-005');

      expect(atlasConflicts).toHaveLength(2);
      expect(traceConflicts).toHaveLength(1);
      expect(orbitConflicts).toHaveLength(1);
      expect(novaConflicts).toHaveLength(0);
    });

    it('verifies the Atlas PR #88 / PR #89 schema conflict integrity', () => {
      const atlasConflict = getConflictById('conflict-atlas-001');
      expect(atlasConflict).toBeDefined();
      expect(atlasConflict?.title).toContain('Concurrent schema mutation collision');
      expect(atlasConflict?.relatedChangeIds).toEqual(['change-atlas-88', 'change-atlas-89']);
      expect(atlasConflict?.relatedFindingIds).toEqual(['att-atlas-001']);
      expect(atlasConflict?.items).toHaveLength(2);
      expect(atlasConflict?.items[0].severity).toBe('high');
      expect(atlasConflict?.items[0].classification).toBe('deterministic');
    });

    it('verifies conflict helper lookups', () => {
      const conflict = getConflictById('conflict-trace-001');
      expect(conflict).toBeDefined();
      expect(conflict?.repositoryName).toBe('northstar-engineering/TRACE');

      const byArtifactId = getConflictById('art-conflict-orbit-001');
      expect(byArtifactId).toBeDefined();
      expect(byArtifactId?.id).toBe('conflict-orbit-001');

      const atlasList = getConflictsForRepository('repo-atlas-003');
      expect(atlasList).toHaveLength(2);
    });
  });

  describe('Decisions', () => {
    it('contains 9 comprehensive architectural decisions across the workspace', () => {
      const universe = mockDataProvider.getUniverse();
      expect(universe.decisions).toHaveLength(9);

      const traceDecisions = universe.decisions.filter((d) => d.repositoryId === 'repo-trace-001');
      const radarDecisions = universe.decisions.filter((d) => d.repositoryId === 'repo-radar-002');
      const atlasDecisions = universe.decisions.filter((d) => d.repositoryId === 'repo-atlas-003');
      const orbitDecisions = universe.decisions.filter((d) => d.repositoryId === 'repo-orbit-004');
      const novaDecisions = universe.decisions.filter((d) => d.repositoryId === 'repo-nova-005');

      expect(traceDecisions).toHaveLength(3);
      expect(radarDecisions).toHaveLength(2);
      expect(atlasDecisions).toHaveLength(2);
      expect(orbitDecisions).toHaveLength(2);
      expect(novaDecisions).toHaveLength(0);
    });

    it('enforces privacy boundary and deterministic-first decisions in TRACE', () => {
      const privDecision = getDecisionById('decision-trace-001');
      expect(privDecision).toBeDefined();
      expect(privDecision?.title).toBe('Single-Direction Local-to-Cloud Intelligence Synchronization');
      expect(privDecision?.status).toBe('recorded');
      expect(privDecision?.content).toContain('Zero intellectual property exposure');

      const detDecision = getDecisionById('decision-trace-002');
      expect(detDecision).toBeDefined();
      expect(detDecision?.title).toBe('Deterministic Finding Extraction Precedes Semantic Inference');
    });

    it('verifies decision lookup helper functions', () => {
      const radarList = getDecisionsForRepository('repo-radar-002');
      expect(radarList).toHaveLength(2);

      const decision = getDecisionById('art-decision-atlas-001');
      expect(decision).toBeDefined();
      expect(decision?.id).toBe('decision-atlas-001');
    });
  });

  describe('Rules', () => {
    it('contains 8 governance rules across the workspace', () => {
      const universe = mockDataProvider.getUniverse();
      expect(universe.rules).toHaveLength(8);

      const traceRules = universe.rules.filter((r) => r.repositoryId === 'repo-trace-001');
      const radarRules = universe.rules.filter((r) => r.repositoryId === 'repo-radar-002');
      const atlasRules = universe.rules.filter((r) => r.repositoryId === 'repo-atlas-003');
      const orbitRules = universe.rules.filter((r) => r.repositoryId === 'repo-orbit-004');
      const novaRules = universe.rules.filter((r) => r.repositoryId === 'repo-nova-005');

      expect(traceRules).toHaveLength(3);
      expect(radarRules).toHaveLength(2);
      expect(atlasRules).toHaveLength(2);
      expect(orbitRules).toHaveLength(1);
      expect(novaRules).toHaveLength(0);
    });

    it('verifies rules helper functions and active status', () => {
      for (const rule of MOCK_RULES) {
        expect(rule.status).toBe('active');
        expect(rule.items.length).toBeGreaterThanOrEqual(1);
      }

      const lookup = getRuleById('rule-radar-001');
      expect(lookup).toBeDefined();
      expect(lookup?.title).toBe('Deterministic Memory Bounds Policy');

      const traceRules = getRulesForRepository('repo-trace-001');
      expect(traceRules).toHaveLength(3);
    });
  });

  describe('Activity Feed', () => {
    it('contains a coherent reverse-chronological timeline of events', () => {
      const universe = mockDataProvider.getUniverse();
      expect(universe.activity.length).toBeGreaterThanOrEqual(30);

      // Verify all activities point to existing repositories
      const validRepoIds = new Set(universe.repositories.map((r) => r.id));
      for (const act of universe.activity) {
        expect(validRepoIds.has(act.repositoryId)).toBe(true);
        expect(act.id).toMatch(/^act-\d{3}$/);
        expect(new Date(act.occurredAt).getTime()).not.toBeNaN();
      }

      // Check reverse chronological order
      for (let i = 0; i < universe.activity.length - 1; i++) {
        const t1 = new Date(universe.activity[i].occurredAt).getTime();
        const t2 = new Date(universe.activity[i + 1].occurredAt).getTime();
        expect(t1).toBeGreaterThanOrEqual(t2);
      }
    });

    it('verifies activity filtering by repository', () => {
      const traceActs = getActivityByRepository('repo-trace-001');
      expect(traceActs.length).toBeGreaterThan(5);

      const novaActs = getActivityByRepository('repo-nova-005');
      expect(novaActs).toHaveLength(1);
      expect(novaActs[0].kind).toBe('repository-connected');
    });
  });

  describe('Dashboard Summary Integration', () => {
    it('exposes all governance capabilities and synced records in dashboard summary', () => {
      const summary = mockDataProvider.getDashboardSummary();
      expect(summary.capabilities.conflicts).toBe(true);
      expect(summary.capabilities.decisions).toBe(true);
      expect(summary.capabilities.rules).toBe(true);
      expect(summary.capabilities.activity).toBe(true);
      expect(summary.capabilities.reports).toBe(true);
      expect(summary.capabilities.changes).toBe(true);

      expect(summary.conflicts.length).toBeGreaterThanOrEqual(4);
      expect(summary.decisions).toHaveLength(9);
      expect(summary.rules).toHaveLength(8);
      expect(summary.activity.length).toBeGreaterThanOrEqual(30);
    });
  });
});
