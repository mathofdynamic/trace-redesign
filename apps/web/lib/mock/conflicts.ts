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
      'PR #88 and PR #89 both alter column constraints on user_workspaces with contradictory default values and nullability assumptions.',
    status: 'flagged',
    relatedChangeIds: ['change-atlas-88', 'change-atlas-89'],
    relatedFindingIds: ['att-atlas-001'],
    relatedEvidenceIds: ['ev-atlas-001', 'ev-atlas-002'],
    items: [
      {
        id: 'item-conflict-atlas-001',
        title: 'Conflicting NOT NULL constraint addition',
        detail:
          'PR #88 sets default role bitmask to 0 while PR #89 introduces non-nullable assumptions without default fallback in worker schema.',
        severity: 'high',
        classification: 'deterministic',
        evidence: [
          'packages/db/src/schema.ts:88',
          'migrations/0014_user_workspaces.sql:12',
        ],
        changeId: 'change-atlas-88',
        changeNumber: 88,
        findingId: 'att-atlas-001',
        evidenceId: 'ev-atlas-001',
      },
      {
        id: 'item-conflict-atlas-002',
        title: 'Worker query deserialization failure risk',
        detail:
          'Background workers running under PR #89 codebase will crash on deserializing null role bitmasks written by pre-migration transactions.',
        severity: 'high',
        classification: 'deterministic',
        evidence: ['apps/worker/src/processors/workspace.ts:45'],
        changeId: 'change-atlas-89',
        changeNumber: 89,
        evidenceId: 'ev-atlas-002',
      },
    ],
    generatedAt: '2026-08-19T08:45:00.000Z',
    syncedAt: '2026-08-19T08:45:00.000Z',
    origin: 'local',
    content: `# Conflict Report: Schema Mutation Collision on user_workspaces

## Overview
A concurrent migration collision was detected between two active pull requests altering database migration definitions on table \`user_workspaces\`.

## Affected Branches & Changes
- **PR #88**: \`feature/staged-migrations\` by \`dpark\` (David Park)
- **PR #89**: \`fix/worker-schema-alignment\` by \`lmeyer\` (Lucas Meyer)

## Deterministic Evidence
1. \`packages/db/src/schema.ts:88\`: PR #88 declares \`roleBitmask: integer().default(0).notNull()\`
2. \`migrations/0014_user_workspaces.sql:12\`: PR #89 declares \`ALTER TABLE user_workspaces ADD COLUMN role_bitmask integer NOT NULL;\` without a \`DEFAULT\` value or backfill step.

## Impact & Resolution Guidance
Merging either pull request independently will cause the other's migration sequence to fail or cause runtime worker deserialization errors.
Recommendation: Align PR #89 with the staged migration pipeline defined in PR #88 and ensure default fallback bitmasks are applied.`,
  },
  {
    id: 'conflict-atlas-002',
    artifactId: 'art-conflict-atlas-002',
    artifactType: 'conflict',
    repositoryId: 'repo-atlas-003',
    repositoryName: 'northstar-engineering/Atlas',
    title: 'Incompatible session TTL configurations across auth microservices',
    summary:
      'PR #87 updates auth gateway session lifetime to 7 days while token validator in core service enforces a strict 24-hour expiration threshold.',
    status: 'flagged',
    relatedChangeIds: ['change-atlas-87'],
    relatedFindingIds: ['att-atlas-002'],
    items: [
      {
        id: 'item-conflict-atlas-003',
        title: 'Session TTL mismatch between gateway and token validator',
        detail:
          'Gateway grants 7-day session cookies while validator rejects tokens older than 24 hours with HTTP 401 Unauthorized.',
        severity: 'high',
        classification: 'deterministic',
        evidence: [
          'services/gateway/config.go:42',
          'services/auth/validator.go:98',
        ],
        changeId: 'change-atlas-87',
        changeNumber: 87,
        findingId: 'att-atlas-002',
      },
    ],
    generatedAt: '2026-08-19T08:45:00.000Z',
    syncedAt: '2026-08-19T08:45:00.000Z',
    origin: 'local',
    content: `# Conflict Report: Incompatible Session TTL Configurations

## Overview
A configuration divergence between authentication gateway and token validator services causes premature session invalidation.

## Affected Changes
- **PR #87**: \`feature/auth-session-lifecycle\` by \`schen\` (Sarah Chen)

## Deterministic Evidence
- \`services/gateway/config.go:42\`: Gateway config sets \`SessionMaxAge = 7 * 24 * time.Hour\`
- \`services/auth/validator.go:98\`: Token validator enforces \`MaxTokenAge = 24 * time.Hour\`

## Impact & Resolution Guidance
Users with active sessions older than 24 hours will be unexpectedly signed out when making downstream API calls. Align token validator max age with gateway session configuration.`,
  },
  {
    id: 'conflict-trace-001',
    artifactId: 'art-conflict-trace-001',
    artifactType: 'conflict',
    repositoryId: 'repo-trace-001',
    repositoryName: 'northstar-engineering/TRACE',
    title: 'Artifact identity hash collision risk across concurrent sync batches',
    summary:
      'PR #103 refactors synchronized artifact identity computation while local daemon manifest writer assumes legacy deterministic checksum prefix format.',
    status: 'flagged',
    relatedChangeIds: ['change-trace-103'],
    relatedFindingIds: ['att-trace-013'],
    relatedEvidenceIds: ['ev-trace-014'],
    items: [
      {
        id: 'item-conflict-trace-001',
        title: 'Artifact ID prefix incompatibility in sync promoter',
        detail:
          'PR #103 introduces UUID v7 keys whereas the local promotion queue requires content-addressed SHA-256 prefixes for idempotency deduplication.',
        severity: 'medium',
        classification: 'deterministic',
        evidence: [
          'packages/trace-core/src/artifact.ts:88',
          'apps/web/lib/sync/promoter.ts:42',
        ],
        changeId: 'change-trace-103',
        changeNumber: 103,
        findingId: 'att-trace-013',
        evidenceId: 'ev-trace-014',
      },
    ],
    generatedAt: '2026-08-19T09:00:00.000Z',
    syncedAt: '2026-08-19T09:00:00.000Z',
    origin: 'local',
    content: `# Conflict Report: Artifact Identity Hash Incompatibility

## Overview
A structural collision between the proposed artifact ID scheme in PR #103 and the synchronized ingestion promoter.

## Affected Changes
- **PR #103**: \`refactor/artifact-identity-uuid\` by \`elena-rostova\` (Elena Rostova)

## Deterministic Evidence
- \`packages/trace-core/src/artifact.ts:88\`: Generates \`art_uuid7_*\` identifiers
- \`apps/web/lib/sync/promoter.ts:42\`: Validates identifiers matching \`art_[a-f0-9]{32,64}\` for idempotent dedup.

## Impact & Resolution Guidance
Ingestion bridge rejects new artifact manifests during upload negotiation. Update promoter regex schema before merging PR #103.`,
  },
  {
    id: 'conflict-orbit-001',
    artifactId: 'art-conflict-orbit-001',
    artifactType: 'conflict',
    repositoryId: 'repo-orbit-004',
    repositoryName: 'northstar-engineering/Orbit',
    title: 'Sync bridge schema version incompatibility during active ingestion recovery',
    summary:
      'PR #54 introduces automatic sync retry logic while PR #55 enforces strict manifest v1.0.0 validation before ingest, rejecting valid v1.1.0 recovery manifests.',
    status: 'flagged',
    relatedChangeIds: ['change-orbit-54', 'change-orbit-55'],
    relatedFindingIds: ['att-orbit-001', 'att-orbit-003'],
    relatedEvidenceIds: ['ev-orbit-001', 'ev-orbit-003'],
    items: [
      {
        id: 'item-conflict-orbit-001',
        title: 'Manifest schema validator rejects retry envelopes',
        detail:
          'The recovery worker in PR #54 produces an extended retry envelope that fails strict schema validation in PR #55 validator.',
        severity: 'high',
        classification: 'deterministic',
        evidence: [
          'crates/orbit-bridge/src/validator.rs:65',
          'crates/orbit-sync/src/recovery.rs:112',
        ],
        changeId: 'change-orbit-55',
        changeNumber: 55,
        findingId: 'att-orbit-001',
        evidenceId: 'ev-orbit-001',
      },
    ],
    generatedAt: '2026-08-19T07:30:00.000Z',
    syncedAt: '2026-08-19T07:30:00.000Z',
    origin: 'local',
    content: `# Conflict Report: Sync Bridge Schema Version Incompatibility

## Overview
A validation conflict between recovery manifest generation and ingestion envelope verification causes interrupted sync operations to fail negotiation.

## Affected Changes
- **PR #54**: \`feature/sync-recovery\` by \`mvance\` (Marcus Vance)
- **PR #55**: \`feature/manifest-validator\` by \`elena-rostova\` (Elena Rostova)

## Deterministic Evidence
- \`crates/orbit-bridge/src/validator.rs:65\`: Disallows extra envelope fields on manifest v1.0.0
- \`crates/orbit-sync/src/recovery.rs:112\`: Appends \`retry_count\` and \`resume_offset\` to upload manifests.

## Impact & Resolution Guidance
Update manifest validator to accept optional retry envelope metadata during session resumption.`,
  },
];

export function getConflictById(id: string): DashboardSyncedRecord | undefined {
  return MOCK_CONFLICTS.find((conflict) => conflict.id === id || conflict.artifactId === id);
}

export function getConflictsForRepository(repositoryId: string): DashboardSyncedRecord[] {
  return MOCK_CONFLICTS.filter((conflict) => conflict.repositoryId === repositoryId);
}

