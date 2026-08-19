import { describe, expect, it } from 'vitest';
import { mockDataProvider } from '../index';
import { deriveTraceProjectState } from '../../dashboard-state';

describe('Phase 2 — Mock Universe & Core Repositories', () => {
  it('provides Northstar Engineering workspace identity and primary user', () => {
    const universe = mockDataProvider.getUniverse();
    expect(universe.workspace.name).toBe('Northstar Engineering');
    expect(universe.workspace.profileComplete).toBe(true);
    expect(universe.workspace.executionMode).toBe('Local TRACE');

    expect(universe.currentUser.name).toBe('Mohammad Mohammadi');
    expect(universe.currentUser.email).toBe('mohammad@northstar.engineering');
    expect(universe.currentUser.githubLogin).toBe('mohammadm');

    const lead = universe.team.find((m) => m.id === universe.currentUser.id);
    expect(lead?.role).toBe('Engineering Lead');
  });

  it('contains the 5 core repositories with deterministic IDs and SHAs', () => {
    const universe = mockDataProvider.getUniverse();
    const repos = universe.repositories;
    expect(repos).toHaveLength(5);

    const trace = repos.find((r) => r.id === 'repo-trace-001');
    const radar = repos.find((r) => r.id === 'repo-radar-002');
    const atlas = repos.find((r) => r.id === 'repo-atlas-003');
    const orbit = repos.find((r) => r.id === 'repo-orbit-004');
    const nova = repos.find((r) => r.id === 'repo-nova-005');

    expect(trace).toBeDefined();
    expect(trace?.fullName).toBe('northstar-engineering/TRACE');
    expect(trace?.latestSync?.headCommit).toBe('4953addc8992f882a1c983bad061fb8035213276');
    expect(trace?.remoteHeadSha).toBe('8c74d21054a329e7104b689a7f3d5e219084c7aa');
    expect(trace?.latestSync?.stale).toBe(true);

    expect(radar).toBeDefined();
    expect(radar?.fullName).toBe('northstar-engineering/Radar');
    expect(radar?.latestSync?.headCommit).toBe('1e9b8a4746f328109dcb49281735ae89104fa281');
    expect(radar?.remoteHeadSha).toBe('1e9b8a4746f328109dcb49281735ae89104fa281');
    expect(radar?.latestSync?.stale).toBe(false);

    expect(atlas).toBeDefined();
    expect(atlas?.fullName).toBe('northstar-engineering/Atlas');
    expect(atlas?.latestSync?.headCommit).toBe('f3c2a77890123456789abcdef0123456789a1b2c');
    expect(atlas?.remoteHeadSha).toBe('f3c2a77890123456789abcdef0123456789a1b2c');
    expect(atlas?.latestSync?.stale).toBe(false);

    expect(orbit).toBeDefined();
    expect(orbit?.fullName).toBe('northstar-engineering/Orbit');
    expect(orbit?.latestSync?.headCommit).toBe('d7e8f90123456789abcdef0123456789ab2c3d4e');
    expect(orbit?.remoteHeadSha).toBe('d7e8f90123456789abcdef0123456789ab2c3d4e');

    expect(nova).toBeDefined();
    expect(nova?.fullName).toBe('northstar-engineering/Nova');
    expect(nova?.lastSynchronizedAt).toBeNull();
    expect(nova?.analysis?.status).toBe('not-started');
  });

  it('correctly reconciles findings counts across all repositories (31 total)', () => {
    const universe = mockDataProvider.getUniverse();
    const attention = universe.attention;
    expect(attention).toHaveLength(31);

    const traceFindings = attention.filter((a) => a.repositoryId === 'repo-trace-001');
    const radarFindings = attention.filter((a) => a.repositoryId === 'repo-radar-002');
    const atlasFindings = attention.filter((a) => a.repositoryId === 'repo-atlas-003');
    const orbitFindings = attention.filter((a) => a.repositoryId === 'repo-orbit-004');
    const novaFindings = attention.filter((a) => a.repositoryId === 'repo-nova-005');

    expect(traceFindings).toHaveLength(14);
    expect(radarFindings).toHaveLength(3);
    expect(atlasFindings).toHaveLength(8);
    expect(orbitFindings).toHaveLength(6);
    expect(novaFindings).toHaveLength(0);
  });

  it('correctly reconciles reports counts across all repositories (12 total)', () => {
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
    expect(novaReports).toHaveLength(0);
  });

  it('correctly reconciles changes counts across all repositories (9 total)', () => {
    const universe = mockDataProvider.getUniverse();
    const changes = universe.changes;
    expect(changes).toHaveLength(9);

    const traceChanges = changes.filter((c) => c.repositoryId === 'repo-trace-001');
    const radarChanges = changes.filter((c) => c.repositoryId === 'repo-radar-002');
    const atlasChanges = changes.filter((c) => c.repositoryId === 'repo-atlas-003');
    const orbitChanges = changes.filter((c) => c.repositoryId === 'repo-orbit-004');
    const novaChanges = changes.filter((c) => c.repositoryId === 'repo-nova-005');

    expect(traceChanges).toHaveLength(3);
    expect(radarChanges).toHaveLength(1);
    expect(atlasChanges).toHaveLength(3);
    expect(orbitChanges).toHaveLength(2);
    expect(novaChanges).toHaveLength(0);
  });

  it('derives accurate lifecycle states for each repository', () => {
    const universe = mockDataProvider.getUniverse();
    const { repositories, attention } = universe;

    const trace = repositories.find((r) => r.id === 'repo-trace-001')!;
    const radar = repositories.find((r) => r.id === 'repo-radar-002')!;
    const atlas = repositories.find((r) => r.id === 'repo-atlas-003')!;
    const orbit = repositories.find((r) => r.id === 'repo-orbit-004')!;
    const nova = repositories.find((r) => r.id === 'repo-nova-005')!;

    const traceState = deriveTraceProjectState(trace, attention);
    const radarState = deriveTraceProjectState(radar, attention);
    const atlasState = deriveTraceProjectState(atlas, attention);
    const orbitState = deriveTraceProjectState(orbit, attention);
    const novaState = deriveTraceProjectState(nova, attention);

    expect(traceState.key).toBe('needs-refresh');
    expect(radarState.key).toBe('current');
    expect(atlasState.key).toBe('current');
    expect(orbitState.key).toBe('sync-attention');
    expect(novaState.key).toBe('connected-not-analyzed');
  });

  it('generates a valid DashboardSummary with capabilities', () => {
    const summary = mockDataProvider.getDashboardSummary();
    expect(summary.setup.authenticated).toBe(true);
    expect(summary.setup.repositoriesAvailable).toBe(5);
    expect(summary.capabilities.changes).toBe(true);
    expect(summary.capabilities.reports).toBe(true);
    expect(summary.capabilities.conflicts).toBe(true);
    expect(summary.capabilities.decisions).toBe(true);
    expect(summary.capabilities.rules).toBe(true);
    expect(summary.capabilities.activity).toBe(true);
  });
});
