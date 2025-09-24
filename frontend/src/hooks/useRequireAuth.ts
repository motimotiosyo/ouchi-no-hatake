import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext as useAuth } from '@/contexts/auth'

/**
 * 認証が必要なページで使用するカスタムフック
 * 未認証の場合はログイン画面にリダイレクトし、メッセージを表示する
 */
export function useRequireAuth() {
  const router = useRouter()
  const { isAuthenticated, isLoading, setRedirectMessage } = useAuth()

  useEffect(() => {
    // ローディング中は何もしない
    if (isLoading) return

    // 未認証の場合はログイン画面にリダイレクト
    if (!isAuthenticated) {
      setRedirectMessage('ログインが必要です')
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router, setRedirectMessage])

  return {
    isAuthenticated,
    isLoading,
    // 認証済みかつローディング完了の場合のみtrue
    canAccess: isAuthenticated && !isLoading
  }
}

/**
 * 認証チェック付きでページコンテンツを表示するための状態を返すヘルパーフック
 * 使用例:
 * const { canAccess, isLoading } = useRequireAuthWithRender()
 * if (isLoading) return <Loading />
 * if (!canAccess) return null
 * return <YourPageContent />
 */
export function useRequireAuthWithRender() {
  return useRequireAuth()
}