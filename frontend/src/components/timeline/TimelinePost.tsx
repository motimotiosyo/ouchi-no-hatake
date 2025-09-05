import { useAuth } from '@/contexts/AuthContext'
import { useImageModal } from '@/contexts/ImageModalContext'
import { useState } from 'react'
import Link from 'next/link'
import { API_BASE_URL } from '@/lib/api'

interface TimelinePostProps {
  post: {
    id: number
    title: string
    content: string
    post_type: 'growth_record_post' | 'general_post'
    created_at: string
    images?: string[]
    likes_count: number
    liked_by_current_user: boolean
    user: {
      id: number
      name: string
    }
    growth_record?: {
      id: number
      record_name: string
      plant: {
        id: number
        name: string
      }
    }
    category?: {
      id: number
      name: string
    }
  }
}

export default function TimelinePost({ post }: TimelinePostProps) {
  const { isAuthenticated } = useAuth()
  const { openModal } = useImageModal()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [likesCount, setLikesCount] = useState(post.likes_count)
  const [isLiked, setIsLiked] = useState(post.liked_by_current_user)
  const [isLikeLoading, setIsLikeLoading] = useState(false)

  const handleInteractionClick = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true)
    }
  }

  const handleImageClick = (imageIndex: number) => {
    if (post.images && post.images.length > 0) {
      const fullImageUrls = post.images.map(imageUrl => `${API_BASE_URL}${imageUrl}`)
      openModal(fullImageUrls, imageIndex, post.title || `${post.user.name}の投稿`)
    }
  }

  const handleLikeClick = async () => {
    if (!isAuthenticated) {
      setShowLoginModal(true)
      return
    }

    if (isLikeLoading) return

    setIsLikeLoading(true)
    
    try {
      const token = localStorage.getItem('auth_token')
      
      if (!token) {
        console.error('トークンが見つかりません')
        setShowLoginModal(true)
        return
      }
      
      const method = isLiked ? 'DELETE' : 'POST'
      
      const response = await fetch(`${API_BASE_URL}/api/v1/posts/${post.id}/likes`, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setLikesCount(data.likes_count)
        setIsLiked(data.liked)
      } else {
        const errorData = await response.json()
        console.error('いいね処理に失敗しました:', errorData)
        console.error('ステータス:', response.status)
      }
    } catch (error) {
      console.error('いいね処理でエラーが発生しました:', error)
    } finally {
      setIsLikeLoading(false)
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div>
      {/* ヘッダー部分 */}
      <div className="mb-3">
        {/* 1行目: ユーザー名（左）+ 日時・メニュー（右） */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {post.user.name.charAt(0)}
              </span>
            </div>
            <span className="font-medium text-gray-900">{post.user.name}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {formatDateTime(post.created_at)}
            </span>
            <button className="text-gray-400">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* 2行目: 成長記録・カテゴリ（左寄せ） */}
        <div className="flex items-center space-x-2">
          {post.post_type === 'growth_record_post' && post.growth_record ? (
            <Link 
              href={`/growth-records/${post.growth_record.id}`}
              className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 transition-colors cursor-pointer"
            >
              🌱 成長記録
            </Link>
          ) : (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              post.post_type === 'growth_record_post' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              {post.post_type === 'growth_record_post' ? '🌱 成長記録' : '💬 雑談'}
            </span>
          )}
          {post.post_type === 'growth_record_post' && post.category && (
            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
              {post.category.name}
            </span>
          )}
        </div>
      </div>

      {/* 投稿内容 */}
      <div className="mb-4">
        <p className="text-gray-900 text-base leading-relaxed">
          {post.content}
        </p>
      </div>

      {/* 投稿画像 */}
      {post.images && post.images.length > 0 && (
        <div className="mb-4">
          <div className={`grid gap-2 max-h-80 overflow-hidden ${
            post.images.length === 1 ? 'grid-cols-1' :
            'grid-cols-2'
          }`}>
            {post.images.map((imageUrl, index) => (
              <div key={index} className="relative cursor-pointer">
                <img
                  src={`${API_BASE_URL}${imageUrl}`}
                  alt={`投稿画像 ${index + 1}`}
                  className={`w-full rounded-md border border-gray-200 transition-opacity hover:opacity-90 ${
                    post.images?.length === 1 
                      ? 'max-h-80 object-contain' 
                      : 'h-36 object-cover'
                  }`}
                  onClick={() => handleImageClick(index)}
                />
              </div>
            ))}
          </div>
        </div>
      )}


      {/* アクションボタン */}
      <div className="flex items-center justify-around py-2">
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
          onClick={handleLikeClick}
          className={`flex items-center space-x-1 transition-colors ${
            isLiked 
              ? 'text-red-500' 
              : isAuthenticated 
                ? 'text-gray-500 hover:text-red-500' 
                : 'text-gray-300 cursor-not-allowed'
          }`}
          disabled={!isAuthenticated || isLikeLoading}
        >
          <svg 
            className="w-5 h-5" 
            fill={isLiked ? "currentColor" : "none"} 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
            />
          </svg>
          <span className="text-sm min-w-[1.5rem]">
            {likesCount > 0 ? likesCount : ''}
          </span>
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
        <div 
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            backdropFilter: 'brightness(0.7)'
          }}
          onClick={() => setShowLoginModal(false)}
        >
          <div className="bg-white rounded-lg p-6 m-4 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
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