import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getTraceSession } from '@trace/auth';
import { createRequestDatabase } from './request-database';
import { getDashboardSummary } from './dashboard';
import {
  getActiveMockScenario,
  isMockModeEnabled,
  mockDataProvider,
} from './mock';

export async function getAuthenticatedDashboardSummary() {
  const session = await getTraceSession(await headers());

  if (isMockModeEnabled()) {
    const effectiveSession = session ?? mockDataProvider.getSession();
    return {
      session: effectiveSession,
      summary: mockDataProvider.getDashboardSummary(getActiveMockScenario()),
    };
  }

  if (!session?.user) redirect('/sign-in?next=/app');
  try {
    const { db, client } = await createRequestDatabase();
    try {
      return {
        session,
        summary: await getDashboardSummary(db, session.user.id),
      };
    } finally {
      await client.end().catch(() => {});
    }
  } catch (error) {
    console.warn('[TRACE] Database unavailable, using mock data provider summary fallback:', error);
    return {
      session,
      summary: mockDataProvider.getDashboardSummary(getActiveMockScenario()),
    };
  }
}
