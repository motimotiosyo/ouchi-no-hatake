'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginFormData } from '@/lib/validation'
import { apiCall } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

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

    try {
      const response = await apiCall('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify(data)
      })

      if (response.ok) {
        const result = await response.json()
        console.log('ログイン成功:', result)

        // useAuthのlogin関数を使ってJWT保存
        login(result.token, result.user)
        // TODO: JWT保存とダッシュボードリダイレクト
        window.location.href = '/dashboard'
      } else {
        const error = await response.json()
        setApiError(error.message || 'ログインに失敗しました')
      }
    } catch {
      setApiError('ネットワークエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
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
        </form>
      </div>
    </div>
  )
}