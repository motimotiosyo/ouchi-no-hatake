'use client'

import { createContext, useContext, useCallback, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { authenticatedApiCall } from '@/lib/api'
import { apiClient } from '@/services/apiClient'
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
      
      // ログアウト後のリダイレクトとメッセージ設定
      // リロード前にlocalStorageにメッセージを保存
      localStorage.setItem('flash_message', 'ログアウトしました')
      localStorage.setItem('flash_type', 'info')
      // リロードを伴うリダイレクト
      window.location.href = '/'
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
    const result = await apiClient.post<{ message: string, token: string, user: User }>('/api/v1/auth/verify-email', { token })

    if (result.success) {
      // 認証成功時はログイン状態にする
      localStorage.setItem('auth_token', result.data.token)
      localStorage.setItem('auth_user', JSON.stringify({ ...result.data.user, email_verified: true }))
      setCookie('auth_token', result.data.token, 7)

      // ページリロードして状態を更新
      window.location.reload()

      return { success: true, data: result.data }
    } else {
      return {
        success: false,
        error: {
          message: result.error.message || 'メール認証に失敗しました',
          code: result.error.code
        }
      }
    }
  }, [])

  // 認証メール再送信関数
  const resendVerification = useCallback(async (email: string): Promise<ResendResult> => {
    const result = await apiClient.post<{ message: string }>('/api/v1/auth/resend-verification', { email })

    if (result.success) {
      return { success: true, data: result.data }
    } else {
      return {
        success: false,
        error: {
          message: result.error.message || '認証メールの再送信に失敗しました',
          code: result.error.code
        }
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