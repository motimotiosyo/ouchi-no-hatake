'use client'

import { apiClient } from '@/services/apiClient'
import { useState } from 'react'
import { createPortal } from 'react-dom'

interface EmailVerificationModalProps {
  isOpen: boolean
  onClose: () => void
  email: string
}

export default function EmailVerificationModal({ isOpen, onClose, email }: EmailVerificationModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [resendMessage, setResendMessage] = useState<string>('')

  const handleClose = () => {
    setResendMessage('')
    onClose()
  }

  const handleResendEmail = async () => {
    if (!email.trim()) {
      setResendMessage('メールアドレスが設定されていません')
      return
    }

    setIsLoading(true)
    setResendMessage('')

    try {
      const result = await apiClient.post<{ message: string }>(
        '/api/v1/auth/resend-verification',
        { email }
      )

      if (result.success) {
        setResendMessage('認証メールを再送信しました')
      } else {
        setResendMessage(result.error.message)
      }
    } catch {
      setResendMessage('ネットワークエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen || typeof document === 'undefined') return null

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)'
      }}
      onClick={handleClose}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          {/* ヘッダー */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              仮登録完了
            </h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* メール送信完了画面 */}
          <div>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
              </div>
            </div>
            <div className="mb-6">
              <p className="text-gray-700 mb-4 font-medium text-center">
                確認メールを送信しました
              </p>
              {email && (
                <div className="text-sm text-gray-600 mb-4 text-center">
                  <p className="break-all">{email}</p>
                  <p>宛に確認メールを送信しました。</p>
                </div>
              )}
              <div className="text-sm text-gray-600 space-y-2 text-left">
                <p>・メールボックスをご確認ください</p>
                <p>・メール内のリンクをクリックして認証を完了してください</p>
                <p>・メール認証リンクの有効期限は24時間です</p>
              </div>
            </div>

            {/* 重要な注意事項 */}
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
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

            {/* 再送信メッセージ */}
            {resendMessage && (
              <div className={`mb-4 p-3 rounded-md text-sm ${
                resendMessage.includes('再送信しました')
                  ? 'bg-green-100 text-green-700 border border-green-200'
                  : 'bg-red-100 text-red-700 border border-red-200'
              }`}>
                {resendMessage}
              </div>
            )}

            {/* 再送信ボタン */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-900 mb-3">
                メールが届かない場合
              </p>
              <button
                onClick={handleResendEmail}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '送信中...' : '認証メールを再送信'}
              </button>
              <div className="mt-3 text-xs text-gray-500 text-left space-y-1">
                <p>・迷惑メールフォルダもご確認ください</p>
                <p>・メールアドレスに間違いがないかご確認ください</p>
              </div>
            </div>

            {/* 閉じるボタン */}
            <button
              onClick={handleClose}
              className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
