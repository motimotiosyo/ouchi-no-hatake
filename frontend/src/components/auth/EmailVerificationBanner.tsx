'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext as useAuth } from '@/contexts/auth'

interface EmailVerificationBannerProps {
  email: string
}

export default function EmailVerificationBanner({ email }: EmailVerificationBannerProps) {
  const router = useRouter()
  const { resendVerification } = useAuth()
  const [isDismissed, setIsDismissed] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [resendMessage, setResendMessage] = useState<string>('')

  if (isDismissed) {
    return null
  }

  const handleResend = async () => {
    setIsResending(true)
    setResendMessage('')

    try {
      const result = await resendVerification(email)
      if (result.success) {
        setResendMessage('認証メールを再送信しました')
      } else {
        setResendMessage(result.error?.message || '再送信に失敗しました')
      }
    } catch {
      setResendMessage('予期しないエラーが発生しました')
    } finally {
      setIsResending(false)
    }
  }

  const handleGoToResendPage = () => {
    router.push('/resend-verification')
  }

  const handleDismiss = () => {
    setIsDismissed(true)
  }

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800">メールアドレスの認証が必要です</h3>
          <div className="mt-1 text-sm text-yellow-700">
            <p>
              <strong>{email}</strong> 宛に送信した認証メールをご確認ください。
              メールを確認して認証を完了すると、全ての機能をご利用いただけます。
            </p>
          </div>
          
          {resendMessage && (
            <div className={`mt-2 text-sm ${
              resendMessage.includes('再送信しました') 
                ? 'text-green-700' 
                : 'text-red-700'
            }`}>
              {resendMessage}
            </div>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={handleResend}
              disabled={isResending}
              className="text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded-md hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50"
            >
              {isResending ? '送信中...' : '認証メールを再送信'}
            </button>
            
            <button
              onClick={handleGoToResendPage}
              className="text-sm bg-white text-yellow-800 px-3 py-1 rounded-md border border-yellow-300 hover:bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              再送信ページへ
            </button>
          </div>
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              onClick={handleDismiss}
              className="inline-flex rounded-md bg-yellow-50 p-1.5 text-yellow-500 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-offset-2 focus:ring-offset-yellow-50"
            >
              <span className="sr-only">閉じる</span>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}