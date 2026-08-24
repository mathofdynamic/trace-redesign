import { describe, expect, it } from 'vitest';
import { mockDataProvider } from '../mock/adapter';
import { MOCK_CLI_DEVICES } from '../mock/devices';

describe('Phase 22: Settings & Trust Boundaries Surface (/app/settings)', () => {
  it('preserves all 4 CLI devices in the frozen mock universe with accurate states', () => {
    expect(MOCK_CLI_DEVICES).toHaveLength(4);

    const devices = mockDataProvider.getDevices();
    expect(devices).toHaveLength(4);

    const active = devices.filter((d) => !d.revokedAt);
    const revoked = devices.filter((d) => Boolean(d.revokedAt));

    expect(active).toHaveLength(3);
    expect(revoked).toHaveLength(1);

    // Active devices
    expect(active.map((d) => d.label)).toEqual([
      "Mohammad's MacBook Pro",
      'Studio Workstation',
      'Office Desktop',
    ]);

    // Revoked device
    expect(revoked[0]?.label).toBe('Old Laptop');
    expect(revoked[0]?.revokedAt).toBe('2026-08-10T12:00:00.000Z');
  });

  it('verifies device metadata and scopes integrity', () => {
    const macbook = MOCK_CLI_DEVICES.find((d) => d.id === 'cli-dev-001')!;
    expect(macbook).toBeDefined();
    expect(macbook.organizationId).toBe('ws-northstar-001');
    expect(macbook.scopes).toEqual(['discovery:read', 'artifact:sync']);
    expect(macbook.lastUsedAt).toBe('2026-08-19T10:45:00.000Z');
    expect(macbook.expiresAt).toBe('2026-11-01T08:00:00.000Z');

    const studio = MOCK_CLI_DEVICES.find((d) => d.id === 'cli-dev-002')!;
    expect(studio.scopes).toEqual(['discovery:read', 'artifact:sync']);
    expect(studio.lastUsedAt).toBe('2026-08-18T16:20:00.000Z');

    const office = MOCK_CLI_DEVICES.find((d) => d.id === 'cli-dev-003')!;
    expect(office.scopes).toEqual(['discovery:read', 'artifact:sync']);
    expect(office.lastUsedAt).toBe('2026-08-12T09:00:00.000Z');
  });

  it('guarantees token secrets and raw hashes are never exposed in browser summary payloads', () => {
    const summary = mockDataProvider.getDashboardSummary();
    const summaryStr = JSON.stringify(summary);

    for (const dev of MOCK_CLI_DEVICES) {
      expect(summaryStr).not.toContain(dev.tokenHash);
    }
  });

  it('enforces anti-surveillance privacy guarantees across workspace settings', () => {
    const universe = mockDataProvider.getUniverse();
    expect(universe.workspace.name).toBe('Northstar Engineering');
    expect(universe.workspace.executionMode).toBe('Local TRACE');

    const summary = mockDataProvider.getDashboardSummary();
    expect(summary.setup.localAnalysisAvailable).toBe(true);
    expect(summary.setup.cloudAnalysisAvailable).toBe(false);
  });

  it('preserves user and team identity in settings session context', () => {
    const session = mockDataProvider.getSession();
    expect(session.user.name).toBe('Mohammad Mohammadi');
    expect(session.user.email).toBe('mohammad@northstar.engineering');
    expect(session.user.githubLogin).toBe('mohammadm');
  });
});
