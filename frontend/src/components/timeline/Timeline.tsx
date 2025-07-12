'use client'

import { useState, useEffect } from 'react'
import TimelinePost from './TimelinePost'
import { useApi } from '@/hooks/useApi'

interface Post {
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

export default function Timeline() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { apiRequest } = useApi()

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true)
        const response = await apiRequest('/api/v1/posts', 'GET')
        if (response.posts) {
          setPosts(response.posts)
        }
      } catch (err) {
        setError('投稿を読み込めませんでした')
        console.error('Error fetching posts:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [apiRequest])

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

  if (posts.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500 mb-4">まだ投稿がありません</div>
        <p className="text-sm text-gray-400">
          他のユーザーの成長記録投稿がここに表示されます
        </p>
      </div>
    )
  }

  return (
    <div>
      {posts.map((post) => (
        <TimelinePost key={post.id} post={post} />
      ))}
    </div>
  )
}