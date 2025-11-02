'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { resetPasswordSchema, type ResetPasswordFormData } from '@/lib/validation'
import { apiClient } from '@/services/apiClient'
import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'


// Dynamic rendering を強制する
export const dynamic = 'force-dynamic'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [token, setToken] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema)
  })

  useEffect(() => {
    const urlToken = searchParams.get('token')
    if (urlToken) {
      setToken(urlToken)
    } else {
      setApiError('無効なリセットリンクです')
    }
  }, [searchParams])

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setApiError('リセットトークンが見つかりません')
      return
    }

    setIsLoading(true)
    setApiError(null)

    try {
      const result = await apiClient.put<{ message: string }>(
        '/api/v1/auth/reset_password',
        {
          token: token,
          password: data.password,
          password_confirmation: data.passwordConfirmation
        }
      )

      if (result.success) {
        setIsSuccess(true)
        // 3秒後にログインページにリダイレクト
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      } else {
        setApiError(result.error.message)
      }
    } catch {
      setApiError('ネットワークエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="auth-container">
        <div className="auth-form">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              パスワード更新完了
            </h2>
            <div className="mt-6 bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-800">
                    パスワードが正常に更新されました。<br />
                    新しいパスワードでログインできます。
                  </p>
                  <p className="text-xs text-green-600 mt-2">
                    3秒後にログインページに移動します...
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <Link 
                href="/login"
                className="text-green-600 hover:text-green-500 font-medium"
              >
                すぐにログインページに移動
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!token && !apiError) {
    return (
      <div className="auth-container">
        <div className="auth-form">
          <div className="text-center">
            <p className="text-gray-500">読み込み中...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-container">
      <div className="auth-form">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            新しいパスワードを設定
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            安全性の高いパスワードを設定してください
          </p>
        </div>

        {apiError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{apiError}</p>
                <div className="mt-3">
                  <Link 
                    href="/forgot-password"
                    className="text-sm text-red-600 hover:text-red-500 font-medium underline"
                  >
                    パスワードリセットを再申請する
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {!apiError && (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  新しいパスワード
                </label>
                <input
                  {...register('password')}
                  type="password"
                  autoComplete="new-password"
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                  placeholder="6文字以上のパスワード"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="passwordConfirmation" className="block text-sm font-medium text-gray-700">
                  パスワード確認
                </label>
                <input
                  {...register('passwordConfirmation')}
                  type="password"
                  autoComplete="new-password"
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                  placeholder="パスワードを再入力"
                />
                {errors.passwordConfirmation && (
                  <p className="mt-1 text-sm text-red-600">{errors.passwordConfirmation.message}</p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="auth-button disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '更新中...' : 'パスワードを更新'}
              </button>
            </div>

            <div className="text-center">
              <Link 
                href="/login"
                className="text-green-600 hover:text-green-500 font-medium"
              >
                ログインページに戻る
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}