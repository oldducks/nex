import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isV2 = pathname === '/v2' || pathname.startsWith('/v2/');
  const targetPath = isV2
    ? (pathname === '/v2' ? '/' : pathname.replace(/^\/v2/, ''))
    : pathname;

  const token = request.cookies.get('token')?.value;
  const requiresAuth = targetPath.startsWith('/manage') || targetPath.startsWith('/admin');
  const userAgent = request.headers.get('user-agent') || '';
  const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(userAgent);

  if (targetPath === '/manage/control-center') {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = isV2 ? '/v2/manage/control' : '/manage/control';
    return NextResponse.redirect(redirectUrl);
  }

  if (requiresAuth && !token) {
    const loginPath = isV2 ? '/v2/login' : '/login';
    return NextResponse.redirect(new URL(loginPath, request.url));
  }

  if (isV2) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = targetPath;
    return NextResponse.rewrite(rewriteUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/v2/:path*', '/manage/:path*', '/admin/:path*'],
};
