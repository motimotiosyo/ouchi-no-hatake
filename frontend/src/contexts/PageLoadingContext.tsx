'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react'
import { usePathname } from 'next/navigation'

interface PageLoadingContextType {
  isPageLoading: boolean
  setPageLoading: (loading: boolean) => void
}

const PageLoadingContext = createContext<PageLoadingContextType | undefined>(undefined)

export function PageLoadingProvider({ children }: { children: ReactNode }) {
  const [isPageLoading, setIsPageLoading] = useState(false)
  const pathname = usePathname()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // 既存のタイムアウトをクリア
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // pathname変更後、一定時間待ってから自動的にローディング解除（フォールバック）
    timeoutRef.current = setTimeout(() => {
      setIsPageLoading(false)
    }, 1500)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [pathname])

  const setPageLoading = (loading: boolean) => {
    setIsPageLoading(loading)
  }

  return (
    <PageLoadingContext.Provider value={{ isPageLoading, setPageLoading }}>
      {children}
    </PageLoadingContext.Provider>
  )
}

export function usePageLoading() {
  const context = useContext(PageLoadingContext)
  if (context === undefined) {
    throw new Error('usePageLoading must be used within a PageLoadingProvider')
  }
  return context
}
