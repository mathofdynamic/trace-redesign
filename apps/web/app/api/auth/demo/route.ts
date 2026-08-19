import {
  cookieAttributes,
  createSessionCookie,
  getTracePublicUrl,
  isSecurePublicUrl,
  sessionCookieName,
  safeAuthNext,
} from '@trace/auth';
import { isMockModeEnabled, MOCK_PRIMARY_USER } from '../../../../lib/mock';

export async function GET(request: Request) {
  if (!isMockModeEnabled() && process.env.NODE_ENV === 'production') {
    return Response.json(
      { error: 'Demo authentication is disabled in production environments.' },
      { status: 403 },
    );
  }

  const url = new URL(request.url);
  const next = safeAuthNext(url.searchParams.get('next') || '/app');
  const sessionCookie = await createSessionCookie(MOCK_PRIMARY_USER);
  const attributes = cookieAttributes(60 * 60 * 24 * 7, isSecurePublicUrl());
  const response = new Response(null, {
    status: 302,
    headers: {
      location: `${getTracePublicUrl()}${next}`,
    },
  });
  response.headers.append('set-cookie', `${sessionCookieName()}=${sessionCookie}; ${attributes}`);
  return response;
}
