import { useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { authenticatedApiCall, apiCall } from '@/lib/api'

// 認証付きAPI呼び出し用のカスタムフック（強化版）
export function useApi() {
  const { token } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 認証付きAPI呼び出し関数
  const authenticatedCall = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    if (!token) {
      setError('認証トークンがありません')
      return null
    }

    setLoading(true)
    setError(null)

    try {
      const response = await authenticatedApiCall(endpoint, token, options)
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API Error: ${response.status} ${errorText}`)
      }

      const data = await response.json()
      return data
    } catch (err) {
      if (err instanceof Error && err.message === 'JWT_EXPIRED') {
        return null
      }
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました')
      return null
    } finally {
      setLoading(false)
    }
  }, [token])

  // ログアウトAPI専用関数
  const logout = useCallback(async () => {
    if (!token) {
      throw new Error('トークンがありません')
    }

    return authenticatedCall('/api/v1/auth/logout', {
      method: 'DELETE'
    })
  }, [token, authenticatedCall])

  const clearError = useCallback(() => setError(null), [])

  return {
    authenticatedCall,
    logout,
    loading,
    error,
    clearError
  }
}

// 認証不要API用カスタムフック
export function usePublicApi() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const publicCall = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    setLoading(true)
    setError(null)

    try {
      const response = await apiCall(endpoint, options)
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API Error: ${response.status} ${errorText}`)
      }

      const data = await response.json()
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const clearError = useCallback(() => setError(null), [])

  return {
    publicCall,
    loading,
    error,
    clearError
  }
}