'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/services/apiClient'
import FollowButton from '@/components/users/FollowButton'
import type { UserProfile } from '@/types'

interface Params {
  id: string
}

export default function FollowingPage({ params }: { params: Promise<Params> }) {
  const { id } = use(params)
  const router = useRouter()
  const userId = parseInt(id, 10)
  const [following, setFollowing] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFollowing = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('auth_token')
      const result = await apiClient.getFollowing(userId, token || undefined)

      if (result.success) {
        setFollowing(result.data.following)
      } else {
        setError(result.error.message)
      }
    } catch {
      setError('フォロー中一覧の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isNaN(userId)) {
      setError('無効なユーザーIDです')
      return
    }
    fetchFollowing()
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
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-green-600 hover:text-green-700 font-medium"
        >
          ← 戻る
        </button>
        <h1 className="text-2xl font-bold text-gray-900 mt-4">フォロー中 ({following.length})</h1>
      </div>

      {following.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          フォロー中のユーザーはいません
        </div>
      ) : (
        <div className="space-y-4">
          {following.map((user) => (
            <div key={user.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div
                  className="flex items-center gap-3 flex-1 cursor-pointer"
                  onClick={() => router.push(`/users/${user.id}`)}
                >
                  {/* アバター */}
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 text-lg font-semibold">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}

                  {/* ユーザー情報 */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900">{user.name}</div>
                    {user.bio && (
                      <div className="text-sm text-gray-500 truncate">{user.bio}</div>
                    )}
                  </div>
                </div>

                {/* フォローボタン */}
                <FollowButton
                  userId={user.id}
                  isFollowing={user.is_following || false}
                  isOwnProfile={false}
                  onFollowChange={fetchFollowing}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
