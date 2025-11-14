'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { usePathname } from 'next/navigation'

interface PageLoadingContextType {
  isPageLoading: boolean
  setPageLoading: (loading: boolean) => void
}

const PageLoadingContext = createContext<PageLoadingContextType | undefined>(undefined)

export function PageLoadingProvider({ children }: { children: ReactNode }) {
  const [isPageLoading, setIsPageLoading] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    // pathname変化 = ページ遷移完了
    // useEffect発火時点でReactのレンダリングも完了しているため即座に終了
    setIsPageLoading(false)
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
