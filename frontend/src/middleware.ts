import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const getTokenFromCookie = (request: NextRequest) => {
  const tokenCookie = request.cookies.get('auth_token');
  return tokenCookie?.value;
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log('middleware発火:', pathname);

  // /dashboard配下のみ認証必須
  if (!pathname.startsWith('/dashboard')) {
    return NextResponse.next();
  }

  const token = getTokenFromCookie(request);
  const isAuthenticated = !!token;

  if (!isAuthenticated) {
    console.log('未認証: /loginへリダイレクト');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
}