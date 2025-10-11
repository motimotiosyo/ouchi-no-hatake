'use client'

import { useState, useEffect } from 'react'
import { useAuthContext as useAuth } from '@/contexts/auth'
import { useRouter } from 'next/navigation'
import PostsTab from './PostsTab'
import FollowButton from '../users/FollowButton'
import type { UserProfile } from '@/types'
import { apiClient } from '@/services/apiClient'

type PostTypeFilter = 'all' | 'growth_record_post' | 'general_post'

interface UserProfilePageProps {
  userId: number
}

export default function UserProfilePage({ userId }: UserProfilePageProps) {
  const { user: currentUser } = useAuth()
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<PostTypeFilter>('all')

  const fetchUser = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('auth_token')
      const result = await apiClient.getUser(userId, token || undefined)

      if (result.success) {
        setUser(result.data.user)
      } else {
        setError(result.error.message)
      }
    } catch {
      setError('ユーザー情報の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [userId])

  const handleFollowChange = () => {
    fetchUser()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error || 'ユーザーが見つかりません'}</div>
      </div>
    )
  }

  const isOwner = currentUser && currentUser.id === user.id

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
              {/* フォローボタン */}
              <FollowButton
                userId={user.id}
                isFollowing={user.is_following || false}
                isOwnProfile={isOwner || false}
                onFollowChange={handleFollowChange}
              />
            </div>

            {/* フォロー数・フォロワー数 */}
            <div className="flex gap-4 mb-3">
              <button
                onClick={() => router.push(`/users/${user.id}/following`)}
                className="text-sm hover:underline"
              >
                <span className="font-semibold">{user.following_count}</span> フォロー中
              </button>
              <button
                onClick={() => router.push(`/users/${user.id}/followers`)}
                className="text-sm hover:underline"
              >
                <span className="font-semibold">{user.followers_count}</span> フォロワー
              </button>
            </div>

            {/* 本人の場合のみメールアドレスを表示 */}
            {isOwner && user.email && (
              <p className="text-gray-500 text-sm mb-3">{user.email}</p>
            )}
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
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-2 rounded-md font-medium text-sm transition-all ${
              activeTab === 'all'
                ? 'bg-white text-green-600 shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            投稿全て
          </button>
          <button
            onClick={() => setActiveTab('growth_record_post')}
            className={`flex-1 py-2 rounded-md font-medium text-sm transition-all ${
              activeTab === 'growth_record_post'
                ? 'bg-white text-green-600 shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            成長メモ
          </button>
          <button
            onClick={() => setActiveTab('general_post')}
            className={`flex-1 py-2 rounded-md font-medium text-sm transition-all ${
              activeTab === 'general_post'
                ? 'bg-white text-green-600 shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            雑談
          </button>
        </div>
      </div>

      {/* 投稿一覧 */}
      <div className="mb-6">
        <PostsTab userId={userId} postType={activeTab} />
      </div>
    </div>
  )
}
