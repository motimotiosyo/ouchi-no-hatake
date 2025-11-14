'use client'

import { useEffect, useRef } from 'react'
import nprogress from 'nprogress'
import 'nprogress/nprogress.css'
import { usePageLoading } from '@/contexts/PageLoadingContext'

export default function TopLoader() {
  const { isPageLoading, setPageLoading } = usePageLoading()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // nprogressの設定
    nprogress.configure({
      showSpinner: false,
      trickleSpeed: 200,
    })

    // リンククリック時にプログレスバー開始
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const anchor = target.closest('a')

      if (anchor && anchor.href && !anchor.href.startsWith('#') && anchor.href.startsWith(window.location.origin)) {
        nprogress.start()
        setPageLoading(true)
      }
    }

    document.addEventListener('click', handleClick)

    return () => {
      document.removeEventListener('click', handleClick)
    }
  }, [setPageLoading])

  useEffect(() => {
    // ページローディング状態に応じてプログレスバーを制御
    if (!isPageLoading) {
      // ローディング完了時にプログレスバー終了
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      nprogress.done()
    }
  }, [isPageLoading])

  return null
}
