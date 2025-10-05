import { apiClient } from '@/services/apiClient'

// API設定
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'

// 自動ログアウトコールバックを設定する関数（後方互換性のため維持）
export const setAutoLogoutCallback = (callback: () => void) => {
  apiClient.setAutoLogoutCallback(callback)
}

/**
 * @deprecated Use apiClient.post() instead
 * 後方互換性のため残していますが、新規コードではapiClientを直接使用してください
 */
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const method = (options.method || 'GET') as 'GET' | 'POST' | 'PUT' | 'DELETE'
  const body = options.body

  return apiClient.request(endpoint, { method, body })
}

/**
 * @deprecated Use apiClient.get/post/put/delete() with token parameter instead
 * 後方互換性のため残していますが、新規コードではapiClientを直接使用してください
 */
export const authenticatedApiCall = async (endpoint: string, token: string, options: RequestInit = {}) => {
  const method = (options.method || 'GET') as 'GET' | 'POST' | 'PUT' | 'DELETE'
  const body = options.body

  return apiClient.authenticatedRequest(endpoint, token, { method, body })
}

/**
 * @deprecated Use apiClient.delete() instead
 */
export const logoutApi = async (token: string) => {
  return apiClient.authenticatedRequest('/api/v1/auth/logout', token, { method: 'DELETE' })
}