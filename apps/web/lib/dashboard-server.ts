import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getTraceSession, type TraceSession } from '@trace/auth';
import { createRequestDatabase } from './request-database';
import { getDashboardSummary, type DashboardSummary } from './dashboard';
import {
  getActiveMockScenario,
  isMockModeEnabled,
  mockDataProvider,
} from './mock';

export type AuthenticatedDashboardResult = {
  session: TraceSession;
  summary: DashboardSummary;
  dataMode: 'mock' | 'real';
};

export async function getAuthenticatedDashboardSummary(): Promise<AuthenticatedDashboardResult> {
  const session = await getTraceSession(await headers());

  if (isMockModeEnabled()) {
    const effectiveSession = session ?? mockDataProvider.getSession();
    return {
      session: effectiveSession,
      summary: mockDataProvider.getDashboardSummary(getActiveMockScenario()),
      dataMode: 'mock',
    };
  }

  if (!session?.user) redirect('/sign-in?next=/app');
  const { db, client } = await createRequestDatabase();
  try {
    const summary = await getDashboardSummary(db, session.user.id);
    return {
      session,
      summary,
      dataMode: 'real',
    };
  } finally {
    await client.end().catch(() => {});
  }
}

