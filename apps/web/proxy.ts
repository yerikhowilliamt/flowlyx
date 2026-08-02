import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_ROUTES = ['/', '/login', '/register'];
const AUTH_ROUTES = ['/login', '/register'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasRefreshToken = request.cookies.has('Refresh');

  const isPublic = PUBLIC_ROUTES.includes(pathname);
  const isAuth = AUTH_ROUTES.some((r) => pathname.startsWith(r));

  // if (isAuth && hasRefreshToken) {
  //   return NextResponse.redirect(new URL('/organizations', request.url));
  // }

  // Prevent logged in users from visiting root page
  // if (pathname === '/' && hasRefreshToken) {
  //   return NextResponse.redirect(new URL('/organizations', request.url));
  // }

  if (!isPublic && !isAuth && !hasRefreshToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
