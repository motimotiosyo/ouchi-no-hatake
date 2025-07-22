import { useAuth } from '@/contexts/AuthContext'
import { API_BASE_URL } from '@/lib/api'

// 認証付きAPI呼び出し用のカスタムフック
export function useApi() {
  const { token } = useAuth()

  // 認証付きAPI呼び出し関数
  const authenticatedCall = async (endpoint: string, options: RequestInit = {}) => {
    const url = `${API_BASE_URL}${endpoint}`
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }

    return fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    })
  }

  // ログアウトAPI専用関数
  const logout = async () => {
    if (!token) {
      throw new Error('トークンがありません')
    }

    return authenticatedCall('/api/v1/auth/logout', {
      method: 'DELETE'
    })
  }

  return {
    authenticatedCall,
    logout
  }
}