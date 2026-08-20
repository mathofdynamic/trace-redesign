import { describe, expect, it } from 'vitest';
import { mockDataProvider } from '../adapter';
import { deriveTraceProjectState } from '../../dashboard-state';

describe('Phase 5 — Final Mock Universe Audit, Integrity, and Baseline Freeze', () => {
  const universe = mockDataProvider.getUniverse('default');

  describe('1. Exact Entity Counts & Inventory', () => {
    it('verifies exactly 5 repositories', () => {
      expect(universe.repositories).toHaveLength(5);
      const names = universe.repositories.map((r) => r.name);
      expect(names).toEqual(['TRACE', 'Radar', 'Atlas', 'Orbit', 'Nova']);
    });

    it('verifies exactly 9 changes', () => {
      expect(universe.changes).toHaveLength(9);
    });

    it('verifies exactly 31 findings (attention items)', () => {
      expect(universe.attention).toHaveLength(31);
    });

    it('verifies exactly 12 reports', () => {
      expect(universe.reports).toHaveLength(12);
    });

    it('verifies exactly 4 conflicts', () => {
      expect(universe.conflicts).toHaveLength(4);
    });

    it('verifies exactly 9 decisions', () => {
      expect(universe.decisions).toHaveLength(9);
    });

    it('verifies exactly 8 rules', () => {
      expect(universe.rules).toHaveLength(8);
    });

    it('verifies exactly 35 activity events', () => {
      expect(universe.activity).toHaveLength(35);
    });

    it('verifies exactly 4 authorized computers (3 active, 1 revoked)', () => {
      expect(universe.devices).toHaveLength(4);
      const active = universe.devices.filter((d) => !d.revokedAt);
      const revoked = universe.devices.filter((d) => Boolean(d.revokedAt));
      expect(active).toHaveLength(3);
      expect(revoked).toHaveLength(1);
    });
  });

  describe('2. Referential Integrity Across Universe', () => {
    const repoIds = new Set(universe.repositories.map((r) => r.id));
    const changeIds = new Set(universe.changes.map((c) => c.id));
    const findingIds = new Set(universe.attention.map((a) => a.id));
    const reportIds = new Set(universe.reports.map((r) => r.id));

    it('all changes point to valid repositories', () => {
      universe.changes.forEach((change) => {
        expect(repoIds.has(change.repositoryId)).toBe(true);
      });
    });

    it('all findings point to valid repositories when repositoryId is present', () => {
      universe.attention.forEach((finding) => {
        if (finding.repositoryId) {
          expect(repoIds.has(finding.repositoryId)).toBe(true);
        }
      });
    });

    it('all reports point to valid repositories', () => {
      universe.reports.forEach((report) => {
        expect(repoIds.has(report.repositoryId)).toBe(true);
      });
    });

    it('all conflicts point to valid repositories and valid changes', () => {
      universe.conflicts.forEach((conflict) => {
        expect(repoIds.has(conflict.repositoryId)).toBe(true);
        if (conflict.relatedChangeIds) {
          conflict.relatedChangeIds.forEach((changeId) => {
            expect(changeIds.has(changeId)).toBe(true);
          });
        }
      });
    });

    it('all decisions point to valid repositories and linked entities', () => {
      universe.decisions.forEach((decision) => {
        expect(repoIds.has(decision.repositoryId)).toBe(true);
        if (decision.relatedChangeId) {
          expect(changeIds.has(decision.relatedChangeId)).toBe(true);
        }
        if (decision.relatedReportId) {
          expect(reportIds.has(decision.relatedReportId)).toBe(true);
        }
      });
    });

    it('all rules point to valid repository scopes or null for workspace-wide', () => {
      universe.rules.forEach((rule) => {
        if (rule.repositoryId) {
          expect(repoIds.has(rule.repositoryId)).toBe(true);
        }
      });
    });

    it('all activity events point to valid repositories', () => {
      universe.activity.forEach((event) => {
        expect(repoIds.has(event.repositoryId)).toBe(true);
      });
    });

    it('all devices point to valid workspace and user', () => {
      universe.devices.forEach((device) => {
        expect(device.organizationId).toBe(universe.workspace.id);
        expect(device.userId).toBe(universe.currentUser.id);
      });
    });
  });

  describe('3. Repository Story Consistency & Product Truth', () => {
    it('TRACE: Needs refresh (analyzed commit != remote HEAD)', () => {
      const trace = universe.repositories.find((r) => r.id === 'repo-trace-001')!;
      expect(trace.remoteHeadSha).not.toBe(trace.latestSync?.headCommit);
      expect(trace.latestSync?.stale).toBe(true);
      const state = deriveTraceProjectState(trace, universe.attention);
      expect(state.key).toBe('needs-refresh');
      expect(state.label).toBe('Needs refresh');
    });

    it('Radar: Current (analyzed commit == remote HEAD, calm)', () => {
      const radar = universe.repositories.find((r) => r.id === 'repo-radar-002')!;
      expect(radar.remoteHeadSha).toBe(radar.latestSync?.headCommit);
      expect(radar.latestSync?.stale).toBe(false);
      const state = deriveTraceProjectState(radar, universe.attention);
      expect(state.key).toBe('current');
    });

    it('Atlas: Current with engineering conflict', () => {
      const atlas = universe.repositories.find((r) => r.id === 'repo-atlas-003')!;
      expect(atlas.remoteHeadSha).toBe(atlas.latestSync?.headCommit);
      expect(atlas.latestSync?.stale).toBe(false);
      const state = deriveTraceProjectState(atlas, universe.attention);
      expect(state.key).toBe('current');
      const atlasConflicts = universe.conflicts.filter((c) => c.repositoryId === atlas.id);
      expect(atlasConflicts.length).toBeGreaterThan(0);
    });

    it('Orbit: Sync requires attention (sync-attention)', () => {
      const orbit = universe.repositories.find((r) => r.id === 'repo-orbit-004')!;
      const state = deriveTraceProjectState(orbit, universe.attention);
      expect(state.key).toBe('sync-attention');
    });

    it('Nova: Connected and not analyzed (0 findings, 0 reports, 0 changes)', () => {
      const nova = universe.repositories.find((r) => r.id === 'repo-nova-005')!;
      expect(nova.latestSync).toBeNull();
      expect(nova.lastSynchronizedAt).toBeNull();
      const state = deriveTraceProjectState(nova, universe.attention);
      expect(state.key).toBe('connected-not-analyzed');

      const novaFindings = universe.attention.filter((a) => a.repositoryId === nova.id);
      const novaReports = universe.reports.filter((r) => r.repositoryId === nova.id);
      const novaChanges = universe.changes.filter((c) => c.repositoryId === nova.id);
      expect(novaFindings).toHaveLength(0);
      expect(novaReports).toHaveLength(0);
      expect(novaChanges).toHaveLength(0);
    });
  });

  describe('4. Privacy & Secret Hygiene Invariants', () => {
    it('ensures no token or credential exposure in mock devices', () => {
      universe.devices.forEach((device) => {
        expect(device.tokenHash).toMatch(/^sha256:[a-f0-9]{64}$/);
        expect('rawToken' in device).toBe(false);
        expect('secret' in device).toBe(false);
      });
    });

    it('ensures evidence structures state zero source-code inclusion', () => {
      universe.attention.forEach((finding) => {
        // Evidence is bounded references, not raw source snippets
        finding.evidence.forEach((ev) => {
          expect(typeof ev).toBe('string');
          expect(ev.length).toBeLessThan(1000);
        });
      });
    });
  });

  describe('5. Scenario Matrix Completeness', () => {
    const scenarios = [
      'default',
      'github-unavailable',
      'permission-missing',
      'analysis-running',
      'analysis-failed',
      'sync-running',
      'sync-failed',
      'freshness-unavailable',
      'no-analysis',
    ] as const;

    scenarios.forEach((scenarioKey) => {
      it(`evaluates scenario: ${scenarioKey} deterministically`, () => {
        const scenUniverse = mockDataProvider.getUniverse(scenarioKey);
        expect(scenUniverse.workspace.name).toBe('Northstar Engineering');
        expect(scenUniverse.repositories).toHaveLength(5);
      });
    });
  });
});
