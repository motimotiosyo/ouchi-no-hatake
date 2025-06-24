'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useApi } from '@/hooks/useApi'
import { useState } from 'react'

export default function DashboardPage() {
  const { user, logout: authLogout } = useAuth()
  const { logout: apiLogout } = useApi()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)

    try {
      // バックエンドAPIでログアウト
      await apiLogout()
      console.log('サーバーサイドログアウト成功')
    } catch (error) {
      console.error('サーバーサイドログアウトエラー:', error)
      // エラーが発生してもローカルのログアウトは実行
    } finally {
      // ローカルの認証状態をクリア
      authLogout()
      window.location.href = '/login'
    }
  }

  return (
    <div className="min-h-screen py-8">  {/* bg-gray-50を削除 */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            ダッシュボード
          </h1>

          {user && (
            <div className="mb-6">
              <p className="text-gray-600">
                ようこそ、{user.name}さん！（{user.email}）
              </p>
            </div>
          )}

          <p className="text-gray-600 mb-6">
            ログインに成功しました！現在認証状態です。
          </p>

          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  JWT管理機能が動作中
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>ページを更新しても認証状態が維持されます。</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              {isLoggingOut ? 'ログアウト中...' : 'ログアウト'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}