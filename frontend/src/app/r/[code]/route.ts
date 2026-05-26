import { NextResponse } from 'next/server';

// Server-side route needs an absolute URL to reach the API container
const INTERNAL_API_URL = process.env.INTERNAL_API_URL || 'http://api:4000/api';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;

  // Derive the public-facing base URL from forwarded headers (nginx sets these)
  const forwardedHost = request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? '';
  const proto = request.headers.get('x-forwarded-proto') ?? 'https';
  const baseUrl = forwardedHost ? `${proto}://${forwardedHost}` : (process.env.NEXTAUTH_URL ?? 'https://nexsolution.cloud');

  try {
    const res = await fetch(
      `${INTERNAL_API_URL}/referrals/resolve/${encodeURIComponent(code.toUpperCase())}`,
      { cache: 'no-store' },
    );

    if (!res.ok) {
      return NextResponse.redirect(`${baseUrl}/`, 302);
    }

    const data = (await res.json()) as { valid: boolean; redirectUrl?: string };

    if (!data.valid || !data.redirectUrl) {
      return NextResponse.redirect(`${baseUrl}/`, 302);
    }

    return NextResponse.redirect(`${baseUrl}${data.redirectUrl}`, 302);
  } catch {
    return NextResponse.redirect(`${baseUrl}/`, 302);
  }
}
