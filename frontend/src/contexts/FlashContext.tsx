'use client'

import { createContext, useContext, useState, ReactNode, useEffect } from 'react'

interface FlashMessage {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
}

interface FlashContextType {
  messages: FlashMessage[]
  addMessage: (message: string, type: FlashMessage['type']) => void
  removeMessage: (id: string) => void
  clearMessages: () => void
}

const FlashContext = createContext<FlashContextType | undefined>(undefined)

export function FlashProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<FlashMessage[]>([])

  // URLパラメータからフラッシュメッセージを読み取る
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const flashMessage = urlParams.get('flash_message')
      const flashType = urlParams.get('flash_type') as FlashMessage['type']
      
      if (flashMessage && flashType) {
        const id = Date.now().toString()
        const newMessage = { id, message: flashMessage, type: flashType }
        
        setMessages(prev => [...prev, newMessage])
        
        // 5秒後に自動削除
        setTimeout(() => {
          setMessages(prev => prev.filter(msg => msg.id !== id))
        }, 5000)
        
        // URLパラメータをクリア
        const newUrl = window.location.pathname
        window.history.replaceState({}, '', newUrl)
      }
    }
  }, [])

  const addMessage = (message: string, type: FlashMessage['type']) => {
    const id = Date.now().toString()
    const newMessage = { id, message, type }
    
    setMessages(prev => [...prev, newMessage])
    
    // 5秒後に自動削除
    setTimeout(() => {
      removeMessage(id)
    }, 5000)
  }

  const removeMessage = (id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id))
  }

  const clearMessages = () => {
    setMessages([])
  }

  return (
    <FlashContext.Provider value={{ messages, addMessage, removeMessage, clearMessages }}>
      {children}
    </FlashContext.Provider>
  )
}

export function useFlash() {
  const context = useContext(FlashContext)
  if (context === undefined) {
    throw new Error('useFlash must be used within a FlashProvider')
  }
  return context
}