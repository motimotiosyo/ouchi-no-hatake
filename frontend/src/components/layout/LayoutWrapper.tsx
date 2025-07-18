'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import PublicHeader from './PublicHeader'
import PublicFooter from './PublicFooter'
import AuthenticatedHeader from './AuthenticatedHeader'
import AuthenticatedFooter from './AuthenticatedFooter'

interface LayoutWrapperProps {
  children: React.ReactNode
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const { user, isLoading, isAuthenticated } = useAuth()
  
  console.log('LayoutWrapper - user:', user, 'isLoading:', isLoading, 'isAuthenticated:', isAuthenticated)
  
  // フォールバック: 3秒以上ローディングが続く場合は強制的に判定
  const [forceShowLayout, setForceShowLayout] = useState(false)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        console.log('LayoutWrapper - 強制的にレイアウト表示')
        setForceShowLayout(true)
      }
    }, 3000)
    
    return () => clearTimeout(timer)
  }, [isLoading])


  if (isLoading && !forceShowLayout) {
    console.log('LayoutWrapper - Still loading, showing loading screen')
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    )
  }

  if (user) {
    // ログイン後のレイアウト
    console.log('Rendering AuthenticatedLayout')
    return (
      <>
        <AuthenticatedHeader />
        <main className="flex-1 pt-20 pb-20">
          {children}
        </main>
        <AuthenticatedFooter />
      </>
    )
  }

  // ログイン前のレイアウト
  console.log('Rendering PublicLayout')
  return (
    <>
      <PublicHeader />
      <main className="flex-1 container mx-auto p-6 pt-20 pb-20">
        {children}
      </main>
      <PublicFooter />
    </>
  )
}