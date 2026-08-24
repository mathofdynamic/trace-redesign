'use client';

import { useId, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { DashboardSummary } from '../../../../lib/dashboard';
import type { TraceSession } from '@trace/auth';
import { formatDate, formatRelativeDate } from '../../../../lib/dashboard-state';

export type DeviceItem = {
  id: string;
  organizationId: string;
  userId: string;
  label: string;
  scopes?: string[];
  expiresAt: string | null;
  lastUsedAt: string | null;
  createdAt: string;
  updatedAt: string;
  revokedAt: string | null;
};

export type SettingsViewProps = {
  summary: DashboardSummary;
  session: TraceSession;
  devices: DeviceItem[];
};

export function SettingsView({ summary, session, devices: initialDevices }: SettingsViewProps) {
  const router = useRouter();
  const searchInputId = useId();
  const [deviceList, setDeviceList] = useState<DeviceItem[]>(initialDevices);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  // Sync state if props change
  useEffect(() => {
    setDeviceList(initialDevices);
  }, [initialDevices]);

  // Rename modal state
  const [renameTarget, setRenameTarget] = useState<DeviceItem | null>(null);
  const [renameInput, setRenameInput] = useState('');
  const [renamePending, setRenamePending] = useState(false);
  const [renameError, setRenameError] = useState<string | null>(null);

  // Revoke modal state
  const [revokeTarget, setRevokeTarget] = useState<DeviceItem | null>(null);
  const [revokePending, setRevokePending] = useState(false);
  const [revokeError, setRevokeError] = useState<string | null>(null);

  // Filter revoked vs active
  const activeDevices = deviceList.filter((d) => !d.revokedAt);
  const revokedDevices = deviceList.filter((d) => Boolean(d.revokedAt));

  function handleCopy(text: string, id: string) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
      setCopiedCmd(id);
      setTimeout(() => setCopiedCmd(null), 2000);
    }
  }

  function openRenameModal(device: DeviceItem) {
    setRenameTarget(device);
    setRenameInput(device.label);
    setRenameError(null);
  }

  function closeRenameModal() {
    if (renamePending) return;
    setRenameTarget(null);
    setRenameInput('');
    setRenameError(null);
  }

  async function handleRenameSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!renameTarget) return;
    const trimmed = renameInput.trim();
    if (!trimmed || trimmed === renameTarget.label) {
      closeRenameModal();
      return;
    }

    setRenamePending(true);
    setRenameError(null);

    try {
      const res = await fetch(`/api/cli/connections/${renameTarget.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ label: trimmed }),
      });

      if (!res.ok) {
        setRenameError('Could not rename this device connection.');
        setRenamePending(false);
        return;
      }

      // Optimistic local update
      setDeviceList((prev) =>
        prev.map((d) =>
          d.id === renameTarget.id
            ? { ...d, label: trimmed, updatedAt: new Date().toISOString() }
            : d,
        ),
      );
      setRenamePending(false);
      setRenameTarget(null);
      router.refresh();
    } catch {
      setRenameError('An unexpected network error occurred.');
      setRenamePending(false);
    }
  }

  function openRevokeModal(device: DeviceItem) {
    setRevokeTarget(device);
    setRevokeError(null);
  }

  function closeRevokeModal() {
    if (revokePending) return;
    setRevokeTarget(null);
    setRevokeError(null);
  }

  async function handleRevokeConfirm() {
    if (!revokeTarget) return;
    setRevokePending(true);
    setRevokeError(null);

    try {
      const res = await fetch(`/api/cli/connections/${revokeTarget.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        setRevokeError('Could not revoke this device authorization.');
        setRevokePending(false);
        return;
      }

      // Optimistic local update
      const nowIso = new Date().toISOString();
      setDeviceList((prev) =>
        prev.map((d) =>
          d.id === revokeTarget.id
            ? { ...d, revokedAt: nowIso, updatedAt: nowIso }
            : d,
        ),
      );
      setRevokePending(false);
      setRevokeTarget(null);
      router.refresh();
    } catch {
      setRevokeError('An unexpected network error occurred.');
      setRevokePending(false);
    }
  }

  const userName = session.user.name || 'Mohammad Mohammadi';
  const userEmail = session.user.email || 'mohammad@northstar.engineering';
  const githubHandle = (session.user as { githubLogin?: string }).githubLogin || 'mohammadm';

  return (
    <div className="space-y-8 pb-16">
      {/* Header & Context Bar */}
      <div className="border-b border-zinc-800/80 pb-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-semibold tracking-wider text-zinc-400 uppercase font-mono">
                Workspace Settings
              </span>
              <span className="text-zinc-600">·</span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-900 text-zinc-300 border border-zinc-800">
                <svg className="w-3 h-3 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                Zero-Knowledge Boundary
              </span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Workspace & Trust Boundaries
            </h1>
            <p className="mt-1.5 text-sm text-zinc-400 max-w-3xl leading-relaxed">
              Understand connected repositories, review local-to-cloud synchronization boundaries, manage authorized developer computers, and inspect CLI execution invariants.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono bg-zinc-900 border border-zinc-800 text-zinc-300">
              <span className="w-2 h-2 rounded-full bg-[#0066ff]" />
              {activeDevices.length} Authorized Computer{activeDevices.length === 1 ? '' : 's'}
            </span>
          </div>
        </div>

        {/* Quick Jump Navigation */}
        <div className="mt-6 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-zinc-500 font-mono text-[11px] mr-1">Section Jump:</span>
          <a
            href="#workspace-github"
            className="px-2.5 py-1 rounded bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors"
          >
            Workspace & GitHub
          </a>
          <a
            href="#authorized-computers"
            className="px-2.5 py-1 rounded bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors"
          >
            Authorized Computers ({activeDevices.length})
          </a>
          <a
            href="#privacy-sync"
            className="px-2.5 py-1 rounded bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors"
          >
            Privacy & Boundary
          </a>
          <a
            href="#cli-workflow"
            className="px-2.5 py-1 rounded bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors"
          >
            Local CLI Workflow
          </a>
          <a
            href="#account"
            className="px-2.5 py-1 rounded bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors"
          >
            Account Identity
          </a>
        </div>
      </div>

      {/* Section 1: Workspace + GitHub Connection */}
      <section id="workspace-github" className="space-y-4" aria-labelledby="workspace-github-heading">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold tracking-wider text-zinc-400 uppercase font-mono">
              Identity & Integration
            </span>
            <h2 id="workspace-github-heading" className="text-lg font-medium text-white tracking-tight">
              Workspace & Source Control Integration
            </h2>
          </div>
          <span className="text-xs text-zinc-500 font-mono">
            ws-northstar-001
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Workspace Panel */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center text-white font-mono text-sm font-semibold">
                  N
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white tracking-tight">
                    {summary.workspace.name}
                  </h3>
                  <p className="text-xs text-zinc-400 font-mono">
                    org_id: ws-northstar-001
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                {summary.workspace.intendedUsage ?? 'Team'}
              </span>
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-3.5 gap-x-4 text-xs">
              <div>
                <dt className="text-zinc-500 font-medium">Current User</dt>
                <dd className="mt-0.5 text-zinc-200 font-medium">
                  {userName} <span className="text-zinc-400 font-normal">(Engineering Lead)</span>
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500 font-medium">Team Composition</dt>
                <dd className="mt-0.5 text-zinc-200 font-medium">
                  9 team members
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500 font-medium">Execution Mode</dt>
                <dd className="mt-0.5 text-zinc-200 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0066ff]" />
                  {summary.workspace.executionMode ?? 'Local TRACE'}
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500 font-medium">Connected Repositories</dt>
                <dd className="mt-0.5 text-zinc-200 font-medium">
                  {summary.repositories.length} repositories selected
                </dd>
              </div>
            </dl>
          </div>

          {/* GitHub Connection Panel */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center text-zinc-200">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white tracking-tight">
                    GitHub App Installation
                  </h3>
                  <p className="text-xs text-zinc-400 font-mono">
                    Northstar Engineering
                  </p>
                </div>
              </div>
              {/* Connected Badge: Check glyph + text, NO GREEN! Neutral/white with subtle border */}
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-medium bg-zinc-800 text-zinc-100 border border-zinc-700">
                <svg className="w-3.5 h-3.5 text-zinc-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Connected
              </span>
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-3.5 gap-x-4 text-xs">
              <div>
                <dt className="text-zinc-500 font-medium">Permission Scope</dt>
                <dd className="mt-0.5 text-zinc-200">
                  Read-only (Metadata, PRs, Commits)
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500 font-medium">Last Verification</dt>
                <dd className="mt-0.5 text-zinc-200">
                  Aug 19, 2026, 10:45 AM
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500 font-medium">Default Branch</dt>
                <dd className="mt-0.5 text-zinc-200 font-mono">
                  main
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500 font-medium">Webhook Security</dt>
                <dd className="mt-0.5 text-zinc-200 font-mono text-[11px]">
                  HMAC-SHA256 Signed
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* Section 2: Authorized Computers */}
      <section id="authorized-computers" className="space-y-4" aria-labelledby="authorized-computers-heading">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-zinc-800/60 pb-3">
          <div>
            <span className="text-[11px] font-semibold tracking-wider text-zinc-400 uppercase font-mono">
              Local CLI Authorization
            </span>
            <h2 id="authorized-computers-heading" className="text-lg font-medium text-white tracking-tight">
              Authorized Computers
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded text-xs font-mono bg-zinc-900 border border-zinc-800 text-zinc-300">
              {activeDevices.length} active · {revokedDevices.length} revoked
            </span>
          </div>
        </div>

        <p className="text-sm text-zinc-400 leading-relaxed max-w-4xl">
          These computers are authorized to compile local AST changes and send approved TRACE projection records to this workspace. Token digests are stored as one-way hashes on the server and never include your browser session credentials.
        </p>

        {/* Active Devices List */}
        {activeDevices.length > 0 ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 overflow-hidden divide-y divide-zinc-800/70">
            {activeDevices.map((device, idx) => {
              const isMacBook = device.label.toLowerCase().includes('macbook');
              const isCurrentDevice = idx === 0;

              return (
                <div
                  key={device.id}
                  className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:bg-zinc-900/70 transition-colors"
                >
                  <div className="space-y-2 min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-zinc-300 shrink-0">
                        {isMacBook ? (
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="2" y="4" width="20" height="12" rx="2" />
                            <path d="M6 20h12" />
                            <line x1="12" y1="16" x2="12" y2="20" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="2" y="3" width="20" height="14" rx="2" />
                            <line x1="8" y1="21" x2="16" y2="21" />
                            <line x1="12" y1="17" x2="12" y2="21" />
                          </svg>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white text-sm tracking-tight truncate">
                            {device.label}
                          </span>
                          {isCurrentDevice ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium font-mono bg-zinc-800 text-zinc-300 border border-zinc-700">
                              Current Device
                            </span>
                          ) : null}
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-800/80 text-zinc-300 border border-zinc-700/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                            Active
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 font-mono mt-0.5">
                          ID: {device.id} · Org: {device.organizationId}
                        </p>
                      </div>
                    </div>

                    {/* Metadata items */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-zinc-400 pt-1">
                      <span>
                        <span className="text-zinc-500">Authorized:</span>{' '}
                        {formatDate(device.createdAt)}
                      </span>
                      <span>·</span>
                      <span>
                        <span className="text-zinc-500">Last used:</span>{' '}
                        <strong className="text-zinc-300 font-medium">
                          {device.lastUsedAt ? formatRelativeDate(device.lastUsedAt) : 'Never'}
                        </strong>
                      </span>
                      <span>·</span>
                      <span>
                        <span className="text-zinc-500">Expires:</span>{' '}
                        {device.expiresAt ? formatDate(device.expiresAt) : 'Never'}
                      </span>
                    </div>

                    {/* Scopes badge list */}
                    {device.scopes && device.scopes.length > 0 ? (
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        <span className="text-[10px] uppercase font-mono text-zinc-500 tracking-wider">Scopes:</span>
                        {device.scopes.map((scope) => (
                          <span
                            key={scope}
                            className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-950 text-zinc-400 border border-zinc-800"
                          >
                            {scope}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-start md:self-center pt-2 md:pt-0">
                    <button
                      type="button"
                      onClick={() => openRenameModal(device)}
                      className="px-3 py-1.5 rounded-md text-xs font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 hover:text-white border border-zinc-700/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066ff]"
                    >
                      Rename
                    </button>
                    <button
                      type="button"
                      onClick={() => openRevokeModal(device)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-zinc-300 bg-transparent hover:bg-zinc-800/80 hover:text-white border border-zinc-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                    >
                      <svg className="w-3.5 h-3.5 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                      </svg>
                      Revoke
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 p-8 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-white">No active authorized computers</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Run <code className="text-zinc-200 bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800">trace login</code> in your local terminal to authorize this machine.
            </p>
          </div>
        )}

        {/* Revoked Devices Accordion/Section */}
        {revokedDevices.length > 0 ? (
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/20 overflow-hidden">
            <details className="group">
              <summary className="px-5 py-3.5 cursor-pointer flex items-center justify-between text-xs font-medium text-zinc-400 hover:text-zinc-200 select-none">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-zinc-600" />
                  <span>Revoked Computers ({revokedDevices.length})</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-500 group-open:rotate-180 transition-transform">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </summary>
              <div className="border-t border-zinc-800/60 divide-y divide-zinc-800/60">
                {revokedDevices.map((device) => (
                  <div
                    key={device.id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 opacity-60 hover:opacity-85 transition-opacity"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <strong className="text-sm font-medium text-zinc-300 line-through">
                          {device.label}
                        </strong>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-900 text-zinc-400 border border-zinc-800">
                          Revoked
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 font-mono">
                        Revoked {device.revokedAt ? formatDate(device.revokedAt) : 'recently'} · Future synchronization blocked · Historical records preserved
                      </p>
                    </div>
                    <span className="text-[11px] font-mono text-zinc-500 shrink-0">
                      Last used: {device.lastUsedAt ? formatDate(device.lastUsedAt) : 'Never'}
                    </span>
                  </div>
                ))}
              </div>
            </details>
          </div>
        ) : null}
      </section>

      {/* Section 3: Privacy & Synchronization (High-Trust Boundary Matrix) */}
      <section id="privacy-sync" className="space-y-4" aria-labelledby="privacy-sync-heading">
        <div className="border-b border-zinc-800/60 pb-3">
          <span className="text-[11px] font-semibold tracking-wider text-zinc-400 uppercase font-mono">
            Trust & Data Architecture
          </span>
          <h2 id="privacy-sync-heading" className="text-lg font-medium text-white tracking-tight">
            Privacy & Synchronization Trust Boundary
          </h2>
          <p className="mt-1 text-sm text-zinc-400 max-w-3xl leading-relaxed">
            TRACE enforces an air-gapped local AST architecture. Full source code, inline snippets, and developer credentials never leave your workstation.
          </p>
        </div>

        {/* Two-Column Comparison Matrix: Sent vs Never Sent */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Column 1: Synchronized Records */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-zinc-200">
                  <svg className="w-3.5 h-3.5 text-zinc-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-white tracking-tight">
                  Synchronized to Workspace
                </h3>
              </div>
              <span className="text-[11px] font-mono text-zinc-400 px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700/60">
                Approved Projections
              </span>
            </div>

            <ul className="space-y-3 text-xs text-zinc-300">
              <li className="flex items-start gap-2.5">
                <span className="w-4 h-4 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                  ✓
                </span>
                <div>
                  <strong className="text-white font-medium">Approved .trace Projections:</strong>
                  <p className="text-zinc-400 mt-0.5">Manifest manifests, checksum digests, and change metadata generated by the local CLI engine.</p>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-4 h-4 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                  ✓
                </span>
                <div>
                  <strong className="text-white font-medium">Governance Rule Checks:</strong>
                  <p className="text-zinc-400 mt-0.5">Automated policy checks, severity invariants, and AST pattern match results.</p>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-4 h-4 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                  ✓
                </span>
                <div>
                  <strong className="text-white font-medium">Architecture Decisions (ADRs):</strong>
                  <p className="text-zinc-400 mt-0.5">Structured architectural decision records, rationale statements, and evaluation records.</p>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-4 h-4 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                  ✓
                </span>
                <div>
                  <strong className="text-white font-medium">Cryptographic Hashes & Git Metadata:</strong>
                  <p className="text-zinc-400 mt-0.5">Commit SHAs, branch names, timestamp provenance, and payload verification signatures.</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Column 2: Strictly Excluded */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-zinc-300">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-white tracking-tight">
                  Never Sent (Excluded by Design)
                </h3>
              </div>
              <span className="text-[11px] font-mono text-zinc-400 px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700/60">
                Workstation Retained
              </span>
            </div>

            <ul className="space-y-3 text-xs text-zinc-300">
              <li className="flex items-start gap-2.5">
                <span className="w-4 h-4 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                  ✕
                </span>
                <div>
                  <strong className="text-white font-medium">Repository Source Files:</strong>
                  <p className="text-zinc-400 mt-0.5">Raw code never leaves your local file system. Remote cloud compilation of raw files is prohibited.</p>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-4 h-4 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                  ✕
                </span>
                <div>
                  <strong className="text-white font-medium">Inline Code Snippets & Private ASTs:</strong>
                  <p className="text-zinc-400 mt-0.5">AST construction and symbol resolution execute purely in-memory on your local CPU.</p>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-4 h-4 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                  ✕
                </span>
                <div>
                  <strong className="text-white font-medium">Secrets, Env Files & Private Keys:</strong>
                  <p className="text-zinc-400 mt-0.5">Files matching `.env*`, `.pem`, `.key`, or credentials patterns are ignored before packaging.</p>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-4 h-4 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                  ✕
                </span>
                <div>
                  <strong className="text-white font-medium">Developer Velocity & Surveillance Metrics:</strong>
                  <p className="text-zinc-400 mt-0.5">No individual developer ranking, keystroke tracking, or personal surveillance telemetry is ever generated.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Security & Verification Guarantee Bar */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 shrink-0">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <div>
              <strong className="text-white font-medium">Pre-Flight Review Guarantee</strong>
              <p className="text-zinc-400">
                Run <code className="text-zinc-200 font-mono bg-zinc-900 px-1 py-0.5 rounded border border-zinc-800">trace sync --dry-run</code> to audit every byte before synchronizing.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleCopy('trace sync --dry-run', 'dry-run-guarantee')}
            className="px-3 py-1.5 rounded-md text-xs font-mono text-zinc-300 bg-zinc-900 hover:bg-zinc-800 hover:text-white border border-zinc-800 transition-colors shrink-0 flex items-center gap-1.5 self-start sm:self-auto"
          >
            {copiedCmd === 'dry-run-guarantee' ? 'Copied Dry-Run Command' : 'Copy dry-run command'}
          </button>
        </div>
      </section>

      {/* Section 4: Local CLI Workflow */}
      <section id="cli-workflow" className="space-y-4" aria-labelledby="cli-workflow-heading">
        <div className="border-b border-zinc-800/60 pb-3">
          <span className="text-[11px] font-semibold tracking-wider text-zinc-400 uppercase font-mono">
            Developer Operations
          </span>
          <h2 id="cli-workflow-heading" className="text-lg font-medium text-white tracking-tight">
            Local CLI Execution Workflow
          </h2>
          <p className="mt-1 text-sm text-zinc-400 max-w-3xl leading-relaxed">
            Browser sessions do not execute repository analysis or touch local file systems. Run the TRACE CLI in your local terminal to parse AST boundaries and synchronize approved records.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Step 1: Analyze */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-200 font-mono text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
                  AST Parser
                </span>
              </div>
              <h3 className="text-sm font-semibold text-white">
                Run Local Analysis
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Parses repository AST, checks architectural invariants, and compiles the local projection.
              </p>
            </div>

            <div className="pt-2">
              <div className="flex items-center justify-between rounded-lg bg-zinc-950 border border-zinc-800 p-2.5 font-mono text-xs text-zinc-200">
                <code>trace analyze</code>
                <button
                  type="button"
                  onClick={() => handleCopy('trace analyze', 'step-1')}
                  className="p-1 rounded text-zinc-400 hover:text-white transition-colors"
                  aria-label="Copy trace analyze command"
                >
                  {copiedCmd === 'step-1' ? (
                    <span className="text-[10px] text-zinc-300">Copied</span>
                  ) : (
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Step 2: Dry Run */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-200 font-mono text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
                  Pre-Flight
                </span>
              </div>
              <h3 className="text-sm font-semibold text-white">
                Inspect Manifest Payload
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Dry-run prints the exact metadata manifest and SHA checksums that will be transmitted.
              </p>
            </div>

            <div className="pt-2">
              <div className="flex items-center justify-between rounded-lg bg-zinc-950 border border-zinc-800 p-2.5 font-mono text-xs text-zinc-200">
                <code>trace sync --dry-run</code>
                <button
                  type="button"
                  onClick={() => handleCopy('trace sync --dry-run', 'step-2')}
                  className="p-1 rounded text-zinc-400 hover:text-white transition-colors"
                  aria-label="Copy trace sync dry run command"
                >
                  {copiedCmd === 'step-2' ? (
                    <span className="text-[10px] text-zinc-300">Copied</span>
                  ) : (
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Step 3: Synchronize */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-200 font-mono text-xs font-bold flex items-center justify-center">
                  3
                </span>
                <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
                  Sync
                </span>
              </div>
              <h3 className="text-sm font-semibold text-white">
                Synchronize Records
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Signs and synchronizes approved project memory to your central workspace ledger.
              </p>
            </div>

            <div className="pt-2">
              <div className="flex items-center justify-between rounded-lg bg-zinc-950 border border-zinc-800 p-2.5 font-mono text-xs text-zinc-200">
                <code>trace sync</code>
                <button
                  type="button"
                  onClick={() => handleCopy('trace sync', 'step-3')}
                  className="p-1 rounded text-zinc-400 hover:text-white transition-colors"
                  aria-label="Copy trace sync command"
                >
                  {copiedCmd === 'step-3' ? (
                    <span className="text-[10px] text-zinc-300">Copied</span>
                  ) : (
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Account */}
      <section id="account" className="space-y-4" aria-labelledby="account-heading">
        <div className="border-b border-zinc-800/60 pb-3">
          <span className="text-[11px] font-semibold tracking-wider text-zinc-400 uppercase font-mono">
            Identity & Session
          </span>
          <h2 id="account-heading" className="text-lg font-medium text-white tracking-tight">
            Account Details
          </h2>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-white font-semibold font-mono text-base">
                MM
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-white tracking-tight">
                    {userName}
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                    Engineering Lead
                  </span>
                </div>
                <p className="text-xs text-zinc-400 font-mono">
                  {userEmail} · @{githubHandle}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800/80">
              <a
                href="/api/auth/sign-out"
                className="px-4 py-2 rounded-md text-xs font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 hover:text-white border border-zinc-700/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066ff]"
              >
                Sign out
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Rename Modal */}
      {renameTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div
            className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-6 space-y-4 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="rename-dialog-title"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 id="rename-dialog-title" className="text-base font-semibold text-white">
                Rename Authorized Computer
              </h3>
              <button
                type="button"
                onClick={closeRenameModal}
                disabled={renamePending}
                className="text-zinc-400 hover:text-white p-1"
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRenameSubmit} className="space-y-4">
              <div>
                <label htmlFor="device-label-input" className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Computer Label
                </label>
                <input
                  id="device-label-input"
                  type="text"
                  value={renameInput}
                  onChange={(e) => setRenameInput(e.target.value)}
                  disabled={renamePending}
                  maxLength={80}
                  className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-[#0066ff] focus:outline-none"
                  autoFocus
                />
                <p className="text-[11px] text-zinc-500 mt-1 font-mono">
                  Device ID: {renameTarget.id}
                </p>
              </div>

              {renameError ? (
                <p className="text-xs text-zinc-300 bg-zinc-950 p-2 rounded border border-zinc-800">
                  {renameError}
                </p>
              ) : null}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={closeRenameModal}
                  disabled={renamePending}
                  className="px-3.5 py-1.5 rounded-md text-xs font-medium text-zinc-400 hover:text-white bg-transparent border border-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={renamePending || !renameInput.trim()}
                  className="px-3.5 py-1.5 rounded-md text-xs font-medium text-white bg-[#0066ff] hover:bg-[#0052cc] transition-colors disabled:opacity-50"
                >
                  {renamePending ? 'Saving...' : 'Save Label'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* Revoke Modal */}
      {revokeTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div
            className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-6 space-y-4 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="revoke-dialog-title"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                  </svg>
                </div>
                <h3 id="revoke-dialog-title" className="text-base font-semibold text-white">
                  Revoke Computer Authorization
                </h3>
              </div>
              <button
                type="button"
                onClick={closeRevokeModal}
                disabled={revokePending}
                className="text-zinc-400 hover:text-white p-1"
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-zinc-300">
              <p className="leading-relaxed">
                Are you sure you want to revoke authorization for <strong className="text-white">“{revokeTarget.label}”</strong>?
              </p>
              <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800/80 space-y-2 text-zinc-400">
                <p>
                  • Future local synchronization from this computer will stop immediately.
                </p>
                <p>
                  • Historical project records, AST metrics, and architectural decisions will remain preserved in workspace memory.
                </p>
              </div>
            </div>

            {revokeError ? (
              <p className="text-xs text-zinc-300 bg-zinc-950 p-2 rounded border border-zinc-800">
                {revokeError}
              </p>
            ) : null}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={closeRevokeModal}
                disabled={revokePending}
                className="px-3.5 py-1.5 rounded-md text-xs font-medium text-zinc-400 hover:text-white bg-transparent border border-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRevokeConfirm}
                disabled={revokePending}
                className="px-3.5 py-1.5 rounded-md text-xs font-medium text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-500 transition-colors disabled:opacity-50"
              >
                {revokePending ? 'Revoking...' : 'Revoke Authorization'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
