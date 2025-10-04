import Logger from '@/utils/logger'
import { ApiResponse, ApiErrorResponse, ApiError, AuthenticatedApiRequestConfig } from '@/types/api'

// API設定
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'

/**
 * 統一APIクライアント
 *
 * 機能:
 * - 自動JWT認証
 * - 統一エラーハンドリング
 * - 型安全なレスポンス処理
 * - JWT期限切れ自動検知
 */
class ApiClient {
  private autoLogoutCallback: (() => void) | null = null

  /**
   * 自動ログアウトコールバックを設定
   */
  setAutoLogoutCallback(callback: () => void): void {
    this.autoLogoutCallback = callback
  }

  /**
   * 認証不要のAPIリクエスト
   */
  async request<T = unknown>(
    endpoint: string,
    options: AuthenticatedApiRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`
    const method = options.method || 'GET'

    const defaultHeaders: Record<string, string> = {}

    // FormDataの場合はContent-Typeを設定しない（ブラウザに自動設定させる）
    if (!(options.body instanceof FormData)) {
      defaultHeaders['Content-Type'] = 'application/json'
    }

    try {
      const response = await fetch(url, {
        method,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
        body: this.prepareBody(options.body),
        credentials: 'include',
      })

      return await this.handleResponse<T>(response)
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * 認証付きAPIリクエスト（JWT自動付与）
   */
  async authenticatedRequest<T = unknown>(
    endpoint: string,
    token: string,
    options: AuthenticatedApiRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`
    const method = options.method || 'GET'
    const startTime = Date.now()

    Logger.apiCall(method, endpoint)

    const defaultHeaders: Record<string, string> = {
      'Authorization': `Bearer ${token}`,
    }

    // FormDataの場合はContent-Typeを設定しない（ブラウザに自動設定させる）
    if (!(options.body instanceof FormData)) {
      defaultHeaders['Content-Type'] = 'application/json'
    }

    try {
      const response = await fetch(url, {
        method,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
        body: this.prepareBody(options.body),
        credentials: 'include',
      })

      const duration = Date.now() - startTime
      Logger.apiCall(method, endpoint, response.status, duration)

      // JWT期限切れ検知（422エラー + "Signature has expired"）
      await this.checkJwtExpiration(response)

      return await this.handleResponse<T>(response)
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * JWT期限切れをチェック
   */
  private async checkJwtExpiration(response: Response): Promise<void> {
    if (response.status === 422) {
      try {
        const errorData = await response.clone().json()
        if (errorData.message === 'Signature has expired') {
          Logger.auth('JWT token expired detected via API response')

          // 自動ログアウトを実行
          if (this.autoLogoutCallback) {
            this.autoLogoutCallback()
          }

          throw new ApiError('JWT_EXPIRED', 422, 'JWT_EXPIRED')
        }
      } catch (error) {
        // JSONパースに失敗した場合、またはJWT_EXPIREDエラーの場合は再スロー
        if (error instanceof ApiError) {
          throw error
        }
        // その他のエラーは無視して通常のレスポンス処理へ
      }
    }
  }

  /**
   * レスポンスを処理
   */
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
      const errorData: ApiErrorResponse = await response.json()
      throw new ApiError(
        errorData.error?.message || 'An error occurred',
        response.status,
        errorData.error?.code,
        errorData.error?.details
      )
    }

    const data: ApiResponse<T> = await response.json()
    return data
  }

  /**
   * エラーを処理
   */
  private handleError(error: unknown): ApiError {
    if (error instanceof ApiError) {
      return error
    }

    if (error instanceof Error) {
      return new ApiError(error.message)
    }

    return new ApiError('Unknown error occurred')
  }

  /**
   * リクエストボディを準備
   */
  private prepareBody(body: unknown): BodyInit | undefined {
    if (!body) {
      return undefined
    }

    if (body instanceof FormData) {
      return body
    }

    if (typeof body === 'object') {
      return JSON.stringify(body)
    }

    return body as BodyInit
  }
}

// シングルトンインスタンス
export const apiClient = new ApiClient()

// 互換性のためのヘルパー関数（既存コードとの互換性維持）
export const setAutoLogoutCallback = (callback: () => void) => {
  apiClient.setAutoLogoutCallback(callback)
}

export { API_BASE_URL }
