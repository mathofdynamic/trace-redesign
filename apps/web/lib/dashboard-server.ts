import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getTraceSession } from '@trace/auth';
import { createRequestDatabase } from './request-database';
import { getDashboardSummary, getFallbackDashboardSummary } from './dashboard';

export async function getAuthenticatedDashboardSummary() {
  const session = await getTraceSession(await headers());
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
    console.warn('[TRACE] Database unavailable, using fallback dashboard summary:', error);
    return {
      session,
      summary: getFallbackDashboardSummary(session.user.id),
    };
  }
}
