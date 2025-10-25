'use client'

import { useState } from 'react'
import { useAuthContext as useAuth, useAuthActions } from '@/contexts/auth'

interface HamburgerMenuProps {
  isOpen: boolean
  onClose: () => void
}

export default function HamburgerMenu({ isOpen, onClose }: HamburgerMenuProps) {
  const { user } = useAuth()
  const { logout } = useAuthActions()
  const [isLoggingOut, setIsLoggingOut] = useState(false)


  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await logout()
      onClose() // ログアウト成功後にサイドバーを閉じる
    } catch (error) {
      console.error('ログアウトエラー:', error)
      setIsLoggingOut(false)
    }
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
          {/* マイページ */}
          <a
            href="/profile"
            className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100"
            onClick={onClose}
          >
            <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
            </svg>
            マイページ
          </a>

          {/* タイムライン */}
          <a
            href="/"
            className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100"
            onClick={onClose}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            タイムライン
          </a>

          {/* 成長記録 */}
          <a
            href="/growth-records"
            className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100"
            onClick={onClose}
          >
            <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v8a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm4 4a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
            成長記録
          </a>

          {/* 育て方ガイド */}
          <a
            href="/guides"
            className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100"
            onClick={onClose}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            育て方ガイド
          </a>

          {/* 野菜診断 */}
          <a
            href="/checker"
            className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100"
            onClick={onClose}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            野菜診断
          </a>

          <hr className="my-2 border-gray-200" />

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

          <hr className="my-2 border-gray-200" />

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