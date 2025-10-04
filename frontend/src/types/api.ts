// API共通型定義

/**
 * 統一APIレスポンス形式
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  meta?: Record<string, unknown>
}

/**
 * APIエラーレスポンス
 */
export interface ApiErrorResponse {
  success: false
  error: {
    message: string
    code?: string
    details?: string[]
  }
}

/**
 * APIエラークラス
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string,
    public details?: string[]
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * HTTPメソッド
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

/**
 * APIリクエスト設定
 */
export interface ApiRequestConfig {
  method?: HttpMethod
  headers?: Record<string, string>
  body?: unknown
  params?: Record<string, string | number | boolean>
}

/**
 * 認証が必要なAPIリクエスト設定
 */
export interface AuthenticatedApiRequestConfig extends ApiRequestConfig {
  requireAuth?: boolean
}
