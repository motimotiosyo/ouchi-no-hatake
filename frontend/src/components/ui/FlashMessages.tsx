'use client'

import { useFlash } from '@/contexts/FlashContext'

export default function FlashMessages() {
  const { messages, removeMessage } = useFlash()

  if (messages.length === 0) return null

  const getMessageStyle = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 border-green-400 text-green-700'
      case 'error':
        return 'bg-red-100 border-red-400 text-red-700'
      case 'warning':
        return 'bg-yellow-100 border-yellow-400 text-yellow-700'
      case 'info':
        return 'bg-blue-100 border-blue-400 text-blue-700'
      default:
        return 'bg-gray-100 border-gray-400 text-gray-700'
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`border-l-4 p-4 rounded shadow-lg max-w-sm animate-slide-in ${getMessageStyle(message.type)}`}
        >
          <div className="flex">
            <div className="flex-1">
              <p className="text-sm font-medium">{message.message}</p>
            </div>
            <button
              onClick={() => removeMessage(message.id)}
              className="ml-2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}