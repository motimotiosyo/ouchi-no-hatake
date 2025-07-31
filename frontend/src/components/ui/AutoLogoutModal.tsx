'use client'

import { useEffect, useState } from 'react'

interface AutoLogoutModalProps {
  isOpen: boolean
  message: string
  onConfirm: () => void
}

export default function AutoLogoutModal({ isOpen, message, onConfirm }: AutoLogoutModalProps) {
  const [countdown, setCountdown] = useState(10)

  useEffect(() => {
    if (!isOpen) {
      setCountdown(10)
      return
    }

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          onConfirm()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isOpen, onConfirm])

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)'
      }}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
        <div className="p-6">
          {/* アイコン */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>

          {/* メッセージ */}
          <div className="text-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              セッション終了
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              {message}
            </p>
            <p className="text-sm text-gray-500">
              {countdown}秒後にログイン画面に移動します
            </p>
          </div>

          {/* プログレスバー */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className="bg-orange-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${((10 - countdown) / 10) * 100}%` }}
            />
          </div>

          {/* ボタン */}
          <div className="flex justify-center">
            <button
              onClick={onConfirm}
              className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
            >
              今すぐログイン画面へ
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}