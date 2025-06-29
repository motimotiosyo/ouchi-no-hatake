import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  console.log('🔍 ミドルウェア発火:', pathname)

  // Cookieからトークンを取得
  const token = request.cookies.get('auth_token')?.value
  console.log('🍪 取得したトークン:', token ? 'あり' : 'なし')
  console.log('🍪 全Cookies:', request.cookies.getAll())

  // 保護されたルート
  const protectedRoutes = ['/dashboard', '/profile', '/settings', '/admin']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  // 認証ページ
  const authRoutes = ['/login', '/signup', '/forgot-password']
  const isAuthRoute = authRoutes.includes(pathname)

  console.log('📍 ルート判定:', { isProtectedRoute, isAuthRoute })

  // 静的ファイルやAPIルートはスキップ
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.')) {
    return NextResponse.next()
  }

  // サーバー側で認証チェック
  let isAuthenticated = false
  if (token) {
    try {
      console.log('🔐 認証チェック開始...')
      const verifyRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://backend:3000'}/api/v1/auth/verify`, {
        method: 'GET',
        headers: {
          'Cookie': `auth_token=${token}`
        },
        credentials: 'include',
      })
      isAuthenticated = verifyRes.status === 200
      console.log('✅ 認証結果:', isAuthenticated)
    } catch (error) {
      console.log('❌ 認証エラー:', error)
      isAuthenticated = false
    }
  }

  // 保護されたルートに未認証でアクセス
  if (isProtectedRoute && !isAuthenticated) {
    console.log(`🔒 認証ガード: ${pathname} → /login (未認証)`)
    const redirectResponse = NextResponse.redirect(new URL('/login', request.url))
    
    // デバッグ情報をレスポンスヘッダーに追加
    redirectResponse.headers.set('X-Debug-Token', token ? 'present' : 'missing')
    redirectResponse.headers.set('X-Debug-Cookies-Count', request.cookies.getAll().length.toString())
    redirectResponse.headers.set('X-Debug-Reason', 'unauthorized')
    
    return redirectResponse
  }

  // 認証済みユーザーが認証ページにアクセス
  if (isAuthRoute && isAuthenticated) {
    console.log(`🔀 認証ガード: ${pathname} → /dashboard (認証済み)`)
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // ルートページへの認証済みアクセス → ダッシュボードにリダイレクト
  if (pathname === '/' && isAuthenticated) {
    console.log(`🏠 ルートアクセス: / → /dashboard (認証済み)`)
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  console.log('➡️ 通常処理続行')
  
  // デバッグ情報を含む通常レスポンス
  const response = NextResponse.next()
  response.headers.set('X-Debug-Token', token ? 'present' : 'missing')
  response.headers.set('X-Debug-Cookies-Count', request.cookies.getAll().length.toString())
  
  return response
}

// 適用するパスを指定
export const config = {
  matcher: [
    // API routes以外のすべてのルート
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
}