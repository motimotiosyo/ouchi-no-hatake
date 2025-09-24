'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { AuthMessage } from '@/types/auth'

// メッセージ・UI状態管理のコンテキスト
const AuthMessageContext = createContext<AuthMessage | undefined>(undefined)

// AuthMessageProvider コンポーネント
export function AuthMessageProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [autoLogoutMessage, setAutoLogoutMessage] = useState<string | null>(null)
  const [showAutoLogoutModal, setShowAutoLogoutModal] = useState(false)
  const [redirectMessage, setRedirectMessageState] = useState<string | null>(null)

  // メッセージクリア関数
  const clearAutoLogoutMessage = useCallback(() => {
    setAutoLogoutMessage(null)
  }, [])

  // リダイレクトメッセージ管理関数
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

  const value: AuthMessage = {
    autoLogoutMessage,
    showAutoLogoutModal,
    redirectMessage,
    clearAutoLogoutMessage,
    confirmAutoLogout,
    setRedirectMessage,
    clearRedirectMessage,
  }

  const internalValue: AuthMessageInternal = {
    setAutoLogoutMessage,
    setShowAutoLogoutModal,
  }

  return (
    <AuthMessageContext.Provider value={value}>
      <AuthMessageInternalContext.Provider value={internalValue}>
        {children}
      </AuthMessageInternalContext.Provider>
    </AuthMessageContext.Provider>
  )
}

// useAuthMessage カスタムフック
export function useAuthMessage(): AuthMessage {
  const context = useContext(AuthMessageContext)
  if (context === undefined) {
    throw new Error('useAuthMessageはAuthMessageProviderの内部で使用する必要があります')
  }
  return context
}

// 内部API（他のContextから使用）
interface AuthMessageInternal {
  setAutoLogoutMessage: (message: string | null) => void
  setShowAutoLogoutModal: (show: boolean) => void
}

const AuthMessageInternalContext = createContext<AuthMessageInternal | undefined>(undefined)

export function useAuthMessageInternal(): AuthMessageInternal {
  const context = useContext(AuthMessageInternalContext)
  if (context === undefined) {
    throw new Error('useAuthMessageInternalはAuthMessageProviderの内部で使用する必要があります')
  }
  return context
}