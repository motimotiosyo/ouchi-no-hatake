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
 * APIエラー詳細
 */
export interface ApiErrorDetail {
  message: string
  code?: string
  details?: string[]
}

/**
 * APIエラーレスポンス
 */
export interface ApiErrorResponse {
  success: false
  error: ApiErrorDetail
  meta?: Record<string, unknown>
}

/**
 * API結果型（成功/失敗を明確に区別）
 */
export type ApiResult<T> =
  | (ApiResponse<T> & { success: true })
  | (ApiErrorResponse & { success: false })

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
