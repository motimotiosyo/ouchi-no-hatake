import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// JWT検証を行う関数
function verifyJWT(token: string): boolean {
  try {
    if (!token) return false

    // JWT の基本的な構造チェック（3つの部分に分かれているか）
    const parts = token.split('.')
    if (parts.length !== 3) return false

    // Payloadをデコードして有効期限をチェック
    const payload = JSON.parse(atob(parts[1]))
    const currentTime = Math.floor(Date.now() / 1000)

    // 有効期限チェック
    if (payload.exp && payload.exp < currentTime) {
      return false
    }

    return true
  } catch (error) {
    console.error('JWT verification error:', error)
    return false
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Cookieからトークンを取得
  const token = request.cookies.get('auth_token')?.value

  const isAuthenticated = token ? verifyJWT(token) : false

  // 保護されたルート（dashboard配下）
  const protectedRoutes = ['/dashboard']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  // 認証ページ
  const authRoutes = ['/login', '/signup']
  const isAuthRoute = authRoutes.includes(pathname)

  // 保護されたルートに未認証でアクセス
  if (isProtectedRoute && !isAuthenticated) {
    console.log(`🔒 認証ガード: ${pathname} → /login (未認証)`)
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 認証済みユーザーが認証ページにアクセス
  if (isAuthRoute && isAuthenticated) {
    console.log(`🔀 認証ガード: ${pathname} → /dashboard (認証済み)`)
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

// 適用するパスを指定
export const config = {
  matcher: [
    // API routes以外のすべてのルート
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
}