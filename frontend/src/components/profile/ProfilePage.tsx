'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuthContext as useAuth } from '@/contexts/auth'
import { apiClient } from '@/services/apiClient'
import TimelinePost from '@/components/timeline/TimelinePost'
import GrowthRecordCard from '@/components/growth-records/GrowthRecordCard'
import type { Post } from '@/types'

interface GrowthRecord {
  id: number
  record_number: number
  record_name: string
  location: string
  started_on: string
  ended_on?: string
  status: 'planning' | 'growing' | 'completed' | 'failed'
  thumbnail_url?: string
  created_at: string
  updated_at: string
  plant: {
    id: number
    name: string
    description: string
  }
}

interface PaginationInfo {
  current_page: number
  per_page: number
  total_count: number
  has_more: boolean
}

type TabType = 'posts' | 'growth-records'

export default function ProfilePage() {
  const { user, executeProtected } = useAuth()
  const [activeTab, setActiveTab] = useState<TabType>('posts')

  // 投稿一覧の状態
  const [posts, setPosts] = useState<Post[]>([])
  const [postsLoading, setPostsLoading] = useState(false)
  const [postsLoadingMore, setPostsLoadingMore] = useState(false)
  const [postsPagination, setPostsPagination] = useState<PaginationInfo | null>(null)
  const [postsError, setPostsError] = useState<string | null>(null)
  const postsObserver = useRef<IntersectionObserver | null>(null)

  // 成長記録一覧の状態
  const [growthRecords, setGrowthRecords] = useState<GrowthRecord[]>([])
  const [growthRecordsLoading, setGrowthRecordsLoading] = useState(false)
  const [growthRecordsLoadingMore, setGrowthRecordsLoadingMore] = useState(false)
  const [growthRecordsPagination, setGrowthRecordsPagination] = useState<PaginationInfo | null>(null)
  const [growthRecordsError, setGrowthRecordsError] = useState<string | null>(null)
  const growthRecordsObserver = useRef<IntersectionObserver | null>(null)

  // 投稿一覧の取得
  const fetchPosts = useCallback(async (page: number = 1, append: boolean = false) => {
    if (!user) return

    try {
      if (page > 1) {
        setPostsLoadingMore(true)
      } else {
        setPostsLoading(true)
      }

      const token = localStorage.getItem('auth_token')
      const result = await apiClient.get<{ posts: Post[], pagination: PaginationInfo }>(
        `/api/v1/posts?user_id=${user.id}&page=${page}&per_page=10`,
        token || undefined
      )

      if (result.success) {
        if (append) {
          setPosts(prev => [...prev, ...result.data.posts])
        } else {
          setPosts(result.data.posts)
        }
        setPostsPagination(result.data.pagination)
        setPostsError(null)
      } else {
        setPostsError(result.error.message)
      }
    } catch (err) {
      console.error('投稿の取得でエラーが発生しました:', err)
      setPostsError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setPostsLoadingMore(false)
      setPostsLoading(false)
    }
  }, [user])

  // 成長記録一覧の取得
  const fetchGrowthRecords = useCallback(async (page: number = 1, append: boolean = false) => {
    try {
      if (page === 1) {
        setGrowthRecordsLoading(true)
      } else {
        setGrowthRecordsLoadingMore(true)
      }
      setGrowthRecordsError(null)

      const token = localStorage.getItem('auth_token')
      const result = await apiClient.get<{ growth_records: GrowthRecord[], pagination: PaginationInfo }>(
        `/api/v1/growth_records?page=${page}&per_page=10`,
        token || undefined
      )

      if (result.success) {
        if (append) {
          setGrowthRecords(prev => [...prev, ...result.data.growth_records])
        } else {
          setGrowthRecords(result.data.growth_records)
        }
        setGrowthRecordsPagination(result.data.pagination)
      } else {
        setGrowthRecordsError(result.error.message)
      }
    } catch (err) {
      console.error('成長記録の取得でエラーが発生しました:', err)
      setGrowthRecordsError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setGrowthRecordsLoading(false)
      setGrowthRecordsLoadingMore(false)
    }
  }, [])

  // 投稿の無限スクロール
  const lastPostElementRef = useCallback((node: HTMLDivElement | null) => {
    if (postsLoading || postsLoadingMore) return
    if (postsObserver.current) postsObserver.current.disconnect()

    postsObserver.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && postsPagination?.has_more) {
        fetchPosts(postsPagination.current_page + 1, true)
      }
    })

    if (node) postsObserver.current.observe(node)
  }, [postsLoading, postsLoadingMore, postsPagination, fetchPosts])

  // 成長記録の無限スクロール
  const lastGrowthRecordElementRef = useCallback((node: HTMLDivElement | null) => {
    if (growthRecordsLoading || growthRecordsLoadingMore) return
    if (growthRecordsObserver.current) growthRecordsObserver.current.disconnect()

    growthRecordsObserver.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && growthRecordsPagination?.has_more) {
        fetchGrowthRecords(growthRecordsPagination.current_page + 1, true)
      }
    })

    if (node) growthRecordsObserver.current.observe(node)
  }, [growthRecordsLoading, growthRecordsLoadingMore, growthRecordsPagination, fetchGrowthRecords])

  // タブ切り替え時のデータ取得
  useEffect(() => {
    if (activeTab === 'posts' && posts.length === 0 && !postsLoading) {
      fetchPosts()
    } else if (activeTab === 'growth-records' && growthRecords.length === 0 && !growthRecordsLoading) {
      fetchGrowthRecords()
    }
  }, [activeTab, posts.length, growthRecords.length, postsLoading, growthRecordsLoading, fetchPosts, fetchGrowthRecords])

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">ユーザー情報を読み込み中...</div>
      </div>
    )
  }

  return (
    <div>
      {/* ユーザー情報ヘッダー */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-start gap-4">
          {/* アバター */}
          <div className="flex-shrink-0">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.name}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500 text-2xl font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* ユーザー情報 */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{user.name}</h1>
            <p className="text-gray-500 text-sm mb-3">{user.email}</p>
            {user.bio && (
              <p className="text-gray-700 whitespace-pre-wrap">{user.bio}</p>
            )}
          </div>
        </div>
      </div>

      {/* タブナビゲーション */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex gap-8">
          <button
            onClick={() => setActiveTab('posts')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'posts'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            投稿一覧
          </button>
          <button
            onClick={() => setActiveTab('growth-records')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'growth-records'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            成長記録一覧
          </button>
        </nav>
      </div>

      {/* タブコンテンツ */}
      {activeTab === 'posts' && (
        <div>
          {postsLoading && posts.length === 0 ? (
            <div className="flex justify-center py-8">
              <div className="text-gray-600">読み込み中...</div>
            </div>
          ) : postsError ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{postsError}</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-600">まだ投稿がありません</p>
            </div>
          ) : (
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
              {postsLoadingMore && (
                <div className="flex justify-center py-4">
                  <div className="text-gray-600">読み込み中...</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'growth-records' && (
        <div>
          {growthRecordsLoading && growthRecords.length === 0 ? (
            <div className="flex justify-center py-8">
              <div className="text-gray-600">読み込み中...</div>
            </div>
          ) : growthRecordsError ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{growthRecordsError}</p>
            </div>
          ) : growthRecords.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-600">まだ成長記録がありません</p>
            </div>
          ) : (
            <div className="space-y-4">
              {growthRecords.map((record, index) => (
                <div
                  key={record.id}
                  ref={index === growthRecords.length - 1 ? lastGrowthRecordElementRef : null}
                >
                  <GrowthRecordCard record={record} onUpdate={() => fetchGrowthRecords()} />
                </div>
              ))}
              {growthRecordsLoadingMore && (
                <div className="flex justify-center py-4">
                  <div className="text-gray-600">読み込み中...</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
