import { NextResponse } from 'next/server';

const SESSION_NAME = 'shittodo_session';

export function proxy(request) {
  const { pathname } = request.nextUrl;

  // Allow the login page, auth API, and static assets
  if (
    pathname === '/login' ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  const session = request.cookies.get(SESSION_NAME);

  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
