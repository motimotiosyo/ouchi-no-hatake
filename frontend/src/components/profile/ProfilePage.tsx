'use client'

import { useState } from 'react'
import { useAuthContext as useAuth } from '@/contexts/auth'
import PostsTab from './PostsTab'
import GrowthRecordsTab from './GrowthRecordsTab'

type TabType = 'posts' | 'growth-records'

export default function ProfilePage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<TabType>('posts')

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">ユーザー情報を読み込み中...</div>
      </div>
    )
  }

  return (
    <div>
      {/* ユーザー情報ヘッダー */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-start gap-4">
          {/* アバター */}
          <div className="flex-shrink-0">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.name}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500 text-2xl font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* ユーザー情報 */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{user.name}</h1>
            <p className="text-gray-500 text-sm mb-3">{user.email}</p>
            {user.bio && (
              <p className="text-gray-700 whitespace-pre-wrap">{user.bio}</p>
            )}
          </div>
        </div>
      </div>

      {/* タブナビゲーション */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex gap-8">
          <button
            onClick={() => setActiveTab('posts')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'posts'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            投稿一覧
          </button>
          <button
            onClick={() => setActiveTab('growth-records')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'growth-records'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            成長記録一覧
          </button>
        </nav>
      </div>

      {/* タブコンテンツ */}
      {activeTab === 'posts' && <PostsTab userId={user.id} />}
      {activeTab === 'growth-records' && <GrowthRecordsTab />}
    </div>
  )
}
