'use client'

import { createContext, useContext, useCallback, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { authenticatedApiCall, API_BASE_URL } from '@/lib/api'
import { User, AuthActions, VerificationResult, ResendResult } from '@/types/auth'
import { setCookie, deleteCookie } from '@/utils/cookies'
import { useAuth } from './AuthContext'
import { useAuthMessage } from './AuthMessageContext'
import Logger from '@/utils/logger'

// 認証アクションのコンテキスト
const AuthActionsContext = createContext<AuthActions | undefined>(undefined)

// AuthActionsProvider コンポーネント
export function AuthActionsProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { user, token } = useAuth()
  const { setRedirectMessage } = useAuthMessage()

  // ログイン関数
  const login = useCallback((newToken: string, newUser: User) => {
    localStorage.setItem('auth_token', newToken)
    localStorage.setItem('auth_user', JSON.stringify(newUser))
    localStorage.setItem('last_activity', Date.now().toString()) // 初回アクティビティ記録
    setCookie('auth_token', newToken, 7)
    Logger.auth('User login successful', newUser.id)
    
    // ページリロードして状態を更新
    window.location.reload()
  }, [])

  // 通常のログアウト関数
  const logout = useCallback(async () => {
    Logger.auth('User logout initiated', user?.id)
    
    try {
      if (token) {
        await authenticatedApiCall('/api/v1/auth/logout', token, { method: 'DELETE' });
      }
    } catch (error) {
      // ログアウトAPIエラーは無視（クライアント側クリーンアップは継続）
      Logger.warn('Logout API call failed, continuing with client cleanup', { error })
    } finally {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      localStorage.removeItem('last_activity')
      deleteCookie('auth_token')
      
      Logger.auth('User logout completed', user?.id)
      
      // 新規追加: ログアウト後のリダイレクトとメッセージ設定
      router.push('/')
      // ページ遷移後にメッセージを設定（遷移先でメッセージが確実に表示されるように遅延）
      setTimeout(() => {
        setRedirectMessage('ログアウトしました')
      }, 100)
    }
  }, [user?.id, token, router, setRedirectMessage])

  // トークン設定関数（互換性維持用）
  const setToken = useCallback((newToken: string | null) => {
    if (newToken) {
      localStorage.setItem('auth_token', newToken)
      setCookie('auth_token', newToken, 7)
    } else {
      localStorage.removeItem('auth_token')
      deleteCookie('auth_token')
    }
    // ページリロードして状態を更新
    window.location.reload()
  }, [])

  // メール認証確認関数
  const verifyEmail = useCallback(async (token: string): Promise<VerificationResult> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // 認証成功時はログイン状態にする
        localStorage.setItem('auth_token', data.data.token)
        localStorage.setItem('auth_user', JSON.stringify({ ...data.data.user, email_verified: true }))
        setCookie('auth_token', data.data.token, 7)

        // ページリロードして状態を更新
        window.location.reload()

        return { success: true, data: data.data }
      } else {
        return {
          success: false,
          error: {
            message: data.error?.message || 'メール認証に失敗しました',
            code: data.error?.code
          }
        }
      }
    } catch {
      return {
        success: false,
        error: { message: 'ネットワークエラーが発生しました' }
      }
    }
  }, [])

  // 認証メール再送信関数
  const resendVerification = useCallback(async (email: string): Promise<ResendResult> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        return { success: true, data: data.data }
      } else {
        return {
          success: false,
          error: {
            message: data.error?.message || '認証メールの再送信に失敗しました',
            code: data.error?.code
          }
        }
      }
    } catch {
      return {
        success: false,
        error: { message: 'ネットワークエラーが発生しました' }
      }
    }
  }, [])

  const value: AuthActions = {
    login,
    logout,
    setToken,
    verifyEmail,
    resendVerification,
  }

  return <AuthActionsContext.Provider value={value}>{children}</AuthActionsContext.Provider>
}

// useAuthActions カスタムフック
export function useAuthActions(): AuthActions {
  const context = useContext(AuthActionsContext)
  if (context === undefined) {
    throw new Error('useAuthActionsはAuthActionsProviderの内部で使用する必要があります')
  }
  return context
}