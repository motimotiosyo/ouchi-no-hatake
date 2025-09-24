'use client'

import { ReactNode } from 'react'
import { AuthProvider as BaseAuthProvider } from './AuthContext'
import { AuthActionsProvider } from './AuthActionsContext'
import { TokenManagerProvider } from './TokenManagerContext'
import { AuthMessageProvider } from './AuthMessageContext'

// 全てのAuthContextを統合するProvider
export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <AuthMessageProvider>
      <BaseAuthProvider>
        <TokenManagerProvider>
          <AuthActionsProvider>
            {children}
          </AuthActionsProvider>
        </TokenManagerProvider>
      </BaseAuthProvider>
    </AuthMessageProvider>
  )
}

// 互換性維持のため、全ての機能を統合したhookも提供
export { useAuth } from './AuthContext'
export { useAuthActions } from './AuthActionsContext'
export { useTokenManager } from './TokenManagerContext'
export { useAuthMessage } from './AuthMessageContext'