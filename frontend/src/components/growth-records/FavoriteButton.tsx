'use client'

import { useState } from 'react'
import { useAuthContext as useAuth } from '@/contexts/auth'
import { apiClient } from '@/services/apiClient'

interface FavoriteButtonProps {
  growthRecordId: number
  initialFavorited: boolean
  initialCount: number
  onUpdate?: (favorited: boolean, count: number) => void
  variant?: 'default' | 'compact'
  showCount?: boolean
  compactText?: string
}

export default function FavoriteButton({
  growthRecordId,
  initialFavorited,
  initialCount,
  onUpdate,
  variant = 'default',
  showCount = true,
  compactText = '解除'
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

    executeProtected(async () => {
      try {
        const result = favorited
          ? await apiClient.unfavoriteGrowthRecord(growthRecordId, token)
          : await apiClient.favoriteGrowthRecord(growthRecordId, token)

        if (result.success) {
          setFavorited(result.data.favorited)
          setCount(result.data.favorites_count)
          onUpdate?.(result.data.favorited, result.data.favorites_count)
        }
      } finally {
        setIsProcessing(false)
      }
    })
  }

  if (!user) {
    return null
  }

  if (variant === 'compact') {
    return (
      <button
        onClick={handleToggleFavorite}
        disabled={isProcessing || !favorited}
        className={`px-2 py-0.5 text-xs text-red-600 bg-red-50 rounded hover:bg-red-100 transition-colors ${
          isProcessing ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isProcessing ? '解除中' : compactText}
      </button>
    )
  }

  return (
    <button
      onClick={handleToggleFavorite}
      disabled={isProcessing}
      className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
        favorited
          ? 'bg-orange-100 text-orange-800 hover:bg-orange-200'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <span className="text-lg">{favorited ? '⭐' : '☆'}</span>
      {showCount && <span>{count}</span>}
    </button>
  )
}
