// 認証関連の共通型定義
import { ApiResult } from './api'
import { ID } from './common'

// ユーザー情報の型定義
export interface User {
  id: ID
  email: string
  name: string
  bio?: string
  avatar_url?: string
  email_verified?: boolean
  created_at?: string
  following_count?: number
  followers_count?: number
}

// 他者プロフィール表示用（メールアドレスはオプショナル）
export interface UserProfile {
  id: ID
  name: string
  bio?: string
  avatar_url?: string
  email?: string  // 本人の場合のみ含まれる
  created_at: string
  following_count: number
  followers_count: number
  is_following?: boolean  // ログインユーザーの場合のみ含まれる
}

// API関連の結果型（統一形式）
export type VerificationResult = ApiResult<{
  message: string
  token?: string
  user?: User
}>

export type ResendResult = ApiResult<{
  message: string
}>

// 認証レスポンス型
export type AuthResponse = ApiResult<{
  message: string
  token: string
  user: User
  requires_verification?: boolean
}>

export type UserResponse = ApiResult<{
  user: User
}>

// 基本認証状態の型定義
export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  refreshUser: () => Promise<void>
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