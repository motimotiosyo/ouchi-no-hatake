'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import PublicHeader from './PublicHeader'
import PublicFooter from './PublicFooter'
import AuthenticatedHeader from './AuthenticatedHeader'
import AuthenticatedFooter from './AuthenticatedFooter'

interface LayoutWrapperProps {
  children: React.ReactNode
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    )
  }

  if (user) {
    // ログイン後のレイアウト
    return (
      <>
        <AuthenticatedHeader onLogout={handleLogout} />
        <main className="flex-1">
          {children}
        </main>
        <AuthenticatedFooter />
      </>
    )
  }

  // ログイン前のレイアウト
  return (
    <>
      <PublicHeader />
      <main className="flex-1 container mx-auto p-6">
        {children}
      </main>
      <PublicFooter />
    </>
  )
}