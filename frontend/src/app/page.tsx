'use client'

import { useAuth } from '@/contexts/AuthContext'
import Timeline from '@/components/timeline/Timeline'
import EmailVerificationBanner from '@/components/auth/EmailVerificationBanner'

export default function HomePage() {
  const { isLoading, user, isAuthenticated } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    )
  }

  return (
    <>
      {/* メール未認証の場合の警告バナー */}
      {isAuthenticated && user && !user.email_verified && (
        <EmailVerificationBanner email={user.email} />
      )}
      <Timeline />
    </>
  )
}