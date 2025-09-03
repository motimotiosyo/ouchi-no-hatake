// API設定
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'

// API呼び出し用のヘルパー関数
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`

  const defaultHeaders: Record<string, string> = {}

  // FormDataの場合はContent-Typeを設定しない（ブラウザに自動設定させる）
  if (!(options.body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json'
  }

  return fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: 'include',
  })
}

// 自動ログアウト用コールバック（AuthContextから設定される）
let autoLogoutCallback: (() => void) | null = null

// 自動ログアウトコールバックを設定する関数
export const setAutoLogoutCallback = (callback: () => void) => {
  autoLogoutCallback = callback
}

// 認証付きAPI呼び出し関数（JWT期限切れ自動検知機能付き）
export const authenticatedApiCall = async (endpoint: string, token: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`

  const defaultHeaders: Record<string, string> = {
    'Authorization': `Bearer ${token}`,
  }

  // FormDataの場合はContent-Typeを設定しない（ブラウザに自動設定させる）
  if (!(options.body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json'
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: 'include',
  })

  // 422エラー「Signature has expired」を検知
  if (response.status === 422) {
    try {
      const errorData = await response.clone().json()
      if (errorData.message === 'Signature has expired') {
        console.log('JWT期限切れを検知 - 自動ログアウトを実行')
        
        // 自動ログアウトを実行
        if (autoLogoutCallback) {
          autoLogoutCallback()
        }
        
        // カスタムエラーを投げる
        throw new Error('JWT_EXPIRED')
      }
    } catch (jsonError) {
      // JSONパースに失敗した場合は通常のレスポンスとして処理
      if (jsonError instanceof Error && jsonError.message === 'JWT_EXPIRED') {
        throw jsonError
      }
    }
  }

  return response
}

// ログアウトAPI呼び出し関数
export const logoutApi = async (token: string) => {
  return authenticatedApiCall('/api/v1/auth/logout', token, {
    method: 'DELETE'
  })
}