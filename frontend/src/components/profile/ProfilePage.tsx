'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext as useAuth } from '@/contexts/auth'
import PostsTab from './PostsTab'
import FavoriteGrowthRecordsTab from './FavoriteGrowthRecordsTab'
import EditProfileModal from './EditProfileModal'

type TabType = 'posts_all' | 'posts_growth_record' | 'posts_general' | 'favorites'

export default function ProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('posts_all')

  const handleEditSuccess = () => {
    // モーダル閉じた後、ユーザー情報は自動的に更新される（AuthContextが再取得）
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">ユーザー情報を読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
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
            <div className="flex justify-between items-start mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="px-4 py-2 text-sm text-orange-600 bg-orange-50 rounded hover:bg-orange-100 transition-colors"
              >
                編集
              </button>
            </div>

            {/* フォロー数・フォロワー数 */}
            {(user.following_count !== undefined || user.followers_count !== undefined) && (
              <div className="flex gap-4 mb-3">
                <button
                  onClick={() => router.push(`/users/${user.id}/following`)}
                  className="text-sm hover:underline"
                >
                  <span className="font-semibold">{user.following_count || 0}</span> フォロー中
                </button>
                <button
                  onClick={() => router.push(`/users/${user.id}/followers`)}
                  className="text-sm hover:underline"
                >
                  <span className="font-semibold">{user.followers_count || 0}</span> フォロワー
                </button>
              </div>
            )}

            <p className="text-gray-500 text-sm mb-3">{user.email}</p>
            {user.created_at && (
              <p className="text-gray-500 text-sm mb-3">
                登録日: {new Date(user.created_at).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            )}
            {user.bio && (
              <p className="text-gray-700 whitespace-pre-wrap">{user.bio}</p>
            )}
          </div>
        </div>
      </div>

      {/* タブナビゲーション（スイッチ式） */}
      <div className="mb-6">
        <div className="flex rounded-lg border border-gray-300 p-1 bg-gray-100">
          <button
            onClick={() => setActiveTab('posts_all')}
            className={`flex-1 py-2 rounded-md font-medium text-sm transition-all ${
              activeTab === 'posts_all'
                ? 'bg-white text-green-600 shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            投稿全て
          </button>
          <button
            onClick={() => setActiveTab('posts_growth_record')}
            className={`flex-1 py-2 rounded-md font-medium text-sm transition-all ${
              activeTab === 'posts_growth_record'
                ? 'bg-white text-green-600 shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            成長メモ
          </button>
          <button
            onClick={() => setActiveTab('posts_general')}
            className={`flex-1 py-2 rounded-md font-medium text-sm transition-all ${
              activeTab === 'posts_general'
                ? 'bg-white text-green-600 shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            雑談
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex-1 py-2 rounded-md font-medium text-sm transition-all ${
              activeTab === 'favorites'
                ? 'bg-white text-green-600 shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📖 お気に入り
          </button>
        </div>
      </div>

      {/* タブコンテンツ */}
      <div className="mb-6">
        {activeTab === 'favorites' ? (
          <FavoriteGrowthRecordsTab userId={user.id} />
        ) : (
          <PostsTab
            userId={user.id}
            postType={
              activeTab === 'posts_all' ? 'all' :
              activeTab === 'posts_growth_record' ? 'growth_record_post' :
              'general_post'
            }
          />
        )}
      </div>

      {/* 編集モーダル */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleEditSuccess}
      />
    </div>
  )
}
