'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/services/apiClient'
import FollowButton from '@/components/users/FollowButton'
import type { UserProfile } from '@/types'

interface Params {
  id: string
}

export default function FollowersPage({ params }: { params: Promise<Params> }) {
  const { id } = use(params)
  const router = useRouter()
  const userId = parseInt(id, 10)
  const [followers, setFollowers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFollowers = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('auth_token')
      const result = await apiClient.getFollowers(userId, token || undefined)

      if (result.success) {
        setFollowers(result.data.followers)
      } else {
        setError(result.error.message)
      }
    } catch {
      setError('フォロワー一覧の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isNaN(userId)) {
      setError('無効なユーザーIDです')
      return
    }
    fetchFollowers()
  }, [userId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pb-6 -mt-4">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-green-600 hover:text-green-700 font-medium"
        >
          ← 戻る
        </button>
        <h1 className="text-2xl font-bold text-gray-900 mt-4">フォロワー ({followers.length})</h1>
      </div>

      {followers.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          フォロワーはいません
        </div>
      ) : (
        <div className="space-y-4">
          {followers.map((follower) => (
            <div key={follower.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div
                  className="flex items-center gap-3 flex-1 cursor-pointer"
                  onClick={() => router.push(`/users/${follower.id}`)}
                >
                  {/* アバター */}
                  {follower.avatar_url ? (
                    <img
                      src={follower.avatar_url}
                      alt={follower.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 text-lg font-semibold">
                        {follower.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}

                  {/* ユーザー情報 */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900">{follower.name}</div>
                    {follower.bio && (
                      <div className="text-sm text-gray-500 truncate">{follower.bio}</div>
                    )}
                  </div>
                </div>

                {/* フォローボタン */}
                <FollowButton
                  userId={follower.id}
                  isFollowing={follower.is_following || false}
                  isOwnProfile={false}
                  onFollowChange={fetchFollowers}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
