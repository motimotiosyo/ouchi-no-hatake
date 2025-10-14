'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext as useAuth } from '@/contexts/auth'
import { apiClient } from '@/services/apiClient'
import { GuideListItem } from '@/types/guide'
import GuideList from '@/components/guides/GuideList'

export default function GuidesPage() {
  const router = useRouter()
  const { user, token } = useAuth()
  const [guides, setGuides] = useState<GuideListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // 未ログインユーザーはログイン画面にリダイレクト
    if (!user || !token) {
      router.push('/login')
      return
    }

    const fetchGuides = async () => {
      try {
        setLoading(true)
        setError(null)

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
  }, [user, token, router])

  if (!user || !token) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            <p className="mt-4 text-gray-600">読み込み中...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            育て方ガイド
          </h1>
          <p className="text-gray-600">
            植物ごとの育て方を確認できます。種まきから収穫までのステップをチェックしましょう！
          </p>
        </div>

        {/* ガイド一覧 */}
        <GuideList guides={guides} />
      </div>
    </div>
  )
}
