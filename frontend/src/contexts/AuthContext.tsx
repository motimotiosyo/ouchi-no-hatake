'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { authenticatedApiCall, setAutoLogoutCallback } from '@/lib/api'

// ユーザー情報の型定義
interface User {
  id: number
  email: string
  name: string
  email_verified?: boolean
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
  executeProtected: (action: () => void) => void
  executeProtectedAsync: (action: () => Promise<void>) => Promise<void>
  showAutoLogoutModal: boolean
  confirmAutoLogout: () => void
  verifyEmail: (token: string) => Promise<{ success: boolean; error?: string; expired?: boolean }>
  resendVerification: (email: string) => Promise<{ success: boolean; error?: string }>
  // 新規追加: リダイレクトメッセージ管理
  redirectMessage: string | null
  setRedirectMessage: (message: string | null) => void
  clearRedirectMessage: () => void
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

// サーバーから現在のユーザー情報を取得する関数
const fetchCurrentUser = async (token: string): Promise<User | null> => {
  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'
    const response = await fetch(`${apiBaseUrl}/api/v1/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })

    if (response.ok) {
      const data = await response.json()
      return data.user
    } else {
      console.log('ユーザー情報取得失敗:', response.status)
      return null
    }
  } catch (error) {
    console.error('ユーザー情報取得エラー:', error)
    return null
  }
}

// AuthProvider コンポーネント
export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [autoLogoutMessage, setAutoLogoutMessage] = useState<string | null>(null)
  const [showAutoLogoutModal, setShowAutoLogoutModal] = useState(false)
  // 新規追加: リダイレクトメッセージ状態
  const [redirectMessage, setRedirectMessageState] = useState<string | null>(null)

  // ページ読み込み時にlocalStorageからトークンを復元
  useEffect(() => {
    console.log('AuthContext useEffect triggered')
    const initializeAuth = async () => {
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
          
          // ユーザー情報が古い可能性をチェック（email_verifiedフィールドがない場合）
          const shouldRefreshUser = !parsedUser.hasOwnProperty('email_verified')
          
          if (shouldRefreshUser) {
            console.log('ユーザー情報が古い可能性があるため、サーバーから最新情報を取得')
            const currentUser = await fetchCurrentUser(finalToken)
            
            if (currentUser) {
              console.log('サーバーから最新ユーザー情報を取得成功:', currentUser.name)
              setToken(finalToken)
              setUser(currentUser)
              localStorage.setItem('auth_user', JSON.stringify(currentUser))
            } else {
              console.log('ユーザー情報取得失敗 - 既存の情報を使用')
              setToken(finalToken)
              setUser(parsedUser)
            }
          } else {
            console.log('認証情報復元成功:', parsedUser.name)
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
        } catch (error) {
          console.log('認証情報パースエラー:', error)
          // パース失敗時はクリア
          localStorage.removeItem('auth_token')
          localStorage.removeItem('auth_user')
          deleteCookie('auth_token')
        }
      } else if (finalToken && !savedUser) {
        // トークンはあるが localStorage にユーザー情報がない場合
        console.log('トークンあり、ユーザー情報なし - サーバーから取得')
        const currentUser = await fetchCurrentUser(finalToken)
        
        if (currentUser) {
          console.log('サーバーからユーザー情報取得成功:', currentUser.name)
          setToken(finalToken)
          setUser(currentUser)
          localStorage.setItem('auth_token', finalToken)
          localStorage.setItem('auth_user', JSON.stringify(currentUser))
          
          if (!cookieToken) {
            setCookie('auth_token', finalToken)
          }
        } else {
          console.log('ユーザー情報取得失敗 - 認証状態をクリア')
          localStorage.removeItem('auth_token')
          localStorage.removeItem('auth_user')
          deleteCookie('auth_token')
          setUser(null)
          setToken(null)
        }
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
      
      // 新規追加: ログアウト後のリダイレクトとメッセージ設定
      router.push('/')
      // ページ遷移後にメッセージを設定（遷移先でメッセージが確実に表示されるように遅延）
      setTimeout(() => {
        setRedirectMessage('ログアウトしました')
      }, 100)
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
      
      // ユーザーへのメッセージ設定とモーダル表示
      setAutoLogoutMessage('セッションの有効期限が切れました。再度ログインしてください。')
      setShowAutoLogoutModal(true)
      
      console.log('自動ログアウト処理完了（モーダル表示中）')
    } catch (error) {
      console.error('Auto logout error:', error)
    }
  }, [])

  // メッセージクリア関数
  const clearAutoLogoutMessage = () => {
    setAutoLogoutMessage(null)
  }

  // 新規追加: リダイレクトメッセージ管理関数
  const setRedirectMessage = useCallback((message: string | null) => {
    setRedirectMessageState(message)
  }, [])

  const clearRedirectMessage = useCallback(() => {
    setRedirectMessageState(null)
  }, [])

  // 自動ログアウト確認関数
  const confirmAutoLogout = useCallback(() => {
    setShowAutoLogoutModal(false)
    setAutoLogoutMessage(null)
    // ログイン画面へリダイレクト
    router.push('/login')
  }, [router])

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
      console.log('トークンなし - 自動ログアウトを実行')
      // トークンがない場合は自動ログアウト処理を実行
      autoLogout()
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

  // メール認証確認関数
  const verifyEmail = useCallback(async (token: string): Promise<{ success: boolean; error?: string; expired?: boolean }> => {
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'
      const response = await fetch(`${apiBaseUrl}/api/v1/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      })

      const data = await response.json()

      if (response.ok) {
        // 認証成功時はログイン状態にする
        setToken(data.token)
        setUser({ ...data.user, email_verified: true })
        localStorage.setItem('auth_token', data.token)
        localStorage.setItem('auth_user', JSON.stringify({ ...data.user, email_verified: true }))
        setCookie('auth_token', data.token, 7)
        return { success: true }
      } else {
        return { 
          success: false, 
          error: data.error || 'メール認証に失敗しました',
          expired: data.expired || false
        }
      }
    } catch (error) {
      console.error('Email verification error:', error)
      return { 
        success: false, 
        error: 'ネットワークエラーが発生しました' 
      }
    }
  }, [])

  // 認証メール再送信関数
  const resendVerification = useCallback(async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'
      const response = await fetch(`${apiBaseUrl}/api/v1/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        return { success: true }
      } else {
        return { 
          success: false, 
          error: data.error || '認証メールの再送信に失敗しました'
        }
      }
    } catch (error) {
      console.error('Resend verification error:', error)
      return { 
        success: false, 
        error: 'ネットワークエラーが発生しました' 
      }
    }
  }, [])

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
    updateLastActivity,
    executeProtected,
    executeProtectedAsync,
    showAutoLogoutModal,
    confirmAutoLogout,
    verifyEmail,
    resendVerification,
    // 新規追加: リダイレクトメッセージ管理
    redirectMessage,
    setRedirectMessage,
    clearRedirectMessage
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