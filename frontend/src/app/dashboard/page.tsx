'use client'

import { useAuth } from '@/contexts/AuthContext'
import Timeline from '@/components/timeline/Timeline'

export default function DashboardPage() {
  const { isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    )
  }

  return <Timeline />
}