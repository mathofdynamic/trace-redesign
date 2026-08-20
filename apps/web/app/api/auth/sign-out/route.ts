import {
  cookieAttributes,
  isSecurePublicUrl,
  sessionCookieName,
} from '@trace/auth';

export async function POST(request: Request) {
  const url = new URL(request.url);
  const isSecure = isSecurePublicUrl() || url.protocol === 'https:' || request.headers.get('x-forwarded-proto') === 'https';
  const response = new Response(null, {
    status: 302,
    headers: {
      location: '/',
      'cache-control': 'no-store',
    },
  });
  response.headers.append(
    'set-cookie',
    `${sessionCookieName()}=; ${cookieAttributes(0, isSecure)}`,
  );
  return response;
}
