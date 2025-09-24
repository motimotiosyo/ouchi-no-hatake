// AuthContext統合エクスポート - 既存コードとの互換性維持

export { AuthProvider } from './AuthProvider'
export type { User, AuthContextType } from '@/types/auth'

// 個別hooks
export { useAuth } from './AuthContext'
export { useAuthActions } from './AuthActionsContext'
export { useTokenManager } from './TokenManagerContext'  
export { useAuthMessage } from './AuthMessageContext'

// 互換性維持のための統合hook
import { useAuth } from './AuthContext'
import { useAuthActions } from './AuthActionsContext'
import { useTokenManager } from './TokenManagerContext'
import { useAuthMessage } from './AuthMessageContext'
import { AuthContextType } from '@/types/auth'

export function useAuthContext(): AuthContextType {
  const auth = useAuth()
  const actions = useAuthActions()
  const tokenManager = useTokenManager()
  const messages = useAuthMessage()

  return {
    ...auth,
    ...actions,
    ...tokenManager,
    ...messages,
  }
}