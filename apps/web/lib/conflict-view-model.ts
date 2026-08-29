import type {
  DashboardAttention,
  DashboardChange,
  DashboardRepository,
  DashboardSyncedRecord,
  DashboardSyncedRecordItem,
} from './dashboard';

export interface ConflictSide {
  kind: 'pr' | 'system';
  badge: string;
  title: string;
  author?: string | null;
  branch?: string | null;
  area?: string | null;
  assumption: string;
  locus: string;
  url?: string | null;
  changeId?: string;
  changeNumber?: number;
}

export interface PairedConflictModel {
  conflict: DashboardSyncedRecord;
  repository?: DashboardRepository;
  sideA: ConflictSide;
  sideB: ConflictSide;
  sharedBoundary: {
    target: string;
    statement: string;
    actionRequired: string;
  };
  classification: string;
  severity: 'high' | 'medium' | 'low';
  items: DashboardSyncedRecordItem[];
}

export function resolvePairedConflict(
  conflict: DashboardSyncedRecord,
  changes: DashboardChange[],
  repositories: DashboardRepository[],
): PairedConflictModel {
  const repository = repositories.find((r) => r.id === conflict.repositoryId);
  const relatedChanges = changes.filter(
    (c) =>
      conflict.relatedChangeIds?.includes(c.id) ||
      c.relatedConflictId === conflict.id ||
      c.relatedConflictId === conflict.artifactId ||
      conflict.items?.some((i) => i.changeId === c.id || i.changeNumber === c.number),
  );

  // Exact pairing for the 4 frozen mock conflicts with precision data
  if (conflict.id === 'conflict-atlas-001' || conflict.artifactId === 'art-conflict-atlas-001') {
    const pr88 = relatedChanges.find((c) => c.number === 88) ?? changes.find((c) => c.number === 88);
    const pr89 = relatedChanges.find((c) => c.number === 89) ?? changes.find((c) => c.number === 89);

    return {
      conflict,
      repository,
      classification: 'Deterministic collision',
      severity: 'high',
      sideA: {
        kind: 'pr',
        badge: 'PR #88',
        title: pr88?.title ?? 'Add staged database migration pipeline for workspace roles',
        author: pr88?.authorLogin ?? 'dpark',
        branch: pr88?.branch ?? 'feature/staged-migrations',
        area: pr88?.affectedAreas?.[0] ?? 'Database Layer',
        assumption: 'Declares roleBitmask column with default(0) and NOT NULL constraint.',
        locus: 'packages/db/src/schema.ts:88',
        url: pr88?.url ?? 'https://github.com/northstar-engineering/Atlas/pull/88',
        changeId: pr88?.id ?? 'change-atlas-88',
        changeNumber: 88,
      },
      sideB: {
        kind: 'pr',
        badge: 'PR #89',
        title: pr89?.title ?? 'Align worker payload parsers with updated workspace schema',
        author: pr89?.authorLogin ?? 'lmeyer',
        branch: pr89?.branch ?? 'fix/worker-schema-alignment',
        area: pr89?.affectedAreas?.[0] ?? 'Workers / Queue',
        assumption: 'Adds role_bitmask integer NOT NULL without default value or backfill step in worker schema.',
        locus: 'migrations/0014_user_workspaces.sql:12',
        url: pr89?.url ?? 'https://github.com/northstar-engineering/Atlas/pull/89',
        changeId: pr89?.id ?? 'change-atlas-89',
        changeNumber: 89,
      },
      sharedBoundary: {
        target: 'Table Schema: user_workspaces',
        statement:
          'Contradictory NOT NULL column constraints without default fallback. Background workers under PR #89 will crash on deserializing null role bitmasks written by pre-migration transactions.',
        actionRequired: 'Align PR #89 with staged migration pipeline in PR #88 before merge.',
      },
      items: conflict.items,
    };
  }

  if (conflict.id === 'conflict-atlas-002' || conflict.artifactId === 'art-conflict-atlas-002') {
    const pr87 = relatedChanges.find((c) => c.number === 87) ?? changes.find((c) => c.number === 87);

    return {
      conflict,
      repository,
      classification: 'Deterministic collision',
      severity: 'high',
      sideA: {
        kind: 'pr',
        badge: 'PR #87',
        title: pr87?.title ?? 'Implement structured auth session lifecycle and refresh loop',
        author: pr87?.authorLogin ?? 'sarahc',
        branch: pr87?.branch ?? 'feature/auth-session-lifecycle',
        area: pr87?.affectedAreas?.[0] ?? 'Authentication',
        assumption: 'Auth gateway session cookie grants 7-day lifetime (SessionMaxAge = 7 * 24 * time.Hour).',
        locus: 'services/gateway/config.go:42',
        url: pr87?.url ?? 'https://github.com/northstar-engineering/Atlas/pull/87',
        changeId: pr87?.id ?? 'change-atlas-87',
        changeNumber: 87,
      },
      sideB: {
        kind: 'system',
        badge: 'Service: Core Auth',
        title: 'Core Authentication Token Validator Microservice',
        author: 'Core Architecture',
        branch: 'main',
        area: 'Authentication Core',
        assumption: 'Token validator in core service enforces strict 24-hour expiration threshold (MaxTokenAge = 24 * time.Hour).',
        locus: 'services/auth/validator.go:98',
        url: null,
      },
      sharedBoundary: {
        target: 'Microservice Auth Contract: Token TTL',
        statement:
          'Gateway grants 7-day session cookies while validator rejects tokens older than 24 hours with HTTP 401 Unauthorized, causing premature user sign-out on downstream requests.',
        actionRequired: 'Align token validator max age with gateway session configuration before deploying PR #87.',
      },
      items: conflict.items,
    };
  }

  if (conflict.id === 'conflict-trace-001' || conflict.artifactId === 'art-conflict-trace-001') {
    const pr103 = relatedChanges.find((c) => c.number === 103) ?? changes.find((c) => c.number === 103);

    return {
      conflict,
      repository,
      classification: 'Deterministic collision',
      severity: 'medium',
      sideA: {
        kind: 'pr',
        badge: 'PR #103',
        title: pr103?.title ?? 'Refactor artifact identity computation to use UUID v7 schema',
        author: pr103?.authorLogin ?? 'dpark',
        branch: pr103?.branch ?? 'refactor/artifact-identity-uuid',
        area: pr103?.affectedAreas?.[0] ?? 'Core Architecture',
        assumption: 'Refactors synchronized artifact identity computation to generate random UUID v7 keys (art_uuid7_*).',
        locus: 'packages/trace-core/src/artifact.ts:88',
        url: pr103?.url ?? 'https://github.com/northstar-engineering/TRACE/pull/103',
        changeId: pr103?.id ?? 'change-trace-103',
        changeNumber: 103,
      },
      sideB: {
        kind: 'system',
        badge: 'Bridge: Promoter',
        title: 'Synchronized Artifact Ingestion Promoter',
        author: 'Sync Engine',
        branch: 'main',
        area: 'Sync Infrastructure',
        assumption: 'Local promotion queue requires content-addressed SHA-256 prefixes (art_[a-f0-9]{32,64}) for idempotent deduplication.',
        locus: 'apps/web/lib/sync/promoter.ts:42',
        url: null,
      },
      sharedBoundary: {
        target: 'Ingestion Protocol: Artifact Identifier Schema',
        statement:
          'Ingestion bridge rejects new artifact manifests during upload negotiation due to ID prefix format regex schema mismatch.',
        actionRequired: 'Update promoter regex schema before merging PR #103 to accept UUID v7 prefixes.',
      },
      items: conflict.items,
    };
  }

  if (conflict.id === 'conflict-orbit-001' || conflict.artifactId === 'art-conflict-orbit-001') {
    const pr54 = relatedChanges.find((c) => c.number === 54) ?? changes.find((c) => c.number === 54);
    const pr55 = relatedChanges.find((c) => c.number === 55) ?? changes.find((c) => c.number === 55);

    return {
      conflict,
      repository,
      classification: 'Deterministic collision',
      severity: 'high',
      sideA: {
        kind: 'pr',
        badge: 'PR #54',
        title: pr54?.title ?? 'Add automated sync retry and session recovery handling',
        author: pr54?.authorLogin ?? 'erostova',
        branch: pr54?.branch ?? 'feature/sync-recovery',
        area: pr54?.affectedAreas?.[0] ?? 'Sync Protocol',
        assumption: 'Recovery worker produces extended retry envelopes containing retry_count and resume_offset fields.',
        locus: 'crates/orbit-sync/src/recovery.rs:112',
        url: pr54?.url ?? 'https://github.com/northstar-engineering/Orbit/pull/54',
        changeId: pr54?.id ?? 'change-orbit-54',
        changeNumber: 54,
      },
      sideB: {
        kind: 'pr',
        badge: 'PR #55',
        title: pr55?.title ?? 'Implement strict schema validation for bridge ingestion manifests',
        author: pr55?.authorLogin ?? 'mlin',
        branch: pr55?.branch ?? 'feature/manifest-validator',
        area: pr55?.affectedAreas?.[0] ?? 'Sync Protocol',
        assumption: 'Enforces strict manifest v1.0.0 validation before ingest, disallowing unknown or extra envelope fields.',
        locus: 'crates/orbit-bridge/src/validator.rs:65',
        url: pr55?.url ?? 'https://github.com/northstar-engineering/Orbit/pull/55',
        changeId: pr55?.id ?? 'change-orbit-55',
        changeNumber: 55,
      },
      sharedBoundary: {
        target: 'Manifest Envelope Protocol: v1.0.0 vs v1.1.0',
        statement:
          'Manifest validator in PR #55 rejects valid recovery envelopes generated by PR #54 during session resumption, breaking interrupted sync recovery.',
        actionRequired: 'Update manifest validator to accept optional retry envelope metadata during session resumption.',
      },
      items: conflict.items,
    };
  }

  // Dynamic fallback for any other record
  const changeA = relatedChanges[0];
  const changeB = relatedChanges[1];
  const itemA = conflict.items?.[0];
  const itemB = conflict.items?.[1];

  return {
    conflict,
    repository,
    classification: itemA?.classification === 'deterministic' ? 'Deterministic collision' : 'Probabilistic collision',
    severity: (itemA?.severity as 'high' | 'medium' | 'low') ?? 'high',
    sideA: {
      kind: 'pr',
      badge: changeA ? `PR #${changeA.number}` : 'Change A',
      title: changeA?.title ?? itemA?.title ?? conflict.title,
      author: changeA?.authorLogin ?? 'Author',
      branch: changeA?.branch ?? 'feature-branch',
      area: changeA?.affectedAreas?.[0] ?? 'System Component',
      assumption: itemA?.detail ?? conflict.summary,
      locus: itemA?.evidence?.[0] ?? 'source locus',
      url: changeA?.url,
      changeId: changeA?.id,
      changeNumber: changeA?.number,
    },
    sideB: {
      kind: changeB ? 'pr' : 'system',
      badge: changeB ? `PR #${changeB.number}` : 'System Boundary',
      title: changeB?.title ?? itemB?.title ?? 'Target Architecture',
      author: changeB?.authorLogin ?? 'System Invariant',
      branch: changeB?.branch ?? 'main',
      area: changeB?.affectedAreas?.[0] ?? 'Architecture Core',
      assumption: itemB?.detail ?? 'Existing system invariants enforce strict compatibility contracts.',
      locus: itemB?.evidence?.[0] ?? itemA?.evidence?.[1] ?? 'system locus',
      url: changeB?.url,
      changeId: changeB?.id,
      changeNumber: changeB?.number,
    },
    sharedBoundary: {
      target: conflict.title,
      statement: conflict.summary,
      actionRequired: 'Review AST evidence and coordinate branch alignment before merge.',
    },
    items: conflict.items,
  };
}
