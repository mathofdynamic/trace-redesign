import { describe, expect, it } from 'vitest';
import { mockDataProvider } from '../adapter';
import { deriveTraceProjectState } from '../../dashboard-state';

describe('Phase 4B — Operational Surfaces, Devices, and Edge State Scenarios', () => {
  it('provides 4 deterministic devices (3 active, 1 revoked)', () => {
    const devices = mockDataProvider.getDevices();
    expect(devices).toHaveLength(4);

    const activeDevices = devices.filter((d) => !d.revokedAt);
    const revokedDevices = devices.filter((d) => Boolean(d.revokedAt));

    expect(activeDevices).toHaveLength(3);
    expect(revokedDevices).toHaveLength(1);

    expect(activeDevices.map((d) => d.label)).toEqual([
      "Mohammad's MacBook Pro",
      'Studio Workstation',
      'Office Desktop',
    ]);

    expect(revokedDevices[0]?.label).toBe('Old Laptop');
    expect(revokedDevices[0]?.revokedAt).toBe('2026-08-10T12:00:00.000Z');

    // Confirm no raw secrets or plain text tokens
    devices.forEach((device) => {
      expect(device.tokenHash).toMatch(/^sha256:[a-f0-9]{64}$/);
      expect('rawToken' in device).toBe(false);
    });
  });

  it('verifies baseline default repository states', () => {
    const universe = mockDataProvider.getUniverse('default');
    expect(universe.repositories).toHaveLength(5);

    const traceRepo = universe.repositories.find((r) => r.id === 'repo-trace-001')!;
    const radarRepo = universe.repositories.find((r) => r.id === 'repo-radar-002')!;
    const atlasRepo = universe.repositories.find((r) => r.id === 'repo-atlas-003')!;
    const orbitRepo = universe.repositories.find((r) => r.id === 'repo-orbit-004')!;
    const novaRepo = universe.repositories.find((r) => r.id === 'repo-nova-005')!;

    expect(deriveTraceProjectState(traceRepo, universe.attention).key).toBe('needs-refresh');
    expect(deriveTraceProjectState(radarRepo, universe.attention).key).toBe('current');
    expect(deriveTraceProjectState(atlasRepo, universe.attention).key).toBe('current');
    expect(deriveTraceProjectState(orbitRepo, universe.attention).key).toBe('sync-attention');
    expect(deriveTraceProjectState(novaRepo, universe.attention).key).toBe('connected-not-analyzed');
  });

  it('implements github-unavailable scenario truthfully without erasing intelligence', () => {
    const universe = mockDataProvider.getUniverse('github-unavailable');
    expect(universe.repositories).toHaveLength(5);
    expect(universe.reports).toHaveLength(12);
    expect(universe.changes).toHaveLength(9);
    expect(universe.conflicts).toHaveLength(4);
    expect(universe.decisions).toHaveLength(9);
    expect(universe.rules).toHaveLength(8);

    // Repositories have freshness unknown (stale is null)
    universe.repositories.forEach((repo) => {
      expect(repo.remoteHeadSha).toBeNull();
      if (repo.latestSync) {
        expect(repo.latestSync.stale).toBeNull();
      }
    });

    const hasUnavailableAttention = universe.attention.some(
      (a) => a.kind === 'risk' && a.id === 'att-github-unavailable-001',
    );
    expect(hasUnavailableAttention).toBe(true);
  });

  it('implements permission-missing scenario preserving intelligence and surfacing guidance', () => {
    const universe = mockDataProvider.getUniverse('permission-missing');
    expect(universe.repositories).toHaveLength(5);
    expect(universe.reports).toHaveLength(12);

    const permAttention = universe.attention.find((a) => a.id === 'att-permission-missing-001');
    expect(permAttention).toBeDefined();
    expect(permAttention?.kind).toBe('risk');
    expect(permAttention?.severity).toBe('high');
  });

  it('implements analysis-running scenario without fabricated percentage', () => {
    const universe = mockDataProvider.getUniverse('analysis-running');
    const traceRepo = universe.repositories.find((r) => r.id === 'repo-trace-001')!;

    expect(traceRepo.analysis?.status).toBe('running');
    const state = deriveTraceProjectState(traceRepo, universe.attention);
    expect(state.key).toBe('analysis-running');
    expect(state.label).toBe('Analysis in progress');
    expect(state.shortLabel).toBe('Analyzing locally');
    expect(universe.reports).toHaveLength(12);
  });

  it('implements analysis-failed scenario with recovery targeting analysis', () => {
    const universe = mockDataProvider.getUniverse('analysis-failed');
    const traceRepo = universe.repositories.find((r) => r.id === 'repo-trace-001')!;

    expect(traceRepo.analysis?.status).toBe('failed');
    const state = deriveTraceProjectState(traceRepo, universe.attention);
    expect(state.key).toBe('analysis-failed');
    expect(state.tone).toBe('danger');

    const failAttention = universe.attention.find((a) => a.id === 'att-analysis-failed-001');
    expect(failAttention).toBeDefined();
    expect(failAttention?.kind).toBe('analysis-failed');
  });

  it('implements sync-running scenario', () => {
    const universe = mockDataProvider.getUniverse('sync-running');
    const traceRepo = universe.repositories.find((r) => r.id === 'repo-trace-001')!;

    expect(traceRepo.analysis?.status).toBe('completed');
    const syncAttention = universe.attention.find((a) => a.id === 'att-sync-running-001');
    expect(syncAttention).toBeDefined();
  });

  it('implements sync-failed scenario targeting sync retry rather than re-analysis', () => {
    const universe = mockDataProvider.getUniverse('sync-failed');
    const traceRepo = universe.repositories.find((r) => r.id === 'repo-trace-001')!;

    const state = deriveTraceProjectState(traceRepo, universe.attention);
    expect(state.key).toBe('sync-attention');
    expect(state.actionLabel).toBe('Review sync');
    expect(state.actionKind).toBe('local');

    const syncFailAttention = universe.attention.find((a) => a.id === 'att-sync-failed-001');
    expect(syncFailAttention).toBeDefined();
    expect(syncFailAttention?.kind).toBe('sync-failed');
  });

  it('implements freshness-unavailable scenario without false current or stale labels', () => {
    const universe = mockDataProvider.getUniverse('freshness-unavailable');
    const radarRepo = universe.repositories.find((r) => r.id === 'repo-radar-002')!;

    expect(radarRepo.remoteHeadSha).toBeNull();
    expect(radarRepo.latestSync?.stale).toBeNull();

    const state = deriveTraceProjectState(radarRepo, universe.attention);
    expect(state.key).toBe('synced-freshness-unavailable');
    expect(state.shortLabel).toBe('Freshness unavailable');
  });

  it('implements no-analysis workspace scenario with 0 findings and 0 reports', () => {
    const universe = mockDataProvider.getUniverse('no-analysis');
    expect(universe.repositories).toHaveLength(5);
    expect(universe.attention).toHaveLength(0);
    expect(universe.reports).toHaveLength(0);
    expect(universe.conflicts).toHaveLength(0);
    expect(universe.decisions).toHaveLength(0);

    universe.repositories.forEach((repo) => {
      expect(repo.latestSync).toBeNull();
      expect(repo.lastSynchronizedAt).toBeNull();
      const state = deriveTraceProjectState(repo, universe.attention);
      expect(state.key).toBe('connected-not-analyzed');
      expect(state.actionLabel).toBe('Analyze locally');
    });
  });
});
