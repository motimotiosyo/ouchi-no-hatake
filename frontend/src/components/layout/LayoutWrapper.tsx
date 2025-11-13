'use client'

import { useState, useEffect } from 'react'
import { useAuthContext as useAuth } from '@/contexts/auth'
import { ImageModalProvider, useImageModal } from '@/contexts/ImageModalContext'
import PublicHeader from './PublicHeader'

import AuthenticatedHeader from './AuthenticatedHeader'
import AuthenticatedFooter from './AuthenticatedFooter'
import ImageModal from '@/components/ui/ImageModal'
import Logger from '@/utils/logger'

interface LayoutWrapperProps {
  children: React.ReactNode
}

function LayoutWrapperContent({ children }: LayoutWrapperProps) {
  const { user, isLoading } = useAuth()
  const { modalState, closeModal, navigateImage } = useImageModal()

  Logger.debug('LayoutWrapper authentication state updated')

  // フォールバック: 3秒以上ローディングが続く場合は強制的に判定
  const [forceShowLayout, setForceShowLayout] = useState(false)
  const [pathname, setPathname] = useState('/')

  // 現在のパスを取得
  useEffect(() => {
    setPathname(window.location.pathname)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        Logger.debug('Layout forced to display after timeout')
        setForceShowLayout(true)
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [isLoading])


  if (isLoading && !forceShowLayout) {
    Logger.debug('Layout still loading, showing loading screen')
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    )
  }

  if (user) {
    // ログイン後のレイアウト
    Logger.debug('Rendering authenticated layout')
    // タイムラインページ（/）の場合はタブバー分の余白を追加
    const isTimelinePage = pathname === '/'
    const mainPaddingClass = isTimelinePage ? 'pt-28' : 'pt-24'

    return (
      <>
        <AuthenticatedHeader />
        <main className={`flex-1 ${mainPaddingClass} pb-20`} style={{ minWidth: '360px' }}>
          {children}
        </main>
        <AuthenticatedFooter />
        <ImageModal
          images={modalState.images}
          currentIndex={modalState.currentIndex}
          isOpen={modalState.isOpen}
          onClose={closeModal}
          onNavigate={navigateImage}
          title={modalState.title}
        />
      </>
    )
  }

  // ログイン前のレイアウト
  Logger.debug('Rendering public layout')
  return (
    <>
      <PublicHeader />
      <main className="flex-1 pt-24 pb-20" style={{ minWidth: '360px' }}>
        {children}
      </main>
      <ImageModal
        images={modalState.images}
        currentIndex={modalState.currentIndex}
        isOpen={modalState.isOpen}
        onClose={closeModal}
        onNavigate={navigateImage}
        title={modalState.title}
      />
    </>
  )
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  return (
    <ImageModalProvider>
      <LayoutWrapperContent>{children}</LayoutWrapperContent>
    </ImageModalProvider>
  )
}