'use client'

import { GoogleLogin, type CredentialResponse } from '@react-oauth/google'
import { apiClient } from '@/services/apiClient'
import { useAuthContext as useAuth } from '@/contexts/auth'
import type { OAuthAuthResponse } from '@/types/api'
import { useState } from 'react'

interface GoogleLoginButtonProps {
  onError?: (error: string) => void
}

export default function GoogleLoginButton({ onError }: GoogleLoginButtonProps) {
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      onError?.('Google認証に失敗しました')
      return
    }

    setIsLoading(true)

    try {
      const result = await apiClient.post<OAuthAuthResponse>(
        '/api/v1/auth/google/callback',
        { credential: credentialResponse.credential }
      )

      if (result.success) {
        // JWT保存とユーザー情報設定
        login(result.data.token, result.data.user)

        // ログイン成功時の遷移
        window.location.href = '/?flash_message=' + encodeURIComponent('Googleログインしました') + '&flash_type=success'
      } else {
        onError?.(result.error.message)
      }
    } catch {
      onError?.('ネットワークエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleError = () => {
    onError?.('Google認証がキャンセルされました')
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-2">
        <span className="text-gray-500">認証中...</span>
      </div>
    )
  }

  return (
    <div className="flex justify-center">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        size="large"
        text="continue_with"
        shape="rectangular"
        logo_alignment="left"
      />
    </div>
  )
}
