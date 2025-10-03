// 認証関連の共通型定義

// 統一APIレスポンス形式
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  meta?: Record<string, unknown>
}

export interface ApiErrorResponse {
  success: false
  error: {
    message: string
    code?: string
    details?: string[]
  }
}

// ユーザー情報の型定義
export interface User {
  id: number
  email: string
  name: string
  email_verified?: boolean
}

// API関連の結果型（新形式対応）
export interface VerificationResult extends ApiResponse<{
  message: string
  token?: string
  user?: User
}> {
  expired?: boolean
}

export interface ResendResult extends ApiResponse<{
  message: string
}> {}

// 認証レスポンス型
export interface AuthResponse extends ApiResponse<{
  message: string
  token: string
  user: User
}> {}

export interface UserResponse extends ApiResponse<{
  user: User
}> {}

// 基本認証状態の型定義
export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

// 認証アクションの型定義
export interface AuthActions {
  login: (token: string, user: User) => void
  logout: () => void
  setToken: (token: string | null) => void
  verifyEmail: (token: string) => Promise<VerificationResult>
  resendVerification: (email: string) => Promise<ResendResult>
}

// JWT・セッション管理の型定義
export interface TokenManager {
  checkTokenValidity: () => boolean
  updateLastActivity: () => void
  executeProtected: (action: () => void) => void
  executeProtectedAsync: (action: () => Promise<void>) => Promise<void>
}

// メッセージ・UI状態管理の型定義
export interface AuthMessage {
  autoLogoutMessage: string | null
  showAutoLogoutModal: boolean
  redirectMessage: string | null
  clearAutoLogoutMessage: () => void
  confirmAutoLogout: () => void
  setRedirectMessage: (message: string | null) => void
  clearRedirectMessage: () => void
}

// 統合された認証コンテキストの型定義（互換性維持用）
export interface AuthContextType extends AuthState, AuthActions, TokenManager, AuthMessage {}