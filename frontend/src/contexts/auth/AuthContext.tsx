'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { apiClient } from '@/services/apiClient'
import { User, AuthState } from '@/types/auth'
import { getCookie, setCookie, deleteCookie } from '@/utils/cookies'
import Logger from '@/utils/logger'

// 基本認証状態のコンテキスト
const AuthContext = createContext<AuthState | undefined>(undefined)

// サーバーから現在のユーザー情報を取得する関数
const fetchCurrentUser = async (token: string): Promise<User | null> => {
  const result = await apiClient.get<{ user: User }>('/api/v1/auth/me', token)
  
  if (result.success) {
    return result.data.user
  } else {
    return null
  }
}

// AuthProvider コンポーネント
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // ページ読み込み時にlocalStorageからトークンを復元
  useEffect(() => {
    const initializeAuth = async () => {
      // まずCookieから確認（ミドルウェアと同じソース）
      const cookieToken = getCookie('auth_token')
      const savedToken = localStorage.getItem('auth_token')
      const savedUser = localStorage.getItem('auth_user')

      // CookieまたはlocalStorageにトークンがある場合
      const finalToken = cookieToken || savedToken
      
      if (finalToken && savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser)
          
          // ユーザー情報が古い可能性をチェック（email_verifiedフィールドがない場合）
          const shouldRefreshUser = !parsedUser.hasOwnProperty('email_verified')
          
          if (shouldRefreshUser) {
            const currentUser = await fetchCurrentUser(finalToken)
            
            if (currentUser) {
              setToken(finalToken)
              setUser(currentUser)
              localStorage.setItem('auth_user', JSON.stringify(currentUser))
              Logger.debug('User data refreshed during auth initialization')
            } else {
              setToken(finalToken)
              setUser(parsedUser)
              Logger.debug('Using cached user data for auth initialization')
            }
          } else {
            setToken(finalToken)
            setUser(parsedUser)
          }
          
          // localStorage と Cookie の同期
          if (finalToken !== savedToken) {
            localStorage.setItem('auth_token', finalToken)
          }
          if (!cookieToken) {
            setCookie('auth_token', finalToken)
          }
        } catch {
          // パース失敗時はクリア
          localStorage.removeItem('auth_token')
          localStorage.removeItem('auth_user')
          deleteCookie('auth_token')
        }
      } else if (finalToken && !savedUser) {
        // トークンはあるが localStorage にユーザー情報がない場合
        const currentUser = await fetchCurrentUser(finalToken)
        
        if (currentUser) {
          setToken(finalToken)
          setUser(currentUser)
          localStorage.setItem('auth_token', finalToken)
          localStorage.setItem('auth_user', JSON.stringify(currentUser))
          
          if (!cookieToken) {
            setCookie('auth_token', finalToken)
          }
        } else {
          localStorage.removeItem('auth_token')
          localStorage.removeItem('auth_user')
          deleteCookie('auth_token')
          setUser(null)
          setToken(null)
        }
      } else {
        // トークンがない場合はユーザー情報もクリア
        localStorage.removeItem('auth_user')
        setUser(null)
        setToken(null)
      }
      
      setIsLoading(false)
    }

    initializeAuth()
    
    // フォールバック: 一定時間後に強制的にローディングを終了
    const fallbackTimeout = setTimeout(() => {
      setIsLoading(false)
    }, 3000) // 3秒後
    
    return () => clearTimeout(fallbackTimeout)
  }, [])

  const value: AuthState = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// useAuth カスタムフック
export function useAuth(): AuthState {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthはAuthProviderの内部で使用する必要があります')
  }
  return context
}