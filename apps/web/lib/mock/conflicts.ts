import type { DashboardSyncedRecord } from '../dashboard';

export const MOCK_CONFLICTS: DashboardSyncedRecord[] = [
  {
    id: 'conflict-atlas-001',
    artifactId: 'art-conflict-atlas-001',
    artifactType: 'conflict',
    repositoryId: 'repo-atlas-003',
    repositoryName: 'northstar-engineering/Atlas',
    title: 'Concurrent schema mutation collision on user_workspaces table',
    summary:
      'PR #142 and PR #145 both alter column constraints on user_workspaces with contradictory default values.',
    status: 'flagged',
    items: [
      {
        id: 'item-conflict-atlas-001',
        title: 'Conflicting NOT NULL constraint addition',
        detail:
          'PR #142 sets default role bitmask to 0 while PR #145 sets role bitmask to 1 without migration sequencing.',
        severity: 'high',
        classification: 'deterministic',
        evidence: [
          'packages/db/src/schema.ts',
          'migrations/0014_user_workspaces.sql',
        ],
      },
    ],
    generatedAt: '2026-08-19T08:45:00.000Z',
    syncedAt: '2026-08-19T08:45:00.000Z',
    origin: 'local',
    content: `# Conflict Report: Schema Mutation Collision

## Affected Branches
- feature/hierarchical-roles (PR #142)
- feature/enterprise-sso-defaults (PR #145)

## Deterministic Evidence
Both pull requests alter migrations targeting table \`user_workspaces\`. Merging either independently will break the migration sequence of the other.`,
  },
];
