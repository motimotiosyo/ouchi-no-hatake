'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import TimelinePostList from './TimelinePostList'
import TimelineFloatingButtons from './TimelineFloatingButtons'
import CreatePostModal from '../posts/CreatePostModal'
import CategoryFilterSidebar from '../common/CategoryFilterSidebar'
import { useAuthContext as useAuth } from '@/contexts/auth'
import { apiClient } from '@/services/apiClient'
import type { Post } from '@/types'

type PostType = 'growth_record_post' | 'general_post'

interface PaginationInfo {
  current_page: number
  per_page: number
  total_count: number
  has_more: boolean
}

export default function Timeline() {
  const { user, executeProtected } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [posts, setPosts] = useState<Post[]>([])
  const [loadingMore, setLoadingMore] = useState(false)
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedPostTypes, setSelectedPostTypes] = useState<PostType[]>([])
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([])
  const [activeTab, setActiveTab] = useState<'all' | 'following'>('all')
  const observer = useRef<IntersectionObserver | null>(null)

  // URLクエリパラメータからタブ・投稿タイプ・カテゴリIDを取得
  useEffect(() => {
    const tab = searchParams.get('tab') as 'all' | 'following' | null
    const postTypesParam = searchParams.get('post_types')
    const categoryIdsParam = searchParams.get('category_ids')

    setActiveTab(tab || 'all')
    setSelectedPostTypes(postTypesParam ? postTypesParam.split(',') as PostType[] : [])
    setSelectedCategoryIds(categoryIdsParam ? categoryIdsParam.split(',').map(Number) : [])
  }, [searchParams])

  const fetchPosts = useCallback(async (page: number = 1, append: boolean = false, postTypes: PostType[] = [], categoryIds: number[] = [], tab: 'all' | 'following' = 'all') => {
    try {
      if (page > 1) {
        setLoadingMore(true)
      } else {
        setLoading(true)
      }

      const token = localStorage.getItem('auth_token')
      const queryParams = new URLSearchParams({
        page: page.toString(),
        per_page: '10'
      })
      if (postTypes.length > 0) {
        queryParams.append('post_types', postTypes.join(','))
      }
      if (categoryIds.length > 0) {
        queryParams.append('category_ids', categoryIds.join(','))
      }
      if (tab === 'following') {
        queryParams.append('following', 'true')
      }

      const result = await apiClient.get<{ posts: Post[], pagination: PaginationInfo }>(
        `/api/v1/posts?${queryParams.toString()}`,
        token || undefined
      )

      if (result.success) {
        if (append) {
          setPosts(prev => [...prev, ...result.data.posts])
        } else {
          setPosts(result.data.posts)
        }
        setPagination(result.data.pagination)
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
  }, [])

  const lastPostElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading || loadingMore) return
    if (observer.current) observer.current.disconnect()

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && pagination?.has_more) {
        fetchPosts(pagination.current_page + 1, true, selectedPostTypes, selectedCategoryIds, activeTab)
      }
    })

    if (node) observer.current.observe(node)
  }, [loading, loadingMore, pagination, fetchPosts, selectedPostTypes, selectedCategoryIds, activeTab])

  useEffect(() => {
    fetchPosts(1, false, selectedPostTypes, selectedCategoryIds, activeTab)
  }, [selectedPostTypes, selectedCategoryIds, activeTab])

  const handleCreateSuccess = () => {
    // 投稿作成成功時にタイムラインを再取得
    fetchPosts(1, false, selectedPostTypes, selectedCategoryIds, activeTab)
  }

  const handleCreateButtonClick = () => {
    executeProtected(() => {
      setIsCreateModalOpen(true)
    })
  }

  const handleApplyFilter = (postTypes: PostType[], categoryIds: number[]) => {
    // URLクエリパラメータを更新（投稿タイプ・カテゴリを反映）
    const params = new URLSearchParams()

    // 現在のタブ状態を保持
    if (activeTab === 'following') {
      params.set('tab', 'following')
    }

    if (postTypes.length > 0) {
      params.set('post_types', postTypes.join(','))
    }

    if (categoryIds.length > 0) {
      params.set('category_ids', categoryIds.join(','))
    }

    router.push(`/?${params.toString()}`)
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
  return (
    <>
      <div className="flex justify-center">
        <div className="w-full max-w-2xl min-w-80">
          {/* 投稿一覧 */}
          <div className="pt-0">
            <TimelinePostList
              posts={posts}
              loadingMore={loadingMore}
              pagination={pagination}
              lastPostElementRef={lastPostElementRef}
            />
          </div>

      {/* Floating Action Buttons */}
      <TimelineFloatingButtons
        user={user}
        selectedPostTypes={selectedPostTypes}
        selectedCategoryIds={selectedCategoryIds}
        onFilterClick={() => setIsFilterSidebarOpen(true)}
        onCreateClick={handleCreateButtonClick}
      />

      {/* フィルターサイドバー */}
      <CategoryFilterSidebar
        isOpen={isFilterSidebarOpen}
        onClose={() => setIsFilterSidebarOpen(false)}
        selectedPostTypes={selectedPostTypes}
        selectedCategoryIds={selectedCategoryIds}
        onApplyFilter={handleApplyFilter}
      />

      {/* 投稿作成モーダル */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />
      </div>
    </div>
    </>
  )
}