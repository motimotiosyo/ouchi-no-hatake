'use client'

import { useParams } from 'next/navigation'
import { useRequireAuthWithRender } from '@/hooks/useRequireAuth'
import GrowthRecordDetail from '@/components/growth-records/GrowthRecordDetail'

export default function GrowthRecordDetailPage() {
  const params = useParams()
  const id = params.id
  const { canAccess, isLoading } = useRequireAuthWithRender()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    )
  }

  if (!canAccess) {
    return null // リダイレクト中なので何も表示しない
  }

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-2xl min-w-80 px-4 pb-6 -mt-4">
        <GrowthRecordDetail id={id as string} />
      </div>
    </div>
  )
}