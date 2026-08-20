import { and, eq } from 'drizzle-orm';
import { getTraceSession } from '@trace/auth';
import { schema } from '@trace/db';
import { approveDeviceAuthorization } from '../../../../../lib/cli-auth';
import { createRequestDatabase } from '../../../../../lib/request-database';
import { isTrustedBrowserMutation } from '../../../../../lib/browser-origin';

function redirectRelative(location: string, status = 303) {
  return new Response(null, {
    status,
    headers: { location, 'cache-control': 'no-store' },
  });
}

export async function POST(request: Request) {
  const session = await getTraceSession(request.headers);
  if (!session?.user) return redirectRelative('/sign-in');
  if (!isTrustedBrowserMutation(request)) {
    return Response.json({ error: 'Cross-origin request rejected.' }, { status: 403 });
  }
  const form = await request.formData();
  const code = form.get('code');
  const organizationId = form.get('organizationId');
  if (typeof code !== 'string' || typeof organizationId !== 'string') {
    return redirectRelative('/cli/authorize?error=invalid');
  }
  const { db, client } = await createRequestDatabase();
  try {
    const [membership] = await db
      .select({ organizationId: schema.memberships.organizationId })
      .from(schema.memberships)
      .where(
        and(
          eq(schema.memberships.userId, session.user.id),
          eq(schema.memberships.organizationId, organizationId),
        ),
      )
      .limit(1);
    if (!membership) {
      return redirectRelative('/cli/authorize?error=forbidden');
    }
    const approved = await approveDeviceAuthorization(db, {
      code: code.trim().toUpperCase(),
      userId: session.user.id,
      organizationId,
    });
    if (!approved) {
      return redirectRelative('/cli/authorize?error=expired');
    }
    await db.insert(schema.auditEvents).values({
      organizationId,
      actorUserId: session.user.id,
      action: 'cli.connection.approved',
      subjectType: 'cli_connection',
      subjectId: approved.id,
    });
    return redirectRelative('/cli/authorize?approved=1');
  } finally {
    await client.end();
  }
}
