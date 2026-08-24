'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { TraceSelect } from './trace-select';
import type {
  DashboardAttention,
  DashboardChange,
  DashboardRepository,
  DashboardSyncedRecord,
  DashboardSyncedRecordItem,
} from '../../../../lib/dashboard';
import { formatDate, formatRelativeDate } from '../../../../lib/dashboard-state';

export interface ConflictsViewProps {
  conflicts: DashboardSyncedRecord[];
  changes: DashboardChange[];
  repositories: DashboardRepository[];
  attention: DashboardAttention[];
}

interface ConflictSide {
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

interface PairedConflictModel {
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

export function ConflictsView({
  conflicts,
  changes,
  repositories,
  attention,
}: ConflictsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [repositoryFilter, setRepositoryFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [selectedConflict, setSelectedConflict] = useState<PairedConflictModel | null>(null);

  // Resolved paired conflict models
  const pairedConflicts = useMemo(() => {
    return conflicts.map((conflict) => resolvePairedConflict(conflict, changes, repositories));
  }, [conflicts, changes, repositories]);

  // Filtered conflicts
  const filteredConflicts = useMemo(() => {
    return pairedConflicts.filter((model) => {
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = model.conflict.title.toLowerCase().includes(query);
        const matchesSummary = model.conflict.summary.toLowerCase().includes(query);
        const matchesRepo = model.conflict.repositoryName.toLowerCase().includes(query);
        const matchesTarget = model.sharedBoundary.target.toLowerCase().includes(query);
        const matchesSideA =
          model.sideA.title.toLowerCase().includes(query) ||
          model.sideA.badge.toLowerCase().includes(query) ||
          (model.sideA.author?.toLowerCase().includes(query) ?? false) ||
          (model.sideA.branch?.toLowerCase().includes(query) ?? false) ||
          model.sideA.locus.toLowerCase().includes(query);
        const matchesSideB =
          model.sideB.title.toLowerCase().includes(query) ||
          model.sideB.badge.toLowerCase().includes(query) ||
          (model.sideB.author?.toLowerCase().includes(query) ?? false) ||
          (model.sideB.branch?.toLowerCase().includes(query) ?? false) ||
          model.sideB.locus.toLowerCase().includes(query);
        const matchesEvidence = model.items.some(
          (i) =>
            i.title.toLowerCase().includes(query) ||
            i.detail.toLowerCase().includes(query) ||
            i.evidence.some((e) => e.toLowerCase().includes(query)),
        );

        if (
          !matchesTitle &&
          !matchesSummary &&
          !matchesRepo &&
          !matchesTarget &&
          !matchesSideA &&
          !matchesSideB &&
          !matchesEvidence
        ) {
          return false;
        }
      }

      // Repository filter
      if (repositoryFilter !== 'all') {
        if (
          model.conflict.repositoryId !== repositoryFilter &&
          model.conflict.repositoryName !== repositoryFilter
        ) {
          return false;
        }
      }

      // Severity filter
      if (severityFilter !== 'all') {
        if (model.severity !== severityFilter) {
          return false;
        }
      }

      return true;
    });
  }, [pairedConflicts, searchQuery, repositoryFilter, severityFilter]);

  const activeFilterCount =
    (searchQuery.trim() !== '' ? 1 : 0) +
    (repositoryFilter !== 'all' ? 1 : 0) +
    (severityFilter !== 'all' ? 1 : 0);

  const resetFilters = () => {
    setSearchQuery('');
    setRepositoryFilter('all');
    setSeverityFilter('all');
  };

  // Metrics summary
  const totalConflictsCount = conflicts.length;
  const affectedReposCount = new Set(conflicts.map((c) => c.repositoryId)).size;
  const highSeverityCount = pairedConflicts.filter((c) => c.severity === 'high').length;
  const deterministicConflictsCount = pairedConflicts.filter(
    (c) =>
      c.classification.toLowerCase().includes('deterministic') ||
      c.items.some((i) => (i.classification ?? '').toLowerCase().includes('deterministic')),
  ).length;

  const selectedRepoObject = repositories.find((r) => r.id === repositoryFilter);

  return (
    <div className="conflicts-surface" id="conflicts-surface">
      {/* Top Intelligence Summary Strip */}
      <section className="conflicts-summary-bar" aria-label="Conflicts summary metrics">
        <div className="conflicts-summary-metric">
          <span className="conflicts-summary-metric__value">{totalConflictsCount}</span>
          <span className="conflicts-summary-metric__label">Active conflicts</span>
        </div>
        <div className="conflicts-summary-divider" aria-hidden="true" />
        <div className="conflicts-summary-metric">
          <span className="conflicts-summary-metric__value">{affectedReposCount}</span>
          <span className="conflicts-summary-metric__label">Affected repositories</span>
        </div>
        <div className="conflicts-summary-divider" aria-hidden="true" />
        <div className="conflicts-summary-metric">
          <span className="conflicts-summary-metric__value conflicts-summary-metric__value--high">
            {highSeverityCount}
          </span>
          <span className="conflicts-summary-metric__label">High impact</span>
        </div>
        <div className="conflicts-summary-divider" aria-hidden="true" />
        <div className="conflicts-summary-metric">
          <span className="conflicts-summary-metric__value">
            {deterministicConflictsCount}
          </span>
          <span className="conflicts-summary-metric__label">Deterministic AST</span>
        </div>
        <div className="conflicts-summary-note">
          <span>Deterministic invariant checks · Zero developer surveillance</span>
        </div>
      </section>

      {/* Toolbar & Filters */}
      <div className="conflicts-toolbar" role="search" aria-label="Filter and search conflicts">
        <div className="conflicts-toolbar__search">
          <div className="search-input-wrapper">
            <svg
              className="search-icon"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              id="conflicts-search-input"
              className="trace-input conflicts-search-input"
              type="search"
              placeholder="Search by PR #, table, file path, author, or boundary…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search conflicts"
            />
            {searchQuery ? (
              <button
                type="button"
                className="search-clear-button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search input"
              >
                ×
              </button>
            ) : null}
          </div>
        </div>

        <div className="conflicts-toolbar__controls">
          {/* Repository Scope Selector */}
          <div className="filter-select-group">
            <label htmlFor="conflicts-repo-filter" className="filter-select-label">
              Repository
            </label>
            <TraceSelect
              id="conflicts-repo-filter"
              value={repositoryFilter}
              onChange={setRepositoryFilter}
              ariaLabel="Filter by repository"
              options={[
                { value: 'all', label: `All repositories (${conflicts.length})` },
                ...repositories.map((repo) => ({
                  value: repo.id,
                  label: repo.name,
                  count: conflicts.filter((c) => c.repositoryId === repo.id).length,
                })),
              ]}
            />
          </div>

          {/* Severity / Impact Filter */}
          <div className="filter-select-group">
            <label htmlFor="conflicts-severity-filter" className="filter-select-label">
              Severity
            </label>
            <TraceSelect
              id="conflicts-severity-filter"
              value={severityFilter}
              onChange={setSeverityFilter}
              ariaLabel="Filter by severity"
              options={[
                { value: 'all', label: `All severities (${conflicts.length})` },
                { value: 'high', label: 'High impact only', count: highSeverityCount },
                {
                  value: 'medium',
                  label: 'Medium impact only',
                  count: conflicts.length - highSeverityCount,
                },
              ]}
            />
          </div>

          {/* Reset Filters */}
          {activeFilterCount > 0 ? (
            <button
              type="button"
              className="trace-button trace-button--tertiary trace-button--small filter-reset-button"
              onClick={resetFilters}
            >
              Reset ({activeFilterCount})
            </button>
          ) : null}
        </div>
      </div>

      {/* Main Conflict Listing / Empty State */}
      {filteredConflicts.length === 0 ? (
        /* Repository Specific or General Empty States */
        selectedRepoObject && (selectedRepoObject.syncState === 'not_analyzed' || !selectedRepoObject.lastSynchronizedAt || selectedRepoObject.analysis?.status === 'not-started') ? (
          <div className="conflicts-empty-panel conflicts-empty-panel--nova" role="status">
            <div className="conflicts-empty-glyph" aria-hidden="true">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <span className="conflicts-empty-status-tag conflicts-empty-status-tag--pending">
              ANALYSIS PENDING · SETUP REQUIRED
            </span>
            <h3>Conflict analysis requires completed TRACE analysis.</h3>
            <p>
              {selectedRepoObject.name} has not yet completed local TRACE analysis. Run <code>trace analyze</code> locally and sync an approved conflict artifact before cross-branch AST invariants can be evaluated.
            </p>
            <div className="conflicts-empty-actions">
              <Link
                className="trace-button trace-button--primary trace-button--small"
                href={`/app/repositories/${selectedRepoObject.id}`}
              >
                Configure {selectedRepoObject.name} repository →
              </Link>
              <button
                type="button"
                className="trace-button trace-button--secondary trace-button--small"
                onClick={resetFilters}
              >
                View all repositories
              </button>
            </div>
          </div>
        ) : selectedRepoObject && selectedRepoObject.lastSynchronizedAt ? (
          <div className="conflicts-empty-panel conflicts-empty-panel--radar" role="status">
            <div className="conflicts-empty-glyph" aria-hidden="true">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <span className="conflicts-empty-status-tag">AST INVARIANTS CLEAN · ANALYSIS COMPLETE</span>
            <h3>No active engineering conflicts detected.</h3>
            <p>
              {selectedRepoObject.name} has passed all deterministic AST collision invariant checks across active branches.
              All active pull request snapshots in this repository are uncontested and safe for independent evaluation.
            </p>
            <div className="conflicts-empty-actions">
              <Link
                className="trace-button trace-button--secondary trace-button--small"
                href={`/app/repositories/${selectedRepoObject.id}`}
              >
                View {selectedRepoObject.name} repository overview →
              </Link>
              <button
                type="button"
                className="trace-button trace-button--tertiary trace-button--small"
                onClick={resetFilters}
              >
                View all repositories
              </button>
            </div>
          </div>
        ) : (
          <div className="conflicts-empty-panel" role="status">
            <div className="conflicts-empty-glyph" aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <h3>No conflicts match your filter criteria</h3>
            <p>
              Adjust your search query or reset filter selections to inspect all {totalConflictsCount} synchronized coordination conflicts.
            </p>
            <button
              type="button"
              className="trace-button trace-button--secondary trace-button--small"
              onClick={resetFilters}
            >
              Reset all filters
            </button>
          </div>
        )
      ) : (
        /* Paired Conflict Cards */
        <div className="conflicts-card-list">
          {filteredConflicts.map((model) => (
            <PairedConflictCard
              key={model.conflict.id}
              model={model}
              onInspect={() => setSelectedConflict(model)}
            />
          ))}
        </div>
      )}

      {/* Conflict Inspection Drawer */}
      {selectedConflict ? (
        <ConflictDetailDrawer
          model={selectedConflict}
          attention={attention}
          onClose={() => setSelectedConflict(null)}
        />
      ) : null}
    </div>
  );
}

interface PairedConflictCardProps {
  model: PairedConflictModel;
  onInspect: () => void;
}

function PairedConflictCard({ model, onInspect }: PairedConflictCardProps) {
  const { conflict, sideA, sideB, sharedBoundary, severity, classification, items } = model;

  return (
    <article className="conflict-card" id={`conflict-card-${conflict.id}`}>
      {/* Topline: Repository, Provenance, Classification, Severity */}
      <div className="conflict-card__topline">
        <div className="conflict-card__provenance">
          <span className="conflict-repo-tag">
            <Link href={`/app/repositories/${conflict.repositoryId}`}>
              {conflict.repositoryName}
            </Link>
          </span>
          <span className="meta-sep" aria-hidden="true">·</span>
          <span className="conflict-provenance-text">
            Local snapshot · Synced {formatDate(conflict.syncedAt ?? conflict.generatedAt)}
          </span>
        </div>

        <div className="conflict-card__badges">
          <span className="conflict-classification-badge">
            {classification.toUpperCase()}
          </span>
          <span className="conflict-severity-badge" data-severity={severity}>
            {severity === 'high' ? 'HIGH IMPACT' : 'MEDIUM IMPACT'}
          </span>
        </div>
      </div>

      {/* Core Headline & Why Coordination Is Required */}
      <div className="conflict-card__header">
        <h2 className="conflict-card__title">
          <button
            type="button"
            className="conflict-card__title-btn"
            onClick={onInspect}
          >
            {conflict.title}
          </button>
        </h2>
        <p className="conflict-card__summary">{conflict.summary}</p>
      </div>

      {/* PAIRED COMPARISON GRID: Side A ↔ Shared Invariant ↔ Side B */}
      <div className="conflict-comparison-grid">
        {/* Side A Card */}
        <div className="conflict-side-card conflict-side-card--a">
          <div className="conflict-side-card__top">
            <div className="conflict-side-card__identity">
              <span className="conflict-side-role-tag">SIDE A</span>
              <span className="conflict-side-badge">{sideA.badge}</span>
              {sideA.area ? (
                <span className="conflict-side-area-pill">{sideA.area}</span>
              ) : null}
            </div>
            {sideA.author ? (
              <span className="conflict-side-author">@{sideA.author}</span>
            ) : null}
          </div>

          <h3 className="conflict-side-card__title">{sideA.title}</h3>

          {sideA.branch ? (
            <div className="conflict-side-branch">
              <span className="branch-icon" aria-hidden="true">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="6" y1="3" x2="6" y2="15" />
                  <circle cx="18" cy="6" r="3" />
                  <circle cx="6" cy="18" r="3" />
                  <path d="M18 9a9 9 0 0 1-9 9" />
                </svg>
              </span>
              <code>{sideA.branch}</code>
            </div>
          ) : null}

          {/* Assumption / Invariant for Side A */}
          <div className="conflict-side-assumption">
            <span className="assumption-label">Branch Assumption & State</span>
            <p className="assumption-text">{sideA.assumption}</p>
          </div>

          {/* AST Locus for Side A */}
          <div className="conflict-side-locus">
            <span className="locus-label">Key AST Locus</span>
            <code>{sideA.locus}</code>
          </div>

          {sideA.url ? (
            <div className="conflict-side-action">
              <a
                className="trace-button trace-button--secondary trace-button--small conflict-pr-link"
                href={sideA.url}
                target="_blank"
                rel="noreferrer"
              >
                Open {sideA.badge} on GitHub ↗
              </a>
            </div>
          ) : null}
        </div>

        {/* Center: Shared Boundary Invariant Column */}
        <div className="conflict-shared-boundary">
          <div className="conflict-shared-boundary__glyph" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
            </svg>
          </div>
          <span className="conflict-shared-boundary__label">SHARED BOUNDARY INVARIANT</span>
          <strong className="conflict-shared-boundary__target">{sharedBoundary.target}</strong>
          <div className="conflict-shared-boundary__statement">
            <p>{sharedBoundary.statement}</p>
          </div>
          <div className="conflict-shared-boundary__action-note">
            <span className="action-tag">ACTION REQUIRED</span>
            <span>{sharedBoundary.actionRequired}</span>
          </div>
        </div>

        {/* Side B Card */}
        <div className="conflict-side-card conflict-side-card--b">
          <div className="conflict-side-card__top">
            <div className="conflict-side-card__identity">
              <span className="conflict-side-role-tag">SIDE B</span>
              <span className="conflict-side-badge">{sideB.badge}</span>
              {sideB.area ? (
                <span className="conflict-side-area-pill">{sideB.area}</span>
              ) : null}
            </div>
            {sideB.author ? (
              <span className="conflict-side-author">@{sideB.author}</span>
            ) : null}
          </div>

          <h3 className="conflict-side-card__title">{sideB.title}</h3>

          {sideB.branch ? (
            <div className="conflict-side-branch">
              <span className="branch-icon" aria-hidden="true">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="6" y1="3" x2="6" y2="15" />
                  <circle cx="18" cy="6" r="3" />
                  <circle cx="6" cy="18" r="3" />
                  <path d="M18 9a9 9 0 0 1-9 9" />
                </svg>
              </span>
              <code>{sideB.branch}</code>
            </div>
          ) : null}

          {/* Assumption / Invariant for Side B */}
          <div className="conflict-side-assumption">
            <span className="assumption-label">System / Branch Assumption</span>
            <p className="assumption-text">{sideB.assumption}</p>
          </div>

          {/* AST Locus for Side B */}
          <div className="conflict-side-locus">
            <span className="locus-label">Key AST Locus</span>
            <code>{sideB.locus}</code>
          </div>

          {sideB.url ? (
            <div className="conflict-side-action">
              <a
                className="trace-button trace-button--secondary trace-button--small conflict-pr-link"
                href={sideB.url}
                target="_blank"
                rel="noreferrer"
              >
                Open {sideB.badge} on GitHub ↗
              </a>
            </div>
          ) : null}
        </div>
      </div>

      {/* Structured Evidence Breakdown */}
      <div className="conflict-evidence-block">
        <div className="conflict-evidence-block__header">
          <span className="evidence-header-label">Deterministic AST Evidence ({items.length})</span>
          <span className="evidence-header-sub">No raw code · Verified file range tokens</span>
        </div>

        <div className="conflict-evidence-items">
          {items.map((item) => (
            <div key={item.id} className="conflict-evidence-row">
              <div className="conflict-evidence-row__lead">
                <span className="evidence-glyph" aria-hidden="true">▪</span>
                <strong className="evidence-row-title">{item.title}</strong>
                <span className="evidence-classification-pill">
                  {item.classification ?? 'deterministic'}
                </span>
              </div>
              <p className="evidence-row-detail">{item.detail}</p>
              {item.evidence?.length ? (
                <div className="evidence-row-paths">
                  {item.evidence.map((pathStr) => (
                    <code key={pathStr} className="evidence-path-token">
                      {pathStr}
                    </code>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="conflict-card__footer">
        <div className="conflict-card__provenance-tag">
          <span className="provenance-tag-glyph" aria-hidden="true">▪</span>
          <span>Deterministic AST collision · Shared boundary: <code>{sharedBoundary.target}</code></span>
        </div>

        <div className="conflict-card__actions">
          <button
            type="button"
            className="trace-button trace-button--primary trace-button--small"
            onClick={onInspect}
          >
            Inspect coordination plan
          </button>
        </div>
      </div>
    </article>
  );
}

interface ConflictDetailDrawerProps {
  model: PairedConflictModel;
  attention: DashboardAttention[];
  onClose: () => void;
}

function ConflictDetailDrawer({
  model,
  attention,
  onClose,
}: ConflictDetailDrawerProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const { conflict, sideA, sideB, sharedBoundary, severity, classification, items } = model;

  useEffect(() => {
    closeRef.current?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="trace-dialog-layer" role="presentation">
      <button
        className="trace-dialog-scrim"
        type="button"
        aria-label="Close conflict details"
        onClick={onClose}
      />
      <aside
        className="conflict-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`conflict-drawer-title-${conflict.id}`}
      >
        <div className="conflict-drawer__header">
          <div className="conflict-drawer__eyebrow">
            <span className="conflict-repo-tag">{conflict.repositoryName}</span>
            <span className="conflict-classification-badge">
              {classification.toUpperCase()}
            </span>
            <span className="conflict-severity-badge" data-severity={severity}>
              {severity === 'high' ? 'HIGH IMPACT' : 'MEDIUM IMPACT'}
            </span>
          </div>
          <button
            ref={closeRef}
            className="trace-dialog__close"
            type="button"
            aria-label="Close conflict details"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {/* Title and Summary */}
        <div className="conflict-drawer__intro">
          <h2 id={`conflict-drawer-title-${conflict.id}`}>{conflict.title}</h2>
          <p className="conflict-drawer__lead">{conflict.summary}</p>
        </div>

        {/* Shared Invariant Callout */}
        <section className="conflict-drawer__section conflict-drawer__section--boundary">
          <span className="eyebrow">Shared Boundary Invariant</span>
          <div className="drawer-boundary-box">
            <strong>{sharedBoundary.target}</strong>
            <p>{sharedBoundary.statement}</p>
            <div className="drawer-boundary-action">
              <span className="action-tag">Resolution guidance:</span>
              <span>{sharedBoundary.actionRequired}</span>
            </div>
          </div>
        </section>

        {/* Paired Changes Details */}
        <section className="conflict-drawer__section">
          <span className="eyebrow">Involved Branches & Changes</span>
          <div className="drawer-sides-grid">
            <div className="drawer-side-block">
              <div className="drawer-side-block__head">
                <span className="conflict-side-role-tag">SIDE A</span>
                <strong>{sideA.badge}</strong>
              </div>
              <h4>{sideA.title}</h4>
              <div className="drawer-side-meta">
                <span>Author: @{sideA.author}</span>
                {sideA.branch ? <span>Branch: <code>{sideA.branch}</code></span> : null}
                <span>Locus: <code>{sideA.locus}</code></span>
              </div>
              <p className="drawer-side-assumption">{sideA.assumption}</p>
              {sideA.url ? (
                <a
                  className="trace-button trace-button--secondary trace-button--small"
                  href={sideA.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open {sideA.badge} on GitHub ↗
                </a>
              ) : null}
            </div>

            <div className="drawer-side-block">
              <div className="drawer-side-block__head">
                <span className="conflict-side-role-tag">SIDE B</span>
                <strong>{sideB.badge}</strong>
              </div>
              <h4>{sideB.title}</h4>
              <div className="drawer-side-meta">
                <span>Author: @{sideB.author}</span>
                {sideB.branch ? <span>Branch: <code>{sideB.branch}</code></span> : null}
                <span>Locus: <code>{sideB.locus}</code></span>
              </div>
              <p className="drawer-side-assumption">{sideB.assumption}</p>
              {sideB.url ? (
                <a
                  className="trace-button trace-button--secondary trace-button--small"
                  href={sideB.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open {sideB.badge} on GitHub ↗
                </a>
              ) : null}
            </div>
          </div>
        </section>

        {/* Deterministic Evidence */}
        <section className="conflict-drawer__section">
          <span className="eyebrow">Deterministic AST Evidence Items ({items.length})</span>
          <div className="drawer-evidence-list">
            {items.map((item) => (
              <div key={item.id} className="drawer-evidence-card">
                <div className="drawer-evidence-card__head">
                  <strong>{item.title}</strong>
                  <span className="evidence-classification-pill">{item.classification}</span>
                </div>
                <p>{item.detail}</p>
                {item.evidence?.length ? (
                  <div className="drawer-evidence-card__paths">
                    {item.evidence.map((p) => (
                      <code key={p}>{p}</code>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </section>

        {/* Local Verification Command */}
        <section className="conflict-drawer__section">
          <span className="eyebrow">Local reproduction guidance</span>
          <div className="conflict-drawer__cli-box">
            <code>trace analyze</code>
          </div>
          <p className="conflict-drawer__cli-note">
            Run deterministic change analysis in your local repository workspace to verify AST collision boundaries.
          </p>
        </section>

        {/* Drawer Actions */}
        <div className="conflict-drawer__footer">
          <button
            type="button"
            className="trace-button trace-button--secondary"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </aside>
    </div>
  );
}
