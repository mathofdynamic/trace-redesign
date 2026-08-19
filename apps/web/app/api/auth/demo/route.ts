import {
  cookieAttributes,
  createSessionCookie,
  getTracePublicUrl,
  isSecurePublicUrl,
  sessionCookieName,
  safeAuthNext,
} from '@trace/auth';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = safeAuthNext(url.searchParams.get('next') || '/app');
  const demoUser = {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'Demo Engineer',
    email: 'engineer@trace.dev',
    image: null,
    githubLogin: 'trace-demo',
  };
  const sessionCookie = await createSessionCookie(demoUser);
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
