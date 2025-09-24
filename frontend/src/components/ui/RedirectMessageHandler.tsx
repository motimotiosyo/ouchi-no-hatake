'use client'

import { useEffect } from 'react'
import { useAuthContext as useAuth } from '@/contexts/auth'
import { useFlash } from '@/contexts/FlashContext'

/**
 * 認証リダイレクトメッセージをFlashメッセージに転送するコンポーネント
 * AuthContextのredirectMessageをFlashContextのaddMessageに移動
 */
export default function RedirectMessageHandler() {
  const { redirectMessage, clearRedirectMessage } = useAuth()
  const { addMessage } = useFlash()

  useEffect(() => {
    if (redirectMessage) {
      // リダイレクトメッセージをフラッシュメッセージとして表示
      addMessage(redirectMessage, 'info')
      // AuthContextのメッセージをクリア
      clearRedirectMessage()
    }
  }, [redirectMessage, addMessage, clearRedirectMessage])

  return null // このコンポーネントは何も描画しない
}