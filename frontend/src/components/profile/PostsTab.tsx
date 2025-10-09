'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { apiClient } from '@/services/apiClient'
import TimelinePost from '@/components/timeline/TimelinePost'
import type { Post } from '@/types'

interface PaginationInfo {
  current_page: number
  per_page: number
  total_count: number
  has_more: boolean
}

interface PostsTabProps {
  userId: number
}

export default function PostsTab({ userId }: PostsTabProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [error, setError] = useState<string | null>(null)
  const observer = useRef<IntersectionObserver | null>(null)

  const fetchPosts = useCallback(async (page: number = 1, append: boolean = false) => {
    try {
      if (page > 1) {
        setLoadingMore(true)
      } else {
        setLoading(true)
      }

      const token = localStorage.getItem('auth_token')
      const result = await apiClient.get<{ posts: Post[], pagination: PaginationInfo }>(
        `/api/v1/posts?user_id=${userId}&page=${page}&per_page=10`,
        token || undefined
      )

      if (result.success) {
        if (append) {
          setPosts(prev => [...prev, ...result.data.posts])
        } else {
          setPosts(result.data.posts)
        }
        setPagination(result.data.pagination)
        setError(null)
      } else {
        setError(result.error.message)
      }
    } catch (err) {
      console.error('投稿の取得でエラーが発生しました:', err)
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setLoadingMore(false)
      setLoading(false)
    }
  }, [userId])

  const lastPostElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading || loadingMore) return
    if (observer.current) observer.current.disconnect()

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && pagination?.has_more) {
        fetchPosts(pagination.current_page + 1, true)
      }
    })

    if (node) observer.current.observe(node)
  }, [loading, loadingMore, pagination, fetchPosts])

  useEffect(() => {
    if (posts.length === 0 && !loading) {
      fetchPosts()
    }
  }, [posts.length, loading, fetchPosts])

  if (loading && posts.length === 0) {
    return (
      <div className="flex justify-center py-8">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-600">まだ投稿がありません</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {posts.map((post, index) => (
        <div
          key={post.id}
          ref={index === posts.length - 1 ? lastPostElementRef : null}
          className="bg-white rounded-lg shadow-md hover:shadow-lg hover:-translate-y-1 border border-gray-200 transition-all duration-200 px-4 py-4"
        >
          <TimelinePost post={post} />
        </div>
      ))}
      {loadingMore && (
        <div className="flex justify-center py-4">
          <div className="text-gray-600">読み込み中...</div>
        </div>
      )}
    </div>
  )
}
