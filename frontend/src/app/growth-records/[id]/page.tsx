'use client'

import { useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import GrowthRecordDetail from '@/components/growth-records/GrowthRecordDetail'

export default function GrowthRecordDetailPage() {
  const { user, isLoading } = useAuth()
  const params = useParams()
  const id = params.id

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            ログインが必要です
          </h2>
          <p className="text-gray-600">
            成長記録を表示するにはログインしてください。
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <GrowthRecordDetail id={id as string} />
    </div>
  )
}