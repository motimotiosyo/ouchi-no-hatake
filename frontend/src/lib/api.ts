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

  return fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  })
}