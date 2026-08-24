import { describe, expect, it } from 'vitest';
import {
  MOCK_REPOSITORIES,
  MOCK_ATTENTION,
  MOCK_REPORTS,
  MOCK_CHANGES,
} from '../mock';
import {
  deriveTraceProjectState,
  analysisOriginLabel,
  localTraceCommandsForState,
  presentFindingDetail,
  stateToneClass,
} from '../dashboard-state';

describe('Phase 13: Repository Command Center (/app/repositories/[repositoryId])', () => {
  it('correctly maps repository command center properties for TRACE (repo-trace-001 - Needs refresh)', () => {
    const repo = MOCK_REPOSITORIES.find((r) => r.id === 'repo-trace-001')!;
    expect(repo).toBeDefined();
    expect(repo.fullName).toBe('northstar-engineering/TRACE');
    expect(repo.name).toBe('TRACE');
    expect(repo.owner).toBe('northstar-engineering');
    expect(repo.visibility).toBe('private');
    expect(repo.latestSync?.stale).toBe(true);

    const attention = MOCK_ATTENTION.filter(
      (a) => a.repositoryId === repo.id && ['finding', 'risk', 'conflict'].includes(a.kind),
    );
    expect(attention.length).toBeGreaterThanOrEqual(10);

    const state = deriveTraceProjectState(repo, MOCK_ATTENTION);
    expect(state.key).toBe('needs-refresh');
    expect(state.label).toBe('Needs refresh');
    expect(state.tone).toBe('warning');
    expect(stateToneClass(state.tone)).toBe('state-tone--warning');
    expect(state.actionKind).toBe('local');
    expect(state.actionLabel).toBe('Update TRACE');

    const commands = localTraceCommandsForState(state.key);
    expect(commands).toContain('trace analyze');
    expect(commands).toContain('trace sync');

    // Technical context
    expect(repo.latestSync?.headCommit).toBe('4953addc8992f882a1c983bad061fb8035213276');
    expect(repo.remoteHeadSha).toBe('8c74d21054a329e7104b689a7f3d5e219084c7aa');

    // Reports and Changes associated with TRACE
    const reports = MOCK_REPORTS.filter((r) => r.repositoryId === repo.id);
    expect(reports.length).toBeGreaterThan(0);
    const changes = MOCK_CHANGES.filter((c) => c.repositoryId === repo.id);
    expect(changes.length).toBeGreaterThan(0);
  });

  it('correctly maps repository command center properties for Radar (repo-radar-002 - Current)', () => {
    const repo = MOCK_REPOSITORIES.find((r) => r.id === 'repo-radar-002')!;
    expect(repo).toBeDefined();
    expect(repo.name).toBe('Radar');
    expect(repo.latestSync?.stale).toBe(false);

    const state = deriveTraceProjectState(repo, MOCK_ATTENTION);
    expect(state.key).toBe('current');
    expect(state.label).toBe('Current with GitHub');
    expect(state.tone).toBe('success');
    expect(state.actionKind).toBe('none');

    // Commit matches remote head
    expect(repo.latestSync?.headCommit).toBe(repo.remoteHeadSha);
  });

  it('correctly maps repository command center properties for Atlas (repo-atlas-003 - Conflicts / Findings)', () => {
    const repo = MOCK_REPOSITORIES.find((r) => r.id === 'repo-atlas-003')!;
    expect(repo).toBeDefined();
    expect(repo.name).toBe('Atlas');

    const findings = MOCK_ATTENTION.filter(
      (a) => a.repositoryId === repo.id && ['finding', 'risk', 'conflict'].includes(a.kind),
    );
    expect(findings.length).toBeGreaterThan(0);

    const hasConflict = findings.some((f) => f.kind === 'conflict');
    expect(hasConflict).toBe(true);

    const origin = analysisOriginLabel(repo);
    expect(origin).toBe('Local analysis');
  });

  it('correctly maps repository command center properties for Orbit (repo-orbit-004 - Sync attention)', () => {
    const repo = MOCK_REPOSITORIES.find((r) => r.id === 'repo-orbit-004')!;
    expect(repo).toBeDefined();
    expect(repo.name).toBe('Orbit');

    const state = deriveTraceProjectState(repo, MOCK_ATTENTION);
    expect(state.key).toBe('sync-attention');
    expect(state.label).toBe('Sync needs attention');
    expect(state.tone).toBe('danger');
  });

  it('correctly maps repository command center properties for Nova (repo-nova-005 - Connected / not analyzed)', () => {
    const repo = MOCK_REPOSITORIES.find((r) => r.id === 'repo-nova-005')!;
    expect(repo).toBeDefined();
    expect(repo.name).toBe('Nova');
    expect(repo.latestSync).toBeNull();
    expect(repo.lastSynchronizedAt).toBeNull();
    expect(repo.analysis?.status).toBe('not-started');

    const state = deriveTraceProjectState(repo, MOCK_ATTENTION);
    expect(state.key).toBe('connected-not-analyzed');
    expect(state.label).toBe('Connected - Not analyzed');
    expect(state.actionKind).toBe('local');
    expect(state.actionLabel).toBe('Analyze locally');

    const commands = localTraceCommandsForState(state.key);
    expect(commands).toEqual(['trace analyze']);

    const findings = MOCK_ATTENTION.filter(
      (a) => a.repositoryId === repo.id && ['finding', 'risk', 'conflict'].includes(a.kind),
    );
    expect(findings).toHaveLength(0);
  });

  it('ensures finding details are formatted cleanly and sparse', () => {
    const findings = MOCK_ATTENTION.filter((a) => ['finding', 'risk', 'conflict'].includes(a.kind));
    findings.forEach((finding) => {
      expect(finding.title).toBeTruthy();
      expect(finding.severity).toMatch(/^(critical|high|medium|low|info)$/);
      expect(finding.classification).toMatch(/^(deterministic|probabilistic)$/);
      expect(Array.isArray(finding.evidence)).toBe(true);

      const formatted = presentFindingDetail(finding.detail);
      expect(formatted).toBeTruthy();
      expect(typeof formatted).toBe('string');
    });
  });
});
