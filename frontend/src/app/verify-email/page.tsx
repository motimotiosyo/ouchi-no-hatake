'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthContext as useAuth } from '@/contexts/auth'

// Dynamic rendering を強制する
export const dynamic = 'force-dynamic'

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { verifyEmail, resendVerification } = useAuth()
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [isResending, setIsResending] = useState(false)

  useEffect(() => {
    const token = searchParams.get('token')
    
    if (!token) {
      setStatus('error')
      setErrorMessage('認証トークンが見つかりません')
      return
    }

    // メール認証を実行
    const performVerification = async () => {
      try {
        const result = await verifyEmail(token)
        
        if (result.success) {
          setStatus('success')
          // 3秒後にタイムラインへリダイレクト
          setTimeout(() => {
            router.push('/')
          }, 3000)
        } else {
          if (result.expired) {
            setStatus('expired')
          } else {
            setStatus('error')
          }
          setErrorMessage(result.error?.message || '認証に失敗しました')
        }
      } catch {
        setStatus('error')
        setErrorMessage('予期しないエラーが発生しました')
      }
    }

    performVerification()
  }, [searchParams, verifyEmail, router])

  const handleResendEmail = async () => {
    if (!email.trim()) {
      alert('メールアドレスを入力してください')
      return
    }

    setIsResending(true)
    try {
      const result = await resendVerification(email)
      if (result.success) {
        alert('認証メールを再送信しました。メールボックスをご確認ください。')
      } else {
        alert(result.error || '再送信に失敗しました')
      }
    } catch {
      alert('予期しないエラーが発生しました')
    } finally {
      setIsResending(false)
    }
  }

  const handleBackToSignup = () => {
    router.push('/signup')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          メールアドレス認証
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          
          {status === 'loading' && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">認証を確認中...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">認証完了</h3>
              <p className="mt-2 text-sm text-gray-600">
                メールアドレスの認証が完了しました。<br />
                3秒後にタイムラインへ移動します...
              </p>
              <button
                onClick={() => router.push('/')}
                className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                今すぐタイムラインへ
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">認証エラー</h3>
              <p className="mt-2 text-sm text-gray-600">{errorMessage}</p>
              
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">認証メールを再送信</h4>
                <input
                  type="email"
                  placeholder="メールアドレス"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
                <button
                  onClick={handleResendEmail}
                  disabled={isResending}
                  className="mt-3 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isResending ? '送信中...' : '認証メール再送信'}
                </button>
              </div>
            </div>
          )}

          {status === 'expired' && (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
                <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">認証期限切れ</h3>
              <p className="mt-2 text-sm text-gray-600">
                {errorMessage}<br />
                <strong>再登録が必要です</strong>
              </p>
              <button
                onClick={handleBackToSignup}
                className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                新規登録画面へ戻る
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}