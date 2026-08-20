import type { MockScenarioKey, MockUniverse } from './types';

export function applyScenario(universe: MockUniverse, scenario: MockScenarioKey): MockUniverse {
  // Clone universe to preserve base constants
  const repositories = universe.repositories.map((repo) => ({
    ...repo,
    latestSync: repo.latestSync ? { ...repo.latestSync } : null,
    analysis: repo.analysis ? { ...repo.analysis } : null,
  }));
  const attention = [...universe.attention];
  const changes = [...universe.changes];
  const reports = [...universe.reports];
  const conflicts = [...universe.conflicts];
  const decisions = [...universe.decisions];
  const rules = [...universe.rules];
  const risks = [...universe.risks];
  const activity = [...universe.activity];
  const devices = [...universe.devices];

  switch (scenario) {
    case 'github-unavailable': {
      // TRACE cannot currently verify remote GitHub state.
      // Semantics:
      // - Do NOT mark freshness Current
      // - Do NOT erase prior verified TRACE intelligence (reports, attention, changes, etc. preserved)
      // - Explain GitHub status is unavailable
      // - Preserve existing synchronized records
      // - In repositories: remoteHeadSha becomes null, freshness (stale) becomes null (unknown)
      const unverifiedRepos = repositories.map((repo) => ({
        ...repo,
        remoteHeadSha: null,
        latestSync: repo.latestSync
          ? {
              ...repo.latestSync,
              stale: null,
            }
          : null,
      }));

      const githubUnavailableAttention = [
        ...attention,
        {
          id: 'att-github-unavailable-001',
          kind: 'risk' as const,
          title: 'GitHub API service unreachable',
          detail:
            'TRACE cannot verify remote default-branch state or commit freshness. Prior verified intelligence and synchronized records are preserved.',
          severity: 'medium',
          classification: 'deterministic',
          evidence: ['GitHub API: HTTP 503 Service Unavailable / Network timeout'],
          repositoryId: null,
          repositoryName: null,
          updatedAt: '2026-08-19T10:45:00.000Z',
        },
      ];

      return {
        ...universe,
        repositories: unverifiedRepos,
        attention: githubUnavailableAttention,
      };
    }

    case 'permission-missing': {
      // The GitHub installation/account lacks sufficient repository access.
      // Semantics:
      // - Distinguish from network outage
      // - Surface permission recovery guidance
      // - Do not fabricate repository freshness
      // - Do not erase prior verified intelligence
      const unverifiedRepos = repositories.map((repo) => ({
        ...repo,
        remoteHeadSha: null,
        latestSync: repo.latestSync
          ? {
              ...repo.latestSync,
              stale: null,
            }
          : null,
      }));

      const permissionMissingAttention = [
        ...attention,
        {
          id: 'att-permission-missing-001',
          kind: 'risk' as const,
          title: 'GitHub App repository permissions missing',
          detail:
            'The GitHub App installation lacks required permissions for repository pull requests and commit metadata inspection. Re-authorize the GitHub App to resume remote tracking.',
          severity: 'high',
          classification: 'deterministic',
          evidence: [
            'GitHub App Permissions: Pull Requests = None (Read required)',
            'GitHub App Permissions: Metadata = Read-only',
          ],
          repositoryId: null,
          repositoryName: null,
          updatedAt: '2026-08-19T10:30:00.000Z',
        },
      ];

      return {
        ...universe,
        repositories: unverifiedRepos,
        attention: permissionMissingAttention,
      };
    }

    case 'analysis-running': {
      // Local analysis is currently in progress on TRACE
      // Semantics:
      // - Prior verified dashboard record remains visible
      // - Local analysis is currently in progress (no fabricated percentage)
      // - Do not show new findings before completion
      // - Do not mark new GitHub HEAD as analyzed
      if (repositories[0]) {
        repositories[0].analysis = {
          id: 'analysis-running-001',
          status: 'running',
          updatedAt: '2026-08-19T10:45:00.000Z',
        };
      }
      return { ...universe, repositories };
    }

    case 'analysis-failed': {
      // Latest local analysis attempt failed
      // Semantics:
      // - Latest failed attempt is visible
      // - Prior verified/synchronized intelligence remains intact
      // - Do not erase last successful state
      // - Truthful recovery action: re-run local analysis
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
            kind: 'analysis-failed' as const,
            title: 'Local AST analysis process failed for TRACE',
            detail:
              'Local tree-sitter AST parser encountered an unexpected syntax error during analysis pass. The previous verified dashboard record remains active. Fix syntax errors and re-run analysis.',
            severity: 'high',
            classification: 'deterministic',
            evidence: ['trace-analysis/worker.log: line 142 SyntaxError in packages/auth/src/index.ts'],
            repositoryId: repositories[0]?.id ?? null,
            repositoryName: repositories[0]?.fullName ?? null,
            updatedAt: '2026-08-19T09:45:00.000Z',
          },
        ],
      };
    }

    case 'sync-running': {
      // Local analysis completed; approved records are being synchronized
      // Semantics:
      // - Local analysis completed
      // - Approved records being synchronized
      // - Previous verified dashboard snapshot remains readable
      // - Do not mark new snapshot promoted until sync succeeds
      if (repositories[0]) {
        repositories[0].analysis = {
          id: 'analysis-completed-001',
          status: 'completed',
          updatedAt: '2026-08-19T09:30:00.000Z',
        };
      }
      return {
        ...universe,
        repositories,
        attention: [
          ...attention,
          {
            id: 'att-sync-running-001',
            kind: 'finding' as const,
            title: 'Artifact synchronization in progress for TRACE',
            detail:
              'Approved .trace projection manifest is being uploaded to workspace project memory. The current dashboard snapshot will update upon completion.',
            severity: 'low',
            classification: 'deterministic',
            evidence: ['.trace/manifest.json (upload in flight)'],
            repositoryId: repositories[0]?.id ?? null,
            repositoryName: repositories[0]?.fullName ?? null,
            updatedAt: '2026-08-19T09:35:00.000Z',
          },
        ],
      };
    }

    case 'sync-failed': {
      // Local analysis is valid and completed, but synchronization failed
      // Semantics:
      // - Local analysis remains valid
      // - Synchronization failed
      // - Previous verified dashboard state remains available
      // - Recovery action focuses on retrying sync, NOT re-running analysis
      if (repositories[0]) {
        repositories[0].analysis = {
          id: 'analysis-completed-001',
          status: 'completed',
          updatedAt: '2026-08-19T09:30:00.000Z',
        };
        if (repositories[0].latestSync) {
          repositories[0].latestSync.stale = false;
        }
      }
      return {
        ...universe,
        repositories,
        attention: [
          ...attention,
          {
            id: 'att-sync-failed-001',
            kind: 'sync-failed' as const,
            title: 'Artifact promotion rejected by checksum validation for TRACE',
            detail:
              'The uploaded report digest did not match the manifest signature in .trace/manifest.json. The previous verified snapshot remains active; review local sync status before retrying.',
            severity: 'high',
            classification: 'deterministic',
            evidence: ['.trace/manifest.json: payload checksum mismatch'],
            repositoryId: repositories[0]?.id ?? null,
            repositoryName: repositories[0]?.fullName ?? null,
            updatedAt: '2026-08-19T09:40:00.000Z',
          },
        ],
      };
    }

    case 'freshness-unavailable': {
      // GitHub remote HEAD cannot currently be trusted/resolved
      // Semantics:
      // - Remote HEAD SHA is null
      // - Never infer Current
      // - Never infer Needs refresh
      // - Preserve last verified TRACE record
      // - Label state as unavailable/unknown, not stale
      const unverifiedRepos = repositories.map((repo) => ({
        ...repo,
        remoteHeadSha: null,
        latestSync: repo.latestSync
          ? {
              ...repo.latestSync,
              stale: null,
            }
          : null,
      }));
      return { ...universe, repositories: unverifiedRepos };
    }

    case 'no-analysis': {
      // Canonical no-analysis state across workspace
      // Semantics:
      // - Repositories connected & available
      // - No TRACE analysis
      // - 0 findings, 0 reports, 0 conflicts, 0 decisions
      // - Next action: local analysis
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
        decisions: [],
      };
    }

    case 'default':
    default:
      return universe;
  }
}

