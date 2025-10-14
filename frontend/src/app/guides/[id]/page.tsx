'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuthContext as useAuth } from '@/contexts/auth'
import { apiClient } from '@/services/apiClient'
import { Guide } from '@/types/guide'
import GuideDetail from '@/components/guides/GuideDetail'

export default function GuideDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { user, token } = useAuth()
  const [guide, setGuide] = useState<Guide | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const guideId = params?.id ? Number(params.id) : null

  useEffect(() => {
    // 未ログインユーザーはログイン画面にリダイレクト
    if (!user || !token) {
      router.push('/login')
      return
    }

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
  }, [user, token, guideId, router])

  if (!user || !token) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            <p className="mt-4 text-gray-600">読み込み中...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !guide) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
