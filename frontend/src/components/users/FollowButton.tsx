'use client'

import { useState } from 'react'
import { apiClient } from '@/services/apiClient'
import { useAuthContext as useAuth } from '@/contexts/auth'

interface FollowButtonProps {
  userId: number
  isFollowing: boolean
  isOwnProfile: boolean
  onFollowChange: () => void
}

export default function FollowButton({ userId, isFollowing, isOwnProfile, onFollowChange }: FollowButtonProps) {
  const [loading, setLoading] = useState(false)
  const { refreshUser } = useAuth()

  // 自分のプロフィールの場合は非表示
  if (isOwnProfile) {
    return null
  }

  const handleClick = async () => {
    if (loading) return

    setLoading(true)
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        alert('ログインが必要です')
        return
      }

      const result = isFollowing
        ? await apiClient.unfollowUser(userId, token)
        : await apiClient.followUser(userId, token)

      if (result.success) {
        onFollowChange()
        await refreshUser()
      } else {
        alert(result.error.message)
      }
    } catch (error) {
      console.error('フォロー操作エラー:', error)
      alert('エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`px-4 py-2 rounded font-medium text-sm transition-colors ${
        isFollowing
          ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          : 'bg-orange-500 text-white hover:bg-orange-600'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {loading ? '処理中...' : isFollowing ? 'フォロー中' : 'フォロー'}
    </button>
  )
}
