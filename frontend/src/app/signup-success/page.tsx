'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function SignupSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { resendVerification } = useAuth()
  
  const [email, setEmail] = useState<string>('')
  const [isResending, setIsResending] = useState(false)
  const [resendMessage, setResendMessage] = useState<string>('')

  useEffect(() => {
    // URLパラメータからメールアドレスを取得
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(emailParam)
    }
  }, [searchParams])

  const handleResendEmail = async () => {
    if (!email.trim()) {
      setResendMessage('メールアドレスが設定されていません')
      return
    }

    setIsResending(true)
    setResendMessage('')
    
    try {
      const result = await resendVerification(email)
      if (result.success) {
        setResendMessage('認証メールを再送信しました。メールボックスをご確認ください。')
      } else {
        setResendMessage(result.error || '再送信に失敗しました')
      }
    } catch (error) {
      setResendMessage('予期しないエラーが発生しました')
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
          ユーザー登録完了
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          
          <div className="text-center">
            {/* 成功アイコン */}
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
            </div>

            <h3 className="mt-4 text-lg font-medium text-gray-900">
              確認メールを送信しました
            </h3>
            
            {email && (
              <p className="mt-2 text-sm text-gray-600">
                <strong>{email}</strong> 宛に確認メールを送信しました。
              </p>
            )}
            
            <div className="mt-4 text-sm text-gray-600 space-y-2">
              <p>📧 メールボックスをご確認ください</p>
              <p>🔗 メール内のリンクをクリックして認証を完了してください</p>
              <p>⏰ メール認証リンクの有効期限は<strong>24時間</strong>です</p>
            </div>

            {/* 重要な注意事項 */}
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-yellow-800">重要</h4>
                  <div className="mt-1 text-sm text-yellow-700">
                    <p>メール認証が完了するまでログインできません。</p>
                    <p>期限が過ぎた場合は、再度登録が必要になります。</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 再送信セクション */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                メールが届かない場合
              </h4>
              
              {resendMessage && (
                <div className={`mb-4 p-3 rounded-md text-sm ${
                  resendMessage.includes('再送信しました') 
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : 'bg-red-100 text-red-700 border border-red-200'
                }`}>
                  {resendMessage}
                </div>
              )}

              <button
                onClick={handleResendEmail}
                disabled={isResending || !email}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResending ? '送信中...' : '認証メールを再送信'}
              </button>

              <div className="mt-4 text-xs text-gray-500 space-y-1">
                <p>• 迷惑メールフォルダもご確認ください</p>
                <p>• メールアドレスに間違いがないかご確認ください</p>
              </div>
            </div>

            {/* ナビゲーションボタン */}
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
          </div>
        </div>
      </div>
    </div>
  )
}