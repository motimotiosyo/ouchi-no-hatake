'use client'

import { useRequireAuthWithRender } from '@/hooks/useRequireAuth'
import GrowthRecordList from '@/components/growth-records/GrowthRecordList'

export default function GrowthRecordsPage() {
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
    <div className="flex justify-center" style={{ minWidth: '360px' }}>
      <div className="w-full max-w-2xl px-4 pb-6 -mt-4" style={{ minWidth: '360px' }}>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">成長記録</h1>
          <p className="text-gray-600">あなたの成長記録一覧</p>
        </div>
        
        <GrowthRecordList />
      </div>
    </div>
  )
}