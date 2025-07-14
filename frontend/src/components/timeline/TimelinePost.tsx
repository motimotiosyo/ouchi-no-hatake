import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'

interface TimelinePostProps {
  post: {
    id: number
    title: string
    content: string
    created_at: string
    user: {
      id: number
      name: string
    }
    growth_record: {
      id: number
      record_name: string
      plant: {
        id: number
        name: string
      }
    }
    category: {
      id: number
      name: string
    }
  }
}

export default function TimelinePost({ post }: TimelinePostProps) {
  const { isAuthenticated } = useAuth()
  const [showLoginModal, setShowLoginModal] = useState(false)

  const handleInteractionClick = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true)
    }
  }

  return (
    <div className="bg-white border-b border-gray-100 px-4 py-4">
      {/* ヘッダー部分 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">
              {post.user.name.charAt(0)}
            </span>
          </div>
          <span className="font-medium text-gray-900">{post.user.name}</span>
        </div>
        <button className="text-gray-400">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </div>

      {/* 投稿内容 */}
      <div className="mb-4">
        <p className="text-gray-900 text-base leading-relaxed">
          {post.content}
        </p>
      </div>

      {/* 画像プレースホルダー */}
      <div className="mb-4">
        <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-200 rounded mx-auto mb-2 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">{post.growth_record.plant.name}</p>
          </div>
        </div>
      </div>

      {/* アクションボタン */}
      <div className="flex items-center justify-around py-2 border-t border-gray-100">
        <button 
          onClick={handleInteractionClick}
          className={`flex items-center space-x-1 ${
            isAuthenticated ? 'text-gray-500 hover:text-gray-700' : 'text-gray-300 cursor-not-allowed'
          }`}
          disabled={!isAuthenticated}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.965 8.965 0 01-4.126-1.004L5 21l1.996-3.874A8.965 8.965 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
          </svg>
        </button>
        
        <button 
          onClick={handleInteractionClick}
          className={`flex items-center space-x-1 ${
            isAuthenticated ? 'text-gray-500 hover:text-red-500' : 'text-gray-300 cursor-not-allowed'
          }`}
          disabled={!isAuthenticated}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
        
        <button 
          onClick={handleInteractionClick}
          className={`flex items-center space-x-1 ${
            isAuthenticated ? 'text-gray-500 hover:text-gray-700' : 'text-gray-300 cursor-not-allowed'
          }`}
          disabled={!isAuthenticated}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
          </svg>
        </button>
      </div>

      {/* ログインモーダル */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 m-4 max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-4 text-center">ログインが必要です</h2>
            <p className="text-gray-600 mb-6 text-center">
              投稿へのいいね、コメント、シェアを行うにはログインが必要です。
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowLoginModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                onClick={() => {
                  setShowLoginModal(false)
                  window.location.href = '/login'
                }}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                ログイン
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}