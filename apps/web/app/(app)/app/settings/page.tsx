import { getAuthenticatedDashboardSummary } from '../../../../lib/dashboard-server';
import { eq } from 'drizzle-orm';
import { schema } from '@trace/db';
import { createRequestDatabase } from '../../../../lib/request-database';
import { isMockModeEnabled, mockDataProvider, MOCK_PRIMARY_USER } from '../../../../lib/mock';
import { SettingsView, type DeviceItem } from '../_components/settings-view';

export default async function SettingsPage() {
  const { summary, session } = await getAuthenticatedDashboardSummary();
  let devices: DeviceItem[] = [];
  const isMock = isMockModeEnabled() || session.user.id === MOCK_PRIMARY_USER.id;

  if (isMock) {
    devices = mockDataProvider.getDevices().map((dev) => ({
      id: dev.id,
      organizationId: dev.organizationId,
      userId: dev.userId,
      label: dev.label,
      scopes: dev.scopes,
      expiresAt: dev.expiresAt,
      lastUsedAt: dev.lastUsedAt,
      createdAt: dev.createdAt,
      updatedAt: dev.updatedAt,
      revokedAt: dev.revokedAt,
    }));
  } else {
    try {
      const { db, client } = await createRequestDatabase();
      const rows = await db
        .select()
        .from(schema.cliConnections)
        .where(eq(schema.cliConnections.userId, session.user.id))
        .orderBy(schema.cliConnections.createdAt)
        .finally(async () => client.end().catch(() => {}));

      devices = (rows || []).map((r) => ({
        id: r.id,
        organizationId: r.organizationId,
        userId: r.userId,
        label: r.label,
        scopes: ['discovery:read', 'artifact:sync'],
        expiresAt: r.expiresAt ? r.expiresAt.toISOString() : null,
        lastUsedAt: r.lastUsedAt ? r.lastUsedAt.toISOString() : null,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
        revokedAt: r.revokedAt ? r.revokedAt.toISOString() : null,
      }));
    } catch (error) {
      console.warn('[TRACE] Error loading CLI connections from database:', error);
      devices = mockDataProvider.getDevices().map((dev) => ({
        id: dev.id,
        organizationId: dev.organizationId,
        userId: dev.userId,
        label: dev.label,
        scopes: dev.scopes,
        expiresAt: dev.expiresAt,
        lastUsedAt: dev.lastUsedAt,
        createdAt: dev.createdAt,
        updatedAt: dev.updatedAt,
        revokedAt: dev.revokedAt,
      }));
    }
  }

  return <SettingsView summary={summary} session={session} devices={devices} />;
}


