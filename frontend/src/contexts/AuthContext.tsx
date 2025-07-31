'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { authenticatedApiCall, setAutoLogoutCallback } from '@/lib/api'

// ユーザー情報の型定義
interface User {
  id: number
  email: string
  name: string
}

// 認証コンテキストの型定義
interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (token: string, user: User) => void
  logout: () => void
  setToken: (token: string | null) => void
  autoLogoutMessage: string | null
  clearAutoLogoutMessage: () => void
  checkTokenValidity: () => boolean
  updateLastActivity: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Cookie操作のヘルパー関数
const setCookie = (name: string, value: string, days: number = 7) => {
  const expires = new Date()
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
  const cookieString = `${name}=${value}; expires=${expires.toUTCString()}; path=/; secure=true; samesite=none`
  document.cookie = cookieString
}

const getCookie = (name: string): string | null => {
  const nameEQ = name + "="
  const ca = document.cookie.split(';')
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === ' ') c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
  }
  return null
}

// 重要：Rails側と同じ属性でCookie削除
const deleteCookie = (name: string) => {
  console.log('Cookie削除試行:', name)
  
  // パターン1: Rails側と完全に同じ属性
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; secure=true; samesite=none`
  
  // パターン2: ドメイン指定なし
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
  
  // パターン3: ルートパスなし
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`
  
  // パターン4: max-age使用
  document.cookie = `${name}=; max-age=0; path=/; secure=true; samesite=none`
  
  // パターン5: max-age使用（属性なし）
  document.cookie = `${name}=; max-age=0; path=/`
  
  console.log('Cookie削除後の状態:', document.cookie)
}

// AuthProvider コンポーネント
export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [autoLogoutMessage, setAutoLogoutMessage] = useState<string | null>(null)

  // ページ読み込み時にlocalStorageからトークンを復元
  useEffect(() => {
    console.log('AuthContext useEffect triggered')
    const initializeAuth = () => {
      // まずCookieから確認（ミドルウェアと同じソース）
      const cookieToken = getCookie('auth_token')
      const savedToken = localStorage.getItem('auth_token')
      const savedUser = localStorage.getItem('auth_user')

      console.log('認証初期化:', { 
        cookieToken: !!cookieToken, 
        savedToken: !!savedToken, 
        savedUser: !!savedUser 
      })

      // CookieまたはlocalStorageにトークンがある場合
      const finalToken = cookieToken || savedToken
      
      if (finalToken && savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser)
          
          console.log('認証情報復元成功:', parsedUser.name)
          
          setToken(finalToken)
          setUser(parsedUser)
          
          // localStorage と Cookie の同期
          if (finalToken !== savedToken) {
            localStorage.setItem('auth_token', finalToken)
          }
          if (!cookieToken) {
            setCookie('auth_token', finalToken)
          }
        } catch (error) {
          console.log('認証情報パースエラー:', error)
          // パース失敗時はクリア
          localStorage.removeItem('auth_token')
          localStorage.removeItem('auth_user')
          deleteCookie('auth_token')
        }
      } else if (cookieToken && !savedUser) {
        // Cookieはあるが localStorage にユーザー情報がない場合
        console.log('Cookie認証はあるがユーザー情報なし - 状態維持')
        setToken(cookieToken)
        localStorage.setItem('auth_token', cookieToken)
      } else {
        console.log('認証情報なし - ユーザー情報もクリア')
        // トークンがない場合はユーザー情報もクリア
        localStorage.removeItem('auth_user')
        setUser(null)
        setToken(null)
      }
      
      console.log('認証初期化完了 - isLoadingをfalseに設定')
      setIsLoading(false)
    }

    initializeAuth()
    
    // フォールバック: 一定時間後に強制的にローディングを終了
    const fallbackTimeout = setTimeout(() => {
      console.log('Fallback: 強制的にisLoadingをfalseに設定')
      setIsLoading(false)
    }, 3000) // 3秒後
    
    return () => clearTimeout(fallbackTimeout)
  }, [])

  // ログイン関数
  const login = (newToken: string, newUser: User) => {
    console.log('ログイン実行:', newUser.name)
    setToken(newToken)
    setUser(newUser)
    localStorage.setItem('auth_token', newToken)
    localStorage.setItem('auth_user', JSON.stringify(newUser))
    localStorage.setItem('last_activity', Date.now().toString()) // 初回アクティビティ記録
    setCookie('auth_token', newToken, 7)
  }

  // 通常のログアウト関数
  const logout = async () => {
    console.log('ログアウト開始 - Cookie削除前:', document.cookie)
    
    try {
      if (token) {
        await authenticatedApiCall('/api/v1/auth/logout', token, { method: 'DELETE' });
      }
    } catch (error) {
      console.error('Logout API error:', error)
    } finally {
      setToken(null)
      setUser(null)
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      localStorage.removeItem('last_activity')
      deleteCookie('auth_token')
      
      console.log('ログアウト完了 - Cookie削除後:', document.cookie)
    }
  }

  // JWT期限切れ時の自動ログアウト関数（useCallbackでメモ化）
  const autoLogout = useCallback(async () => {
    console.log('JWT期限切れによる自動ログアウト開始')
    
    try {
      // API呼び出しは行わない（既にトークンが無効なため）
      setToken(null)
      setUser(null)
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      localStorage.removeItem('last_activity')
      deleteCookie('auth_token')
      
      // ユーザーへのメッセージ設定
      setAutoLogoutMessage('セッションの有効期限が切れました。再度ログインしてください。')
      
      // ログイン画面へリダイレクト
      router.push('/login')
      
      console.log('自動ログアウト完了')
    } catch (error) {
      console.error('Auto logout error:', error)
    }
  }, [router])

  // メッセージクリア関数
  const clearAutoLogoutMessage = () => {
    setAutoLogoutMessage(null)
  }

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
      console.log('6ヶ月間非アクティブのため自動ログアウト')
      return false
    }
    
    return true
  }, [updateLastActivity])

  // 認証有効性チェック関数（JWT期限 + アクティビティ）
  const checkTokenValidity = useCallback(() => {
    // 常にlocalStorageから最新のトークンを取得
    const currentToken = localStorage.getItem('auth_token')
    
    if (!currentToken) {
      console.log('トークンなし - ユーザー情報をクリア')
      // トークンがない場合は即座にユーザー情報もクリア
      setUser(null)
      setToken(null)
      localStorage.removeItem('auth_user')
      localStorage.removeItem('last_activity')
      return false
    }

    // アクティビティチェック（6ヶ月間非アクティブ）
    if (!checkInactivity()) {
      console.log('長期間非アクティブのため自動ログアウト')
      autoLogout()
      return false
    }

    try {
      // JWTトークンをデコード（Base64）
      const payload = JSON.parse(atob(currentToken.split('.')[1]))
      const currentTime = Math.floor(Date.now() / 1000)
      
      // 有効期限をチェック
      if (payload.exp && payload.exp < currentTime) {
        console.log('JWT期限切れを事前検知 - 自動ログアウトを実行')
        autoLogout()
        return false
      }
      
      // 有効な操作なので最終活動日時を更新
      updateLastActivity()
      
      return true
    } catch (error) {
      console.error('JWT解析エラー:', error)
      // 解析に失敗した場合は無効とみなす
      autoLogout()
      return false
    }
  }, [token, autoLogout, checkInactivity, updateLastActivity])

  // 初期化時にAPI.tsにコールバックを設定
  useEffect(() => {
    setAutoLogoutCallback(autoLogout)
  }, [autoLogout])

  const value = {
    user,
    token,
    isAuthenticated: !!user && !!token,  // userとtokenの両方があれば認証済み
    isLoading,
    login,
    logout,
    setToken,
    autoLogoutMessage,
    clearAutoLogoutMessage,
    checkTokenValidity,
    updateLastActivity
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// useAuth カスタムフック
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthはAuthProviderの内部で使用する必要があります')
  }
  return context
}