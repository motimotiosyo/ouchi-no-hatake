// API設定
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://sodateru-backend.onrender.com'
  : 'http://localhost:3001'

// API呼び出し用のヘルパー関数
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  }

  // ここでリクエスト内容をログ出力
  console.log('APIリクエスト送信:', url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: 'include',
  })

  return fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: 'include',
  })
}

// 認証付きAPI呼び出し関数
export const authenticatedApiCall = async (endpoint: string, token: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`

  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
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

// ログアウトAPI呼び出し関数
export const logoutApi = async (token: string) => {
  return authenticatedApiCall('/api/v1/auth/logout', token, {
    method: 'DELETE'
  })
}