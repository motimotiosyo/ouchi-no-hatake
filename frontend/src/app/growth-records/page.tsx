'use client'

import { useAuth } from '@/contexts/AuthContext'
import GrowthRecordList from '@/components/growth-records/GrowthRecordList'

export default function GrowthRecordsPage() {
  const { user, isLoading } = useAuth()

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
    <div className="flex justify-center" style={{ minWidth: '360px' }}>
      <div className="w-full max-w-2xl px-4 py-6" style={{ minWidth: '360px' }}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">成長記録</h1>
        <p className="text-gray-600">あなたの成長記録一覧</p>
      </div>
      
      <GrowthRecordList />
      </div>
    </div>
  )
}