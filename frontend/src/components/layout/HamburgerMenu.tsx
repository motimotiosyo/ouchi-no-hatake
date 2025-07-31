'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useApi } from '@/hooks/useApi'

interface HamburgerMenuProps {
  isOpen: boolean
  onClose: () => void
}

export default function HamburgerMenu({ isOpen, onClose }: HamburgerMenuProps) {
  const { user } = useAuth()
  const { logout } = useApi()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  

  const handleLogout = async () => {
    // ログアウトはJWT期限切れでも実行するため、直接処理
    try {
      setIsLoggingOut(true)
      console.log('ログアウト開始')
      
      // 1. APIログアウト呼び出し
      await logout()
      console.log('ログアウトAPI成功')
      
    } catch (error) {
      console.error('ログアウトAPIエラー:', error)
    }
    
    // 2. 確実にローカル状態をクリア（API成功・失敗に関わらず）
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    
    // 3. Cookieもクリア
    document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; secure=true; samesite=none'
    document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
    document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    
    console.log('ローカル状態クリア完了')
    setIsLoggingOut(false)
    
    // 4. フラッシュメッセージ付きでタイムライン（ルートページ）にリダイレクト
    window.location.href = '/?flash_message=' + encodeURIComponent('ログアウトしました') + '&flash_type=success'
  }

  if (!isOpen) return null

  return (
    <>
      {/* 薄暗いオーバーレイ - メニュー外クリックで閉じる */}
      <div 
        className="fixed inset-0 z-40"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'brightness(0.7)'
        }}
        onClick={onClose}
      />
      
      {/* メニュー */}
      <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">メニュー</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ユーザー情報 */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-lg">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-900">{user?.name || 'ユーザー'}</p>
              <p className="text-sm text-gray-500">{user?.email || ''}</p>
            </div>
          </div>
        </div>

        {/* メニューアイテム */}
        <div className="py-2">
          {/* アカウント設定 */}
          <button
            disabled
            className="flex items-center px-4 py-3 text-gray-400 cursor-not-allowed w-full text-left"
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            アカウント設定（準備中）
          </button>

          {/* 通知設定 */}
          <button
            disabled
            className="flex items-center px-4 py-3 text-gray-400 cursor-not-allowed w-full text-left"
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-3.12-3.12A3.945 3.945 0 0116 11.5a4 4 0 10-7.56 1.38L15 17z" />
            </svg>
            通知設定（準備中）
          </button>

          <hr className="my-2" />

          {/* ヘルプ・サポート */}
          <button
            disabled
            className="flex items-center px-4 py-3 text-gray-400 cursor-not-allowed w-full text-left"
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            ヘルプ・サポート（準備中）
          </button>

          {/* お問い合わせ */}
          <a
            href="/contact"
            className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100"
            onClick={onClose}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            お問い合わせ
          </a>

          <hr className="my-2" />

          {/* 利用規約 */}
          <a
            href="/terms-of-service"
            className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100"
            onClick={onClose}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            利用規約
          </a>

          {/* プライバシーポリシー */}
          <a
            href="/privacy-policy"
            className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100"
            onClick={onClose}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            プライバシーポリシー
          </a>

          <hr className="my-2" />

          {/* ログアウト */}
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {isLoggingOut ? 'ログアウト中...' : 'ログアウト'}
          </button>
        </div>
      </div>
    </>
  )
}