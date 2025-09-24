'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthContext as useAuth } from '@/contexts/auth'

// バリデーションスキーマ
const resendVerificationSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください')
})

type ResendVerificationFormData = z.infer<typeof resendVerificationSchema>

// Dynamic rendering を強制する
export const dynamic = 'force-dynamic'

export default function ResendVerificationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { resendVerification } = useAuth()
  
  const [isResending, setIsResending] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [lastSentTime, setLastSentTime] = useState<number | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm<ResendVerificationFormData>({
    resolver: zodResolver(resendVerificationSchema)
  })

  // URLパラメータからメールアドレスを取得して自動設定
  useEffect(() => {
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setValue('email', emailParam)
    }
  }, [searchParams, setValue])

  const canResend = () => {
    if (!lastSentTime) return true
    const now = Date.now()
    const timeDiff = now - lastSentTime
    const waitTime = 60 * 1000 // 60秒
    return timeDiff >= waitTime
  }

  const getRemainingWaitTime = () => {
    if (!lastSentTime) return 0
    const now = Date.now()
    const timeDiff = now - lastSentTime
    const waitTime = 60 * 1000 // 60秒
    return Math.max(0, Math.ceil((waitTime - timeDiff) / 1000))
  }

  const onSubmit = async (data: ResendVerificationFormData) => {
    if (!canResend()) {
      const remainingTime = getRemainingWaitTime()
      setErrorMessage(`再送信は${remainingTime}秒後に可能です`)
      return
    }

    setIsResending(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const result = await resendVerification(data.email)
      
      if (result.success) {
        setSuccessMessage('認証メールを再送信しました。メールボックスをご確認ください。')
        setLastSentTime(Date.now())
      } else {
        setErrorMessage(result.error || '再送信に失敗しました')
      }
    } catch {
      setErrorMessage('予期しないエラーが発生しました')
    } finally {
      setIsResending(false)
    }
  }

  const handleBackToLogin = () => {
    router.push('/login')
  }

  const handleBackToSignup = () => {
    router.push('/signup')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          認証メール再送信
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          メールアドレスを入力して、認証メールを再送信してください
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* メールアドレス入力 */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                メールアドレス
              </label>
              <div className="mt-1">
                <input
                  {...register('email')}
                  type="email"
                  autoComplete="email"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="example@email.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
            </div>

            {/* 成功メッセージ */}
            {successMessage && (
              <div className="bg-green-100 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <div className="ml-3">
                    {successMessage}
                  </div>
                </div>
              </div>
            )}

            {/* エラーメッセージ */}
            {errorMessage && (
              <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </div>
                  <div className="ml-3">
                    {errorMessage}
                  </div>
                </div>
              </div>
            )}

            {/* 送信ボタン */}
            <div>
              <button
                type="submit"
                disabled={isResending || !canResend()}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResending ? '送信中...' : 
                 !canResend() ? `${getRemainingWaitTime()}秒後に送信可能` : 
                 '認証メールを再送信'}
              </button>
            </div>

            {/* 送信制限の説明 */}
            {!canResend() && (
              <div className="text-center text-sm text-gray-500">
                連続送信を防ぐため、60秒間お待ちください
              </div>
            )}
          </form>

          {/* ナビゲーションリンク */}
          <div className="mt-8 pt-6 border-t border-gray-200 space-y-3">
            <button
              onClick={handleBackToLogin}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              ログイン画面へ戻る
            </button>
            
            <button
              onClick={handleBackToSignup}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              新規登録画面へ戻る
            </button>
          </div>

          {/* 使用方法の説明 */}
          <div className="mt-6 text-center">
            <div className="text-xs text-gray-500 space-y-1">
              <p>• 登録時に使用したメールアドレスを入力してください</p>
              <p>• 迷惑メールフォルダもご確認ください</p>
              <p>• メール認証リンクの有効期限は24時間です</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}