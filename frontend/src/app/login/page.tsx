'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginFormData } from '@/lib/validation'
import { apiCall } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [requiresVerification, setRequiresVerification] = useState(false)
  const [unverifiedEmail, setUnverifiedEmail] = useState<string>('')

  const { login } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setApiError(null)
    setRequiresVerification(false)
    setUnverifiedEmail('')

    try {
      const response = await apiCall('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify(data)
      })

      if (response.ok) {
        const result = await response.json()
        console.log('🔐 ログイン成功:', result)

        // useAuthのlogin関数を使ってJWT保存
        login(result.token, result.user)
        
        // ログイン成功時の遷移（フラッシュメッセージ付き）
        window.location.href = '/?flash_message=' + encodeURIComponent('ログインしました') + '&flash_type=success'
      } else {
        const error = await response.json()
        setApiError(error.message || error.error || 'ログインに失敗しました')
        
        // メール認証が必要な場合の処理
        if (error.requires_verification && error.email) {
          setRequiresVerification(true)
          setUnverifiedEmail(error.email)
        }
      }
    } catch {
      setApiError('ネットワークエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoToResendPage = () => {
    router.push(`/resend-verification?email=${encodeURIComponent(unverifiedEmail)}`)
  }

  return (
    <div className="auth-container">
      <div className="auth-form">
        <div>
          <h2>ログイン</h2>
        </div>
        <form className="auth-form-content" onSubmit={handleSubmit(onSubmit)}>
          <div className="auth-input-group">
            {/* メールアドレス */}
            <div className="auth-input-field">
              <label htmlFor="email">メールアドレス</label>
              <input
                {...register('email')}
                type="email"
                placeholder="example@email.com"
              />
              {errors.email && (
                <p className="auth-error">{errors.email.message}</p>
              )}
            </div>

            {/* パスワード */}
            <div className="auth-input-field">
              <label htmlFor="password">パスワード</label>
              <input
                {...register('password')}
                type="password"
                placeholder="6文字以上"
              />
              {errors.password && (
                <p className="auth-error">{errors.password.message}</p>
              )}
            </div>
          </div>

          {/* APIエラー表示 */}
          {apiError && (
            <div className="auth-api-error">
              {apiError}
              {/* メール認証が必要な場合のリンク表示 */}
              {requiresVerification && unverifiedEmail && (
                <div className="mt-3 text-center">
                  <button
                    type="button"
                    onClick={handleGoToResendPage}
                    className="text-blue-600 hover:text-blue-800 underline text-sm"
                  >
                    認証メールを再送信する
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 送信ボタン */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="auth-button"
            >
              {isLoading ? 'ログイン中...' : 'ログイン'}
            </button>
          </div>

          {/* パスワードリセットリンク */}
          <div className="text-center mt-4">
            <Link 
              href="/forgot-password"
              className="text-green-600 hover:text-green-500 text-sm"
            >
              パスワードを忘れた方はこちら
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}