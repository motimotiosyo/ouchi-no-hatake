'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginFormData } from '@/lib/validation'
import { apiClient } from '@/services/apiClient'
import { useAuthContext as useAuth } from '@/contexts/auth'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ForgotPasswordModal from '@/components/auth/ForgotPasswordModal'
import type { User } from '@/types/auth'

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false)

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
      const result = await apiClient.post<{
        message: string
        token: string
        user: User
      }>(
        '/api/v1/auth/login',
        data
      )

      if (result.success) {
        console.log('🔐 ログイン成功:', result)

        // useAuthのlogin関数を使ってJWT保存
        login(result.data.token, result.data.user)

        // ログイン成功時の遷移（フラッシュメッセージ付き）
        window.location.href = '/?flash_message=' + encodeURIComponent('ログインしました') + '&flash_type=success'
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
              <p>{apiError}</p>
              <div className="mt-3 pt-3 border-t border-red-200 text-sm text-gray-700">
                <p className="font-medium mb-2">ログインできない場合:</p>
                <ul className="text-left space-y-1 text-xs">
                  <li>• メールアドレス、パスワードをご確認ください</li>
                  <li>• パスワードを忘れた方は下記のリンクからリセットできます</li>
                  <li>• 初めての方は新規登録をお試しください</li>
                </ul>
              </div>
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
            <button
              type="button"
              onClick={() => setIsForgotPasswordModalOpen(true)}
              className="text-green-600 hover:text-green-500 text-sm"
            >
              パスワードを忘れた方はこちら
            </button>
          </div>

          {/* 新規登録リンク */}
          <div className="text-center mt-3">
            <span className="text-gray-600 text-sm">アカウントをお持ちでない方は</span>
            <Link 
              href="/signup"
              className="text-green-600 hover:text-green-500 text-sm font-medium ml-1"
            >
              新規登録
            </Link>
          </div>
        </form>
      </div>
      <ForgotPasswordModal
        isOpen={isForgotPasswordModalOpen}
        onClose={() => setIsForgotPasswordModalOpen(false)}
      />
    </div>
  )
}