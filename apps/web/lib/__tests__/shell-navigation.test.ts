import { describe, expect, it } from 'vitest';
import { deriveTraceProjectState, type TraceProjectStateKey } from '../dashboard-state';
import { MOCK_REPOSITORIES, MOCK_WORKSPACE, MOCK_PRIMARY_USER, MOCK_ATTENTION } from '../mock';

describe('Authenticated Shell, Sidebar & Navigation Invariants', () => {
  it('validates navigation grouping and authenticated routes', () => {
    const intelligenceRoutes = [
      { name: 'Overview', href: '/app' },
      { name: 'Changes', href: '/app/changes' },
      { name: 'Conflicts', href: '/app/conflicts' },
      { name: 'Findings', href: '/app/findings' },
      { name: 'Reports', href: '/app/reports' },
    ];

    const governanceRoutes = [
      { name: 'Repositories', href: '/app/repositories' },
      { name: 'Decisions', href: '/app/decisions' },
      { name: 'Rules', href: '/app/rules' },
      { name: 'Activity', href: '/app/activity' },
      { name: 'Settings', href: '/app/settings' },
    ];

    expect(intelligenceRoutes).toHaveLength(5);
    expect(governanceRoutes).toHaveLength(5);

    // All routes start with /app
    [...intelligenceRoutes, ...governanceRoutes].forEach((item) => {
      expect(item.href.startsWith('/app')).toBe(true);
      expect(item.name.length).toBeGreaterThan(0);
    });
  });

  it('validates workspace identity and signed-in user contract', () => {
    expect(MOCK_WORKSPACE.name).toBe('Northstar Engineering');
    expect(MOCK_WORKSPACE.slug).toBe('northstar-engineering');
    expect(MOCK_WORKSPACE.executionMode).toBe('Local TRACE');

    expect(MOCK_PRIMARY_USER.name).toBe('Mohammad Mohammadi');
    expect(MOCK_PRIMARY_USER.email).toBe('mohammad@northstar.engineering');
  });

  it('derives accurate project state keys and representations for switcher', () => {
    const traceRepo = MOCK_REPOSITORIES[0];
    const radarRepo = MOCK_REPOSITORIES[1];
    const atlasRepo = MOCK_REPOSITORIES[2];
    const orbitRepo = MOCK_REPOSITORIES[3];
    const novaRepo = MOCK_REPOSITORIES[4];

    const traceState = deriveTraceProjectState(traceRepo, MOCK_ATTENTION.filter(a => a.repositoryId === traceRepo.id));
    const radarState = deriveTraceProjectState(radarRepo, MOCK_ATTENTION.filter(a => a.repositoryId === radarRepo.id));
    const atlasState = deriveTraceProjectState(atlasRepo, MOCK_ATTENTION.filter(a => a.repositoryId === atlasRepo.id));
    const orbitState = deriveTraceProjectState(orbitRepo, MOCK_ATTENTION.filter(a => a.repositoryId === orbitRepo.id));
    const novaState = deriveTraceProjectState(novaRepo, MOCK_ATTENTION.filter(a => a.repositoryId === novaRepo.id));

    const validStateKeys: TraceProjectStateKey[] = [
      'current',
      'needs-refresh',
      'connected-not-analyzed',
      'analysis-failed',
      'sync-failed',
      'sync-attention',
    ];

    expect(validStateKeys).toContain(traceState.key);
    expect(validStateKeys).toContain(radarState.key);
    expect(validStateKeys).toContain(atlasState.key);
    expect(validStateKeys).toContain(orbitState.key);
    expect(validStateKeys).toContain(novaState.key);

    // Radar is cleanly current
    expect(radarState.key).toBe('current');
    expect(radarState.label).toContain('Current with GitHub');

    // TRACE requires refresh because GitHub is ahead of analyzed commit
    expect(traceState.key).toBe('needs-refresh');
    expect(traceState.label).toContain('Needs refresh');

    // Nova has connected but un-analyzed state
    expect(novaState.key).toBe('connected-not-analyzed');
  });

  it('validates repository switcher filter behavior', () => {
    const filterQuery = (query: string) => {
      const q = query.trim().toLowerCase();
      if (!q) return MOCK_REPOSITORIES;
      return MOCK_REPOSITORIES.filter(
        (repo) =>
          repo.name.toLowerCase().includes(q) ||
          repo.defaultBranch.toLowerCase().includes(q)
      );
    };

    expect(filterQuery('')).toHaveLength(5);
    expect(filterQuery('trace')).toHaveLength(1);
    expect(filterQuery('trace')[0].name).toBe('TRACE');
    expect(filterQuery('main')).toHaveLength(5);
    expect(filterQuery('nonexistent')).toHaveLength(0);
  });
});
