'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, type RegisterFormData } from '@/lib/validation'
import { apiCall } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

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
      const response = await apiCall('/api/v1/auth/register', {
        method: 'POST',
        body: JSON.stringify({ user: data })
      })

      if (response.ok) {
        const result = await response.json()
        console.log('📝 新規登録成功:', result)

        // useAuthのlogin関数を使ってJWT保存
        login(result.token, result.user)
        
        // Next.jsのrouterを使用してダッシュボードにリダイレクト
        router.push('/dashboard')
      } else {
        const error = await response.json()
        setApiError(error.message || '新規登録に失敗しました')
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
        </form>
      </div>
    </div>
  )
}