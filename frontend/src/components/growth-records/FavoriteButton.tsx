'use client'

import { useState } from 'react'
import { useAuthContext as useAuth } from '@/contexts/auth'
import { apiClient } from '@/services/apiClient'

interface FavoriteButtonProps {
  growthRecordId: number
  initialFavorited: boolean
  initialCount: number
  onUpdate?: (favorited: boolean, count: number) => void
}

export default function FavoriteButton({
  growthRecordId,
  initialFavorited,
  initialCount,
  onUpdate
}: FavoriteButtonProps) {
  const { user, token, executeProtected } = useAuth()
  const [favorited, setFavorited] = useState(initialFavorited)
  const [count, setCount] = useState(initialCount)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleToggleFavorite = async () => {
    if (!user || !token) {
      return
    }

    if (isProcessing) return

    setIsProcessing(true)

    try {
      executeProtected(async () => {
        const result = favorited
          ? await apiClient.unfavoriteGrowthRecord(growthRecordId, token)
          : await apiClient.favoriteGrowthRecord(growthRecordId, token)

        if (result.success) {
          setFavorited(result.data.favorited)
          setCount(result.data.favorites_count)
          onUpdate?.(result.data.favorited, result.data.favorites_count)
        }
      })
    } finally {
      setIsProcessing(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <button
      onClick={handleToggleFavorite}
      disabled={isProcessing}
      className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
        favorited
          ? 'bg-red-500 text-white hover:bg-red-600'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <svg
        className="w-5 h-5"
        fill={favorited ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      <span>{count}</span>
    </button>
  )
}
