import type {
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

  // High-precision pairing for known universe conflicts
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
      items: conflict.items ?? [],
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
        target: 'Contract: Session Expiration Protocol',
        statement:
          'Mismatched session expiration TTL across boundary. Users with valid gateway cookies will be rejected at the API edge after 24 hours without an orderly refresh prompt.',
        actionRequired: 'Normalize session TTL to 24 hours with active refresh window in gateway config.',
      },
      items: conflict.items ?? [],
    };
  }

  // Generic paired conflict derivation from synced record items and related changes
  const prA = relatedChanges[0];
  const prB = relatedChanges[1];

  const sideA: ConflictSide = prA
    ? {
        kind: 'pr',
        badge: `PR #${prA.number}`,
        title: prA.title,
        author: prA.authorLogin,
        branch: prA.branch,
        area: prA.affectedAreas?.[0] ?? 'Core',
        assumption: conflict.items?.[0]?.detail ?? 'Active branch change set',
        locus: conflict.items?.[0]?.evidence?.[0] ?? 'packages/core',
        url: prA.url,
        changeId: prA.id,
        changeNumber: prA.number,
      }
    : {
        kind: 'system',
        badge: 'Base Contract',
        title: conflict.items?.[0]?.title ?? 'Baseline Specification',
        author: 'Repository',
        branch: 'main',
        area: 'Schema / Core',
        assumption: conflict.items?.[0]?.detail ?? 'Declared repository contract',
        locus: conflict.items?.[0]?.evidence?.[0] ?? 'src/schema.ts',
      };

  const sideB: ConflictSide = prB
    ? {
        kind: 'pr',
        badge: `PR #${prB.number}`,
        title: prB.title,
        author: prB.authorLogin,
        branch: prB.branch,
        area: prB.affectedAreas?.[0] ?? 'Integration',
        assumption: conflict.items?.[1]?.detail ?? 'Concurrent branch mutation',
        locus: conflict.items?.[1]?.evidence?.[0] ?? 'packages/integration',
        url: prB.url,
        changeId: prB.id,
        changeNumber: prB.number,
      }
    : {
        kind: 'pr',
        badge: conflict.items?.[1]?.title ? 'Secondary Target' : 'Target Branch',
        title: conflict.items?.[1]?.title ?? 'Downstream contract consumer',
        author: 'Reviewer',
        branch: 'feature',
        area: 'Consumers',
        assumption: conflict.items?.[1]?.detail ?? 'Downstream assumption',
        locus: conflict.items?.[1]?.evidence?.[0] ?? 'src/consumer.ts',
      };

  return {
    conflict,
    repository,
    classification: conflict.category ?? 'Deterministic collision',
    severity: (conflict.severity as 'high' | 'medium' | 'low') ?? 'high',
    sideA,
    sideB,
    sharedBoundary: {
      target: conflict.items?.[0]?.evidence?.[0] ?? 'Shared Interface',
      statement: conflict.summary,
      actionRequired: conflict.items?.[0]?.detail ?? 'Reconcile conflicting definitions before merge.',
    },
    items: conflict.items ?? [],
  };
}
