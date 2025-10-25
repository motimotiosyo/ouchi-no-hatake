'use client'

import { useEffect, useState } from 'react'
import { useRequireAuthWithRender } from '@/hooks/useRequireAuth'
import { apiClient } from '@/services/apiClient'
import { GuideListItem } from '@/types/guide'
import GuideList from '@/components/guides/GuideList'

export default function GuidesPage() {
  const { canAccess, isLoading } = useRequireAuthWithRender()
  const [guides, setGuides] = useState<GuideListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!canAccess) return

    const fetchGuides = async () => {
      try {
        setLoading(true)
        setError(null)

        const token = localStorage.getItem('auth_token')
        if (!token) return

        const result = await apiClient.getGuides(token)

        if (result.success) {
          setGuides(result.data.guides)
        } else {
          setError(result.error.message || 'ガイドの取得に失敗しました')
          console.error('Failed to fetch guides:', result.error)
        }
      } catch (err) {
        setError('ガイドの取得中にエラーが発生しました')
        console.error('Error fetching guides:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchGuides()
  }, [canAccess])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    )
  }

  if (!canAccess) {
    return null
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-red-600">{error}</div>
      </div>
    )
  }

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-2xl min-w-80 px-4 pb-6 -mt-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">育て方ガイド</h1>
          <p className="text-gray-600">植物ごとの育て方を確認できます。種まきから収穫までのステップをチェックしましょう！</p>
        </div>
        
        <GuideList guides={guides} />
      </div>
    </div>
  )
}
