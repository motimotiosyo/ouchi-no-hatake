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

  // URLパラメータとlocalStorageからフラッシュメッセージを読み取る
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // URLパラメータからの読み取り
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
      
      // localStorageからの読み取り（リロード時のメッセージ用）
      const storedMessage = localStorage.getItem('flash_message')
      const storedType = localStorage.getItem('flash_type') as FlashMessage['type']
      
      if (storedMessage && storedType) {
        const id = Date.now().toString()
        const newMessage = { id, message: storedMessage, type: storedType }
        
        setMessages(prev => [...prev, newMessage])
        
        // 5秒後に自動削除
        setTimeout(() => {
          setMessages(prev => prev.filter(msg => msg.id !== id))
        }, 5000)
        
        // localStorageをクリア
        localStorage.removeItem('flash_message')
        localStorage.removeItem('flash_type')
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
    throw new Error('useFlashはFlashProviderの内部で使用する必要があります')
  }
  return context
}