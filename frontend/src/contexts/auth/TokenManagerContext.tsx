'use client'

import { createContext, useContext, useCallback, useEffect, ReactNode } from 'react'
import { setAutoLogoutCallback } from '@/lib/api'
import { TokenManager } from '@/types/auth'
import { useAuth } from './AuthContext'
import { useAuthMessageInternal } from './AuthMessageContext'
import { deleteCookie } from '@/utils/cookies'
import Logger from '@/utils/logger'

// JWT・セッション管理のコンテキスト
const TokenManagerContext = createContext<TokenManager | undefined>(undefined)

// TokenManagerProvider コンポーネント
export function TokenManagerProvider({ children }: { children: ReactNode }) {
  const { user, token } = useAuth()
  const { setAutoLogoutMessage, setShowAutoLogoutModal } = useAuthMessageInternal()

  // JWT期限切れ時の自動ログアウト関数（useCallbackでメモ化）
  const autoLogout = useCallback(async () => {
    Logger.auth('Auto logout initiated due to token expiration', user?.id)
    
    try {
      // API呼び出しは行わない（既にトークンが無効なため）
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      localStorage.removeItem('last_activity')
      deleteCookie('auth_token')
      
      // ユーザーへのメッセージ設定とモーダル表示
      setAutoLogoutMessage('セッションの有効期限が切れました。再度ログインしてください。')
      setShowAutoLogoutModal(true)
      
      Logger.auth('Auto logout completed', user?.id)
      
      // ページリロードして状態を更新
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      Logger.error('Error during auto logout process', error instanceof Error ? error : undefined)
    }
  }, [user?.id, setAutoLogoutMessage, setShowAutoLogoutModal])

  // 最終活動日時を更新する関数
  const updateLastActivity = useCallback(() => {
    localStorage.setItem('last_activity', Date.now().toString())
  }, [])

  // 非アクティブ期間をチェックする関数（6ヶ月）
  const checkInactivity = useCallback(() => {
    const lastActivity = localStorage.getItem('last_activity')
    if (!lastActivity) {
      // 初回の場合は現在時刻を設定
      updateLastActivity()
      return true
    }
    
    const sixMonthsInMs = 6 * 30 * 24 * 60 * 60 * 1000 // 6ヶ月（ミリ秒）
    const inactiveTime = Date.now() - parseInt(lastActivity)
    
    if (inactiveTime > sixMonthsInMs) {
      return false
    }
    
    return true
  }, [updateLastActivity])

  // 認証有効性チェック関数（JWT期限 + アクティビティ）
  const checkTokenValidity = useCallback(() => {
    // 常にlocalStorageから最新のトークンを取得
    const currentToken = localStorage.getItem('auth_token')
    
    if (!currentToken) {
      // トークンがない場合は自動ログアウト処理を実行
      autoLogout()
      return false
    }

    // アクティビティチェック（6ヶ月間非アクティブ）
    if (!checkInactivity()) {
      autoLogout()
      return false
    }

    try {
      // JWTトークンをデコード（Base64）
      const payload = JSON.parse(atob(currentToken.split('.')[1]))
      const currentTime = Math.floor(Date.now() / 1000)
      
      // 有効期限をチェック
      if (payload.exp && payload.exp < currentTime) {
        autoLogout()
        return false
      }
      
      // 有効な操作なので最終活動日時を更新
      updateLastActivity()
      
      return true
    } catch {
      // 解析に失敗した場合は無効とみなす
      autoLogout()
      return false
    }
  }, [autoLogout, checkInactivity, updateLastActivity])

  // 認証チェック付きで操作を実行
  const executeProtected = useCallback((action: () => void) => {
    if (!checkTokenValidity()) {
      return // 自動ログアウトが実行されるため処理中断
    }
    action()
  }, [checkTokenValidity])

  // 認証チェック付きで非同期操作を実行
  const executeProtectedAsync = useCallback(async (action: () => Promise<void>) => {
    if (!checkTokenValidity()) {
      return // 自動ログアウトが実行されるため処理中断
    }
    await action()
  }, [checkTokenValidity])

  // 初期化時にAPI.tsにコールバックを設定
  useEffect(() => {
    setAutoLogoutCallback(autoLogout)
  }, [autoLogout])

  const value: TokenManager = {
    checkTokenValidity,
    updateLastActivity,
    executeProtected,
    executeProtectedAsync,
  }

  return <TokenManagerContext.Provider value={value}>{children}</TokenManagerContext.Provider>
}

// useTokenManager カスタムフック
export function useTokenManager(): TokenManager {
  const context = useContext(TokenManagerContext)
  if (context === undefined) {
    throw new Error('useTokenManagerはTokenManagerProviderの内部で使用する必要があります')
  }
  return context
}