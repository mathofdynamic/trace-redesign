import {
  cookieAttributes,
  createSessionCookie,
  isSecurePublicUrl,
  sessionCookieName,
  safeAuthNext,
} from '@trace/auth';
import { isMockModeEnabled, MOCK_PRIMARY_USER } from '../../../../lib/mock';

export async function GET(request: Request) {
  if (!isMockModeEnabled() && process.env.NODE_ENV === 'production' && !process.env.TRACE_ALLOW_PRODUCTION_MOCKS) {
    return Response.json(
      { error: 'Demo authentication is disabled in production environments.' },
      { status: 403 },
    );
  }

  const url = new URL(request.url);
  const rawNext = url.searchParams.get('next');
  const targetNext = safeAuthNext(rawNext === '/onboarding' || !rawNext ? '/app' : rawNext);
  const sessionCookie = await createSessionCookie(MOCK_PRIMARY_USER);
  const isSecure = isSecurePublicUrl() || url.protocol === 'https:' || request.headers.get('x-forwarded-proto') === 'https';
  const attributes = cookieAttributes(60 * 60 * 24 * 7, isSecure);
  const response = new Response(null, {
    status: 302,
    headers: {
      location: targetNext,
      'cache-control': 'no-store',
    },
  });
  response.headers.append('set-cookie', `${sessionCookieName()}=${sessionCookie}; ${attributes}`);
  return response;
}
