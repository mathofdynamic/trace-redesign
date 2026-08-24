'use client';

import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import type { DashboardAttention, DashboardRepository, DashboardSyncedRecord } from '../../lib/dashboard';
import {
  deriveTraceProjectState,
  formatRelativeDate,
  localTraceCommandsForState,
} from '../../lib/dashboard-state';
import { LocalActionPanel, ProjectStatusGlyph } from '../(app)/app/_components/trace-redesign';

export type RepositorySelectorProps = {
  repositories: DashboardRepository[];
  attention?: DashboardAttention[];
  reports?: DashboardSyncedRecord[];
  installations?: Array<{
    id: string;
    accountLogin: string;
    accountType: string;
    state: string;
  }>;
  workspaceName?: string;
  setupMessage?: string | null;
  setupStatus?: string | null;
};

type FilterCategory = 'all' | 'current' | 'attention' | 'not-analyzed';

export function RepositorySelector({
  repositories,
  attention = [],
  reports = [],
  installations = [],
  workspaceName = 'Workspace',
  setupMessage = null,
  setupStatus = null,
}: RepositorySelectorProps) {
  const [selected, setSelected] = useState(
    () =>
      new Set(
        repositories
          .filter((repository) => repository.state === 'active')
          .map((repository) => repository.id),
      ),
  );
  const [status, setStatus] = useState<'idle' | 'loading' | 'saved' | 'error'>('idle');
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');
  const [showAccessForm, setShowAccessForm] = useState(false);

  // Enriched repository list with derived facts
  const enrichedRepositories = useMemo(() => {
    return repositories.map((repo) => {
      const isSelected = selected.has(repo.id);
      const state = deriveTraceProjectState(repo as DashboardRepository, attention);
      const repoAttention = attention.filter((item) => item.repositoryId === repo.id);
      const findings = repoAttention.filter((item) =>
        ['finding', 'risk', 'conflict'].includes(item.kind),
      );
      const repoReports = reports.filter((item) => item.repositoryId === repo.id);
      const localCommands = localTraceCommandsForState(state.key);
      const isCurrent = state.key === 'current';
      const isAttention =
        ['needs-refresh', 'sync-attention', 'analysis-failed'].includes(state.key) ||
        findings.length > 0;
      const isNotAnalyzed =
        state.key === 'connected-not-analyzed' || state.key === 'not-connected';

      const shortSha = repo.latestSync?.headCommit
        ? repo.latestSync.headCommit.slice(0, 7)
        : repo.remoteHeadSha
          ? repo.remoteHeadSha.slice(0, 7)
          : null;

      return {
        ...repo,
        isSelected,
        state,
        findingsCount: findings.length,
        reportsCount: repoReports.length,
        localCommands,
        isCurrent,
        isAttention,
        isNotAnalyzed,
        shortSha,
      };
    });
  }, [repositories, selected, attention, reports]);

  // Counts for filter pills
  const counts = useMemo(() => {
    return {
      all: enrichedRepositories.length,
      current: enrichedRepositories.filter((r) => r.isCurrent).length,
      attention: enrichedRepositories.filter((r) => r.isAttention).length,
      notAnalyzed: enrichedRepositories.filter((r) => r.isNotAnalyzed).length,
    };
  }, [enrichedRepositories]);

  // Filtered repositories based on search query and category filter
  const filteredRepositories = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return enrichedRepositories.filter((repo) => {
      // Search filter
      if (
        normalized &&
        !repo.fullName.toLowerCase().includes(normalized) &&
        !(repo.defaultBranch && repo.defaultBranch.toLowerCase().includes(normalized)) &&
        !repo.state.label.toLowerCase().includes(normalized)
      ) {
        return false;
      }

      // Category filter
      if (activeFilter === 'current') return repo.isCurrent;
      if (activeFilter === 'attention') return repo.isAttention;
      if (activeFilter === 'not-analyzed') return repo.isNotAnalyzed;
      return true;
    });
  }, [enrichedRepositories, query, activeFilter]);

  function toggle(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setStatus('idle');
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('loading');
    try {
      const response = await fetch('/api/github/repositories', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ repositoryIds: Array.from(selected) }),
      });
      setStatus(response.ok ? 'saved' : 'error');
    } catch {
      setStatus('error');
    }
  }

  const primaryInstallation = installations[0];

  return (
    <div className="repositories-management" id="repositories-management">
      {/* 1. Page Header */}
      <header className="repositories-header">
        <div className="repositories-header__title-group">
          <span className="eyebrow">WORKSPACE REPOSITORIES</span>
          <h1>Repositories in this workspace</h1>
          <p className="repositories-header__lead">
            {repositories.length === 1
              ? '1 connected project in this workspace. TRACE maintains deterministic local records and sync history.'
              : `${repositories.length} connected projects in this workspace. TRACE maintains deterministic local records and sync history.`}
          </p>
        </div>

        <div className="repositories-header__meta-strip">
          {primaryInstallation ? (
            <div className="repositories-header__installation-tag">
              <span className="tag-label">GitHub Installation</span>
              <strong>{primaryInstallation.accountLogin}</strong>
              <small>Read-only access · {primaryInstallation.accountType}</small>
            </div>
          ) : null}

          <div className="repositories-header__actions">
            <button
              type="button"
              className={`trace-button ${showAccessForm ? 'trace-button--primary' : 'trace-button--secondary'}`}
              onClick={() => setShowAccessForm((prev) => !prev)}
              aria-expanded={showAccessForm}
              aria-controls="repositories-access-drawer"
            >
              {showAccessForm ? 'Close access panel' : 'Adjust access'}
            </button>
            <Link
              className="trace-button trace-button--secondary"
              href="/api/github/install?next=/app/repositories"
            >
              Connect GitHub ↗
            </Link>
          </div>
        </div>
      </header>

      {/* Setup notification banner (if redirected from GitHub connect) */}
      {setupMessage ? (
        <aside
          className={`repositories-notification ${setupStatus === 'connected' ? 'repositories-notification--success' : 'repositories-notification--info'}`}
          role="status"
        >
          <div className="repositories-notification__body">
            <span className="notification-glyph" aria-hidden="true">
              ℹ
            </span>
            <p>{setupMessage}</p>
          </div>
        </aside>
      ) : null}

      {/* 2. Access Management Drawer (collapsible) */}
      {showAccessForm ? (
        <section
          className="repositories-access-drawer"
          id="repositories-access-drawer"
          aria-label="Adjust repository access"
        >
          <div className="repositories-access-drawer__header">
            <div>
              <span className="eyebrow">ACCESS CONFIGURATION</span>
              <h2>Manage repository access</h2>
              <p>
                Select which repositories from{' '}
                <strong>{primaryInstallation?.accountLogin ?? 'GitHub'}</strong> TRACE should track
                in this workspace.
              </p>
            </div>
            <span className="access-selected-badge">{selected.size} active</span>
          </div>

          <form className="repositories-access-form" onSubmit={save}>
            <fieldset className="repositories-access-fieldset">
              <legend className="sr-only">Available repositories</legend>
              <div className="repositories-access-grid">
                {repositories.map((repo) => (
                  <label className="repositories-access-item" key={repo.id}>
                    <input
                      type="checkbox"
                      checked={selected.has(repo.id)}
                      onChange={() => toggle(repo.id)}
                    />
                    <div className="repositories-access-item__info">
                      <strong>{repo.fullName}</strong>
                      <small>
                        {repo.visibility ?? 'repository'} · {repo.defaultBranch ?? 'main'}
                      </small>
                    </div>
                    <span
                      className={`access-item-state ${selected.has(repo.id) ? 'is-active' : ''}`}
                    >
                      {selected.has(repo.id) ? 'Active' : 'Excluded'}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="repositories-access-actions">
              <button
                className="trace-button trace-button--primary"
                type="submit"
                disabled={status === 'loading'}
              >
                {status === 'loading' ? 'Saving access...' : 'Save repository access'}
              </button>
              <button
                className="trace-button trace-button--secondary"
                type="button"
                onClick={() => setShowAccessForm(false)}
              >
                Cancel
              </button>
              {status === 'saved' ? (
                <span className="access-save-feedback is-success">
                  ✓ Repository access saved successfully.
                </span>
              ) : null}
              {status === 'error' ? (
                <span className="access-save-feedback is-error" role="alert">
                  Failed to save selection. Please try again.
                </span>
              ) : null}
            </div>
          </form>
        </section>
      ) : null}

      {/* 3. Search and Category Filter Toolbar */}
      <section className="repositories-toolbar" aria-label="Search and filter repositories">
        <div className="repositories-search">
          <span className="repositories-search-icon" aria-hidden="true">
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="7" cy="7" r="5" />
              <path d="m11 11 3.5 3.5" />
            </svg>
          </span>
          <input
            id="repository-search-input"
            className="repositories-search-input"
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search repositories by name, branch, or status..."
            aria-label="Filter repositories"
          />
          {query ? (
            <button
              type="button"
              className="repositories-search-clear"
              onClick={() => setQuery('')}
              aria-label="Clear search"
            >
              ✕
            </button>
          ) : null}
        </div>

        <nav className="repositories-filter-nav" aria-label="Repository state filters">
          <button
            type="button"
            className="repositories-filter-button"
            data-active={activeFilter === 'all'}
            onClick={() => setActiveFilter('all')}
          >
            <span>All</span>
            <span className="filter-count-badge">{counts.all}</span>
          </button>
          <button
            type="button"
            className="repositories-filter-button"
            data-active={activeFilter === 'current'}
            onClick={() => setActiveFilter('current')}
          >
            <span>Current</span>
            <span className="filter-count-badge">{counts.current}</span>
          </button>
          <button
            type="button"
            className="repositories-filter-button"
            data-active={activeFilter === 'attention'}
            onClick={() => setActiveFilter('attention')}
          >
            <span>Attention</span>
            <span className="filter-count-badge">{counts.attention}</span>
          </button>
          <button
            type="button"
            className="repositories-filter-button"
            data-active={activeFilter === 'not-analyzed'}
            onClick={() => setActiveFilter('not-analyzed')}
          >
            <span>Not analyzed</span>
            <span className="filter-count-badge">{counts.notAnalyzed}</span>
          </button>
        </nav>
      </section>

      {/* 4. Structured Repository Table Collection */}
      <section className="repositories-collection" aria-label="Managed repositories list">
        {filteredRepositories.length === 0 ? (
          <div className="repositories-empty-state">
            <span className="empty-glyph" aria-hidden="true">
              ◌
            </span>
            <h3>No repositories match your filter</h3>
            <p>
              {query
                ? `No repositories found matching "${query}" with filter "${activeFilter}".`
                : `No repositories in the "${activeFilter}" category.`}
            </p>
            <div className="repositories-empty-state__actions">
              {query ? (
                <button
                  type="button"
                  className="trace-button trace-button--secondary"
                  onClick={() => setQuery('')}
                >
                  Clear search
                </button>
              ) : null}
              {activeFilter !== 'all' ? (
                <button
                  type="button"
                  className="trace-button trace-button--secondary"
                  onClick={() => setActiveFilter('all')}
                >
                  View all repositories
                </button>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="repositories-table-wrapper">
            <table className="repositories-table">
              <caption className="sr-only">
                List of managed repositories and their synchronization status
              </caption>
              <thead>
                <tr>
                  <th scope="col" className="col-identity">
                    Repository
                  </th>
                  <th scope="col" className="col-state">
                    Lifecycle State
                  </th>
                  <th scope="col" className="col-facts">
                    Findings & Reports
                  </th>
                  <th scope="col" className="col-sync">
                    Last Sync
                  </th>
                  <th scope="col" className="col-action">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRepositories.map((repo) => (
                  <tr className="repositories-row" key={repo.id}>
                    {/* Identity Column */}
                    <td className="col-identity">
                      <div className="repo-identity-cell">
                        <Link className="repo-identity-name" href={`/app/repositories/${repo.id}`}>
                          {repo.fullName}
                        </Link>
                        <div className="repo-identity-tags">
                          <span className="repo-branch-pill">
                            <svg
                              viewBox="0 0 14 14"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              aria-hidden="true"
                            >
                              <circle cx="4" cy="10" r="2" />
                              <circle cx="10" cy="4" r="2" />
                              <path d="M4 8V4c0-1.1.9-2 2-2h2" />
                            </svg>
                            {repo.defaultBranch ?? 'main'}
                          </span>
                          <span className="repo-visibility-pill">
                            {repo.visibility ?? 'private'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* State Column */}
                    <td className="col-state">
                      <div className="repo-state-cell">
                        <div className="repo-state-head">
                          <ProjectStatusGlyph stateKey={repo.state.key} />
                          <span className="repo-state-label">{repo.state.label}</span>
                        </div>
                        <p className="repo-state-description">{repo.state.description}</p>
                      </div>
                    </td>

                    {/* Facts Column: Findings & Reports */}
                    <td className="col-facts">
                      <div className="repo-facts-cell">
                        <div className="repo-fact-item">
                          <span className="fact-label">Findings</span>
                          <span
                            className={`fact-value-badge ${repo.findingsCount > 0 ? 'is-highlight' : ''}`}
                          >
                            {repo.findingsCount}
                          </span>
                        </div>
                        <div className="repo-fact-item">
                          <span className="fact-label">Reports</span>
                          <span className="fact-value-badge">{repo.reportsCount}</span>
                        </div>
                      </div>
                    </td>

                    {/* Sync Column */}
                    <td className="col-sync">
                      <div className="repo-sync-cell">
                        <span className="sync-time">
                          {formatRelativeDate(repo.lastSynchronizedAt)}
                        </span>
                        {repo.shortSha ? (
                          <span className="sync-sha">
                            <code>{repo.shortSha}</code>
                          </span>
                        ) : (
                          <span className="sync-sha-none">No sync commit</span>
                        )}
                      </div>
                    </td>

                    {/* Action Column */}
                    <td className="col-action">
                      <div className="repo-action-cell">
                        {repo.state.actionKind === 'local' ? (
                          <LocalActionPanel
                            repositoryName={repo.fullName}
                            title={repo.state.actionLabel ?? 'Update TRACE intelligence'}
                            description={repo.state.description}
                            commands={repo.localCommands}
                            triggerLabel={repo.state.actionLabel ?? 'Update TRACE'}
                          />
                        ) : null}
                        <Link
                          className="trace-button trace-button--secondary repo-open-btn"
                          href={`/app/repositories/${repo.id}`}
                        >
                          Open project
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 5. GitHub Installation & Security Context (Secondary Card) */}
      {primaryInstallation ? (
        <section
          className="repositories-installation-card"
          aria-labelledby="installation-card-title"
        >
          <div className="installation-card__header">
            <div className="installation-card__identity">
              <span className="eyebrow">GITHUB APP INTEGRATION</span>
              <h2 id="installation-card-title">GitHub account & access control</h2>
              <p>
                TRACE connects to GitHub as an official GitHub App with strict read-only permissions.
                Source code remains on your machine; only metadata, pull request summaries, and issue
                context are inspected.
              </p>
            </div>

            <div className="installation-card__meta">
              <div className="meta-pair">
                <span className="meta-pair__label">Account</span>
                <span className="meta-pair__value">{primaryInstallation.accountLogin}</span>
              </div>
              <div className="meta-pair">
                <span className="meta-pair__label">Type</span>
                <span className="meta-pair__value">{primaryInstallation.accountType}</span>
              </div>
              <div className="meta-pair">
                <span className="meta-pair__label">Status</span>
                <span className="meta-pair__value">Active (Read-only)</span>
              </div>
            </div>
          </div>

          <div className="installation-card__footer">
            <button
              type="button"
              className="text-action-link"
              onClick={() => {
                setShowAccessForm(true);
                const el = document.getElementById('repositories-access-drawer');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Adjust repository selection ↑
            </button>
            <Link
              className="text-action-link"
              href="/api/github/install?next=/app/repositories"
            >
              Configure GitHub App permissions ↗
            </Link>
          </div>
        </section>
      ) : null}
    </div>
  );
}
