'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useRequireAuthWithRender } from '@/hooks/useRequireAuth'
import { apiClient } from '@/services/apiClient'
import { Guide } from '@/types/guide'
import GuideDetail from '@/components/guides/GuideDetail'

export default function GuideDetailPage() {
  const params = useParams()
  const { canAccess, isLoading } = useRequireAuthWithRender()
  const [guide, setGuide] = useState<Guide | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const guideId = params?.id ? Number(params.id) : null

  useEffect(() => {
    if (!canAccess) return

    // IDが不正な場合
    if (!guideId || isNaN(guideId)) {
      setError('ガイドが見つかりません')
      setLoading(false)
      return
    }

    const fetchGuideDetail = async () => {
      try {
        setLoading(true)
        setError(null)

        const token = localStorage.getItem('auth_token')
        if (!token) return

        const result = await apiClient.getGuideDetail(guideId, token)

        if (result.success) {
          setGuide(result.data)
        } else {
          setError(result.error.message || 'ガイドの取得に失敗しました')
          console.error('Failed to fetch guide detail:', result.error)
        }
      } catch (err) {
        setError('ガイドの取得中にエラーが発生しました')
        console.error('Error fetching guide detail:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchGuideDetail()
  }, [canAccess, guideId])

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

  if (error || !guide) {
    return (
      <div className="flex justify-center">
        <div className="w-full max-w-2xl min-w-80 px-4 pb-6 -mt-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-800">{error || 'ガイドが見つかりません'}</p>
          </div>
          <Link
            href="/guides"
            className="inline-flex items-center text-green-600 hover:text-green-700"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            ガイド一覧に戻る
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-2xl min-w-80 px-4 pb-6 -mt-4">
        {/* 戻るボタン */}
        <div className="mb-6">
          <Link
            href="/guides"
            className="inline-flex items-center text-green-600 hover:text-green-700 transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            ガイド一覧に戻る
          </Link>
        </div>

        {/* ガイド詳細 */}
        <GuideDetail guide={guide} />
      </div>
    </div>
  )
}
