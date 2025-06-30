import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const getTokenFromCookie = (request: NextRequest) => {
  const tokenCookie = request.cookies.get('auth_token');
  return tokenCookie?.value;
};

// JWTトークンの基本的な検証（秘密鍵なしでも期限チェック可能）
function verifyJWT(token: string): boolean {
  try {
    if (!token) return false
    
    // JWTの基本構造チェック
    const parts = token.split('.')
    if (parts.length !== 3) return false
    
    // ペイロード部分をデコード
    const payload = JSON.parse(atob(parts[1]))
    
    // 期限チェック
    const currentTime = Math.floor(Date.now() / 1000)
    if (payload.exp && payload.exp <= currentTime) {
      console.log('Token expired:', new Date(payload.exp * 1000))
      return false
    }
    
    // user_idの存在チェック
    if (!payload.user_id) {
      console.log('No user_id in token')
      return false
    }
    
    console.log('Token valid for user:', payload.user_id)
    return true
  } catch (error) {
    console.log('JWT verification error:', error)
    return false
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log('middleware発火:', pathname);

  // /dashboard配下のみ認証必須
  if (!pathname.startsWith('/dashboard')) {
    return NextResponse.next();
  }

  const token = getTokenFromCookie(request);
  const isAuthenticated = token && verifyJWT(token);

  if (!isAuthenticated) {
    console.log('未認証: /loginへリダイレクト');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  console.log('認証成功: dashboardへのアクセス許可');
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
}