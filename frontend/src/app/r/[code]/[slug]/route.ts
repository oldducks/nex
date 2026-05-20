import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string; slug: string }> },
) {
  const { code, slug } = await params;

  // Derive the public-facing base URL from forwarded headers (nginx sets these)
  const forwardedHost = request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? '';
  const proto = request.headers.get('x-forwarded-proto') ?? 'https';
  const baseUrl = forwardedHost ? `${proto}://${forwardedHost}` : (process.env.NEXTAUTH_URL ?? 'https://nexsolution.cloud');

  const redirectUrl = `/lp/${encodeURIComponent(slug)}?ref=${encodeURIComponent(code.toUpperCase())}`;

  return NextResponse.redirect(`${baseUrl}${redirectUrl}`, 302);
}
