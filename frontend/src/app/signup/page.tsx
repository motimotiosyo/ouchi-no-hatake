'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, type RegisterFormData } from '@/lib/validation'
import { apiClient } from '@/services/apiClient'
import { useAuthContext as useAuth } from '@/contexts/auth'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { User } from '@/types/auth'

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const router = useRouter()

  const { login } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema)
  })

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    setApiError(null)

    try {
      const result = await apiClient.post<{
        message: string
        token: string
        user: User
        requires_verification?: boolean
      }>(
        '/api/v1/auth/register',
        { user: data }
      )

      if (result.success) {
        console.log('📝 新規登録成功:', result)

        // バックエンドがrequires_verification: trueを返す場合
        if (result.data.requires_verification) {
          // メール認証が必要な場合は案内画面へ遷移
          router.push(`/signup-success?email=${encodeURIComponent(result.data.user.email)}`)
        } else {
          // 古いフロー（念のため残す）- 即座にログイン
          login(result.data.token, result.data.user)
          window.location.href = '/?flash_message=' + encodeURIComponent('新規登録が完了しました') + '&flash_type=success'
        }
      } else {
        setApiError(result.error.message)
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
          <h2>新規登録</h2>
        </div>
        <form className="auth-form-content" onSubmit={handleSubmit(onSubmit)}>
          <div className="auth-input-group">
            {/* 名前 */}
            <div className="auth-input-field">
              <label htmlFor="name">名前</label>
              <input
                {...register('name')}
                type="text"
                placeholder="山田太郎"
              />
              {errors.name && (
                <p className="auth-error">{errors.name.message}</p>
              )}
            </div>

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
              {isLoading ? '登録中...' : '新規登録'}
            </button>
          </div>

          {/* ログインリンク */}
          <div className="text-center mt-4">
            <span className="text-gray-600 text-sm">すでにアカウントをお持ちの方は</span>
            <Link 
              href="/login"
              className="text-green-600 hover:text-green-500 text-sm font-medium ml-1"
            >
              ログイン
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}