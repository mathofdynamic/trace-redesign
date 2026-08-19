import type { DashboardRepository, DashboardSummary } from '../dashboard';
import type { MockScenarioKey, MockUniverse } from './types';

export function applyScenario(universe: MockUniverse, scenario: MockScenarioKey): MockUniverse {
  // Clone universe to preserve base constants
  const repositories = universe.repositories.map((repo) => ({ ...repo }));
  const attention = [...universe.attention];
  const changes = [...universe.changes];
  const reports = [...universe.reports];
  const conflicts = [...universe.conflicts];
  const decisions = [...universe.decisions];
  const rules = [...universe.rules];
  const risks = [...universe.risks];
  const activity = [...universe.activity];

  switch (scenario) {
    case 'github-unavailable': {
      return {
        ...universe,
        repositories: [],
        attention: [],
        changes: [],
        reports: [],
        conflicts: [],
        decisions: [],
        rules: [],
        risks: [],
        activity: [],
      };
    }

    case 'permission-missing': {
      return {
        ...universe,
        attention: [
          ...attention,
          {
            id: 'att-permission-001',
            kind: 'risk',
            title: 'GitHub permissions missing for pull request snapshots',
            detail:
              'The GitHub App installation lacks read permissions for repository pull requests.',
            severity: 'high',
            classification: 'deterministic',
            evidence: ['GitHub App Permissions: Pull Requests = None'],
            repositoryId: repositories[0]?.id ?? null,
            repositoryName: repositories[0]?.fullName ?? null,
            updatedAt: '2026-08-19T10:00:00.000Z',
          },
        ],
      };
    }

    case 'analysis-running': {
      if (repositories[0]) {
        repositories[0].analysis = {
          id: 'analysis-running-001',
          status: 'running',
          updatedAt: new Date().toISOString(),
        };
      }
      return { ...universe, repositories };
    }

    case 'analysis-failed': {
      if (repositories[0]) {
        repositories[0].analysis = {
          id: 'analysis-failed-001',
          status: 'failed',
          updatedAt: '2026-08-19T09:45:00.000Z',
        };
      }
      return {
        ...universe,
        repositories,
        attention: [
          ...attention,
          {
            id: 'att-analysis-failed-001',
            kind: 'analysis-failed',
            title: 'Local AST analysis process failed',
            detail:
              'Analysis worker encountered unexpected syntax error during tree-sitter parse pass on branch ref.',
            severity: 'high',
            classification: 'deterministic',
            evidence: ['trace-analysis/worker.log'],
            repositoryId: repositories[0]?.id ?? null,
            repositoryName: repositories[0]?.fullName ?? null,
            updatedAt: '2026-08-19T09:45:00.000Z',
          },
        ],
      };
    }

    case 'sync-running': {
      // Sync running state
      return { ...universe, repositories };
    }

    case 'sync-failed': {
      return {
        ...universe,
        attention: [
          ...attention,
          {
            id: 'att-sync-failed-001',
            kind: 'sync-failed',
            title: 'Artifact promotion rejected by checksum validation',
            detail:
              'The uploaded report digest did not match the manifest signature in .trace/manifest.json.',
            severity: 'high',
            classification: 'deterministic',
            evidence: ['.trace/manifest.json'],
            repositoryId: repositories[0]?.id ?? null,
            repositoryName: repositories[0]?.fullName ?? null,
            updatedAt: '2026-08-19T09:40:00.000Z',
          },
        ],
      };
    }

    case 'freshness-unavailable': {
      if (repositories[0]?.latestSync) {
        repositories[0].latestSync.stale = null;
      }
      return { ...universe, repositories };
    }

    case 'no-analysis': {
      const unanalyzedRepos = repositories.map((repo) => ({
        ...repo,
        lastSynchronizedAt: null,
        latestSync: null,
        analysis: {
          id: `analysis-none-${repo.id}`,
          status: 'not-started' as const,
          updatedAt: '2026-08-19T06:00:00.000Z',
        },
      }));
      return {
        ...universe,
        repositories: unanalyzedRepos,
        attention: [],
        reports: [],
        conflicts: [],
      };
    }

    case 'default':
    default:
      return universe;
  }
}
