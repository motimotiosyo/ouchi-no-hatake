'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import TimelinePost from './TimelinePost'
import CreatePostModal from '../posts/CreatePostModal'
import { useAuth } from '@/contexts/AuthContext'
import { API_BASE_URL } from '@/lib/api'

interface Post {
  id: number
  title: string
  content: string
  post_type: 'growth_record_post' | 'general_post'
  created_at: string
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

interface PaginationInfo {
  current_page: number
  per_page: number
  total_count: number
  has_more: boolean
}

export default function Timeline() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const observer = useRef<IntersectionObserver | null>(null)

  const fetchPosts = async (page: number = 1, append: boolean = false) => {
    try {
      if (page === 1) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }
      
      // 認証なしでもアクセス可能にするため、直接fetchを使用
      const response = await fetch(`${API_BASE_URL}/api/v1/posts?page=${page}&per_page=10`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error Response:', response.status, errorText)
        throw new Error(`Failed to fetch posts: ${response.status} ${errorText}`)
      }
      
      const data = await response.json()
      
      if (data.posts && data.pagination) {
        if (append) {
          setPosts(prev => [...prev, ...data.posts])
        } else {
          setPosts(data.posts)
        }
        setPagination(data.pagination)
      }
    } catch (err) {
      setError('投稿を読み込めませんでした')
      console.error('Error fetching posts:', err)
      console.error('Full error details:', err)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const lastPostElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading || loadingMore) return
    if (observer.current) observer.current.disconnect()
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && pagination?.has_more) {
        fetchPosts(pagination.current_page + 1, true)
      }
    })
    
    if (node) observer.current.observe(node)
  }, [loading, loadingMore, pagination])

  useEffect(() => {
    fetchPosts()
  }, [])

  const handleCreateSuccess = () => {
    // 投稿作成成功時にタイムラインを再取得
    fetchPosts()
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-red-600">{error}</div>
      </div>
    )
  }

  if (!loading && posts.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">投稿がありません</div>
      </div>
    )
  }

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-2xl min-w-80 space-y-4">
        {/* 投稿一覧 */}
        <div>
        {posts.map((post, index) => (
          <div
            key={post.id}
            ref={index === posts.length - 1 ? lastPostElementRef : undefined}
            className="hover:bg-white/20 hover:shadow-sm transition-all duration-200 px-4 py-4 border-b border-gray-200/20"
          >
            <TimelinePost post={post} />
          </div>
        ))}
        
        {loadingMore && (
          <div className="flex justify-center items-center py-4">
            <div className="text-gray-600">さらに読み込み中...</div>
          </div>
        )}
        
        {pagination && !pagination.has_more && posts.length > 0 && (
          <div className="text-center py-8">
            <div className="text-gray-500">すべての投稿を表示しました</div>
          </div>
        )}
      </div>

      {/* Floating Action Button（ログインユーザーのみ表示） */}
      {user && (
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="fixed bottom-20 right-4 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-40"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      )}

      {/* 投稿作成モーダル */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />
      </div>
    </div>
  )
}