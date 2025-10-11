'use client'

import { use } from 'react'
import UserProfilePage from '@/components/profile/UserProfilePage'

interface Params {
  id: string
}

export default function UserProfile({ params }: { params: Promise<Params> }) {
  const { id } = use(params)
  const userId = parseInt(id, 10)

  if (isNaN(userId)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">無効なユーザーIDです</div>
      </div>
    )
  }

  return (
    <div className="flex justify-center" style={{ minWidth: '360px' }}>
      <div className="w-full max-w-2xl px-4 py-6" style={{ minWidth: '360px' }}>
        <UserProfilePage userId={userId} />
      </div>
    </div>
  )
}
