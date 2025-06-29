'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authenticatedApiCall } from '@/lib/api'

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Cookie操作のヘルパー関数
const setCookie = (name: string, value: string, days: number = 7) => {
  const expires = new Date()
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`
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

const deleteCookie = (name: string) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
}

// AuthProvider コンポーネント
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // ページ読み込み時にlocalStorageからトークンを復元
  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token')
    const savedUser = localStorage.getItem('auth_user')

    if (savedToken && savedUser) {
      try {
        setToken(savedToken)
        setUser(JSON.parse(savedUser))

        // localStorage/Cookie同期
        if (!localStorage.getItem('auth_token')) {
          localStorage.setItem('auth_token', savedToken)
        }
        if (!getCookie('auth_token')) {
          setCookie('auth_token', savedToken)
        }
      } catch {
        // パース失敗時はクリア
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
      }
    }
    setIsLoading(false)
  }, [])

  // ログイン関数（認証状態管理のみ）
  const login = (newToken: string, newUser: User) => {
    setToken(newToken)
    setUser(newUser)
    localStorage.setItem('auth_token', newToken)
    localStorage.setItem('auth_user', JSON.stringify(newUser))
    setCookie('auth_token', newToken, 7)
    console.log('Cookie after setCookie:', document.cookie)
  }

  // ログアウト関数（認証状態クリアのみ、画面遷移はミドルウェアが処理）
  const logout = async () => {
    try {
      if (token) {
        await authenticatedApiCall('/api/v1/auth/logout', token, { method: 'DELETE' });
        console.log('🔓 サーバーサイドログアウト成功')
      }
    } catch (error) {
      console.error('🔓 ログアウトAPIエラー:', error)
      // エラーが発生してもローカルのログアウトは実行
    } finally {
      // ローカルの認証状態をクリア
      setToken(null)
      setUser(null)
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      deleteCookie('auth_token')
      console.log('🔓 ローカルログアウト完了')
      // 画面遷移はミドルウェアに委譲
    }
  }

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// useAuth カスタムフック
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}