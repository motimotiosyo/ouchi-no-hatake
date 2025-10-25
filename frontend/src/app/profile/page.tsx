'use client'

import { useRequireAuthWithRender } from '@/hooks/useRequireAuth'
import ProfilePage from '@/components/profile/ProfilePage'

export default function Profile() {
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
        <ProfilePage />
      </div>
    </div>
  )
}
