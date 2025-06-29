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
      console.log('🔑 JWT有効期限切れ')
      return false
    }

    return true
  } catch (error) {
    console.error('🔑 JWT検証エラー:', error)
    return false
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Cookieからトークンを取得
  const token = request.cookies.get('auth_token')?.value

  // 保護されたルート（今後追加予定）
  const protectedRoutes = ['/dashboard', '/profile', '/settings', '/admin']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  // 認証ページ
  const authRoutes = ['/login', '/signup', '/forgot-password']
  const isAuthRoute = authRoutes.includes(pathname)

  // 静的ファイルやAPIルートはスキップ
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.')) {
    return NextResponse.next()
  }

  // サーバー側で認証チェック
  let isAuthenticated = false
  if (token) {
    try {
      const verifyRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://backend:3000'}/api/v1/auth/verify`, {
        method: 'GET',
        headers: {
          'Cookie': `auth_token=${token}`
        },
        credentials: 'include',
        // next/serverのmiddlewareではfetchのデフォルトがedgeなので注意
      })
      isAuthenticated = verifyRes.status === 200
    } catch (e) {
      isAuthenticated = false
    }
  }

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

  // その他のページは通常通り処理
  return NextResponse.next()
}

// 適用するパスを指定
export const config = {
  matcher: [
    // API routes以外のすべてのルート
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
}