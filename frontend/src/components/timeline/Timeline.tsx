'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import TimelinePost from './TimelinePost'
import CreatePostModal from '../posts/CreatePostModal'
import CategoryFilterSidebar from '../common/CategoryFilterSidebar'
import { useAuthContext as useAuth } from '@/contexts/auth'
import { apiClient } from '@/services/apiClient'
import type { Post } from '@/types'

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
  const [selectedPostTypes, setSelectedPostTypes] = useState<string[]>([])
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([])
  const [activeTab, setActiveTab] = useState<'all' | 'following'>('all')
  const observer = useRef<IntersectionObserver | null>(null)

  // URLクエリパラメータからタブ・投稿タイプ・カテゴリIDを取得
  useEffect(() => {
    const tab = searchParams.get('tab') as 'all' | 'following' | null
    const postTypesParam = searchParams.get('post_types')
    const categoryIdsParam = searchParams.get('category_ids')

    setActiveTab(tab || 'all')
    setSelectedPostTypes(postTypesParam ? postTypesParam.split(',') : [])
    setSelectedCategoryIds(categoryIdsParam ? categoryIdsParam.split(',').map(Number) : [])
  }, [searchParams])

  const fetchPosts = useCallback(async (page: number = 1, append: boolean = false, postTypes: string[] = [], categoryIds: number[] = [], tab: 'all' | 'following' = 'all') => {
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

  const handleApplyFilter = (postTypes: string[], categoryIds: number[], tab: 'all' | 'following') => {
    // URLクエリパラメータを更新（タブ・投稿タイプ・カテゴリを同時に反映）
    const params = new URLSearchParams()

    if (tab === 'following') {
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

  const renderEmptyState = () => (
    <div className="text-center py-8">
      <div className="text-gray-500">投稿がありません</div>
    </div>
  )

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-2xl min-w-80 space-y-4">
        {/* 投稿一覧 */}
        <div>
        {posts.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            {posts.map((post, index) => (
              <div
                key={post.id}
                ref={index === posts.length - 1 ? lastPostElementRef : undefined}
                className="bg-white rounded-lg shadow-md hover:shadow-lg hover:-translate-y-1 border border-gray-200 transition-all duration-200 px-4 py-4 mb-4"
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
          </>
        )}
        </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-28 left-1/2 transform -translate-x-1/2 w-full max-w-2xl px-4 pointer-events-none z-40">
        <div className="flex justify-between items-center">
          {/* フィルターFAB（左） */}
          <div className="relative">
            <button
              onClick={() => setIsFilterSidebarOpen(true)}
              className={`w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center pointer-events-auto ${
                selectedPostTypes.length > 0 || selectedCategoryIds.length > 0 || activeTab === 'following'
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-white hover:bg-gray-50 text-blue-600 border-2 border-blue-500'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </button>
            {(selectedPostTypes.length > 0 || selectedCategoryIds.length > 0 || activeTab === 'following') && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center border-2 border-white font-semibold">
                {selectedPostTypes.length + selectedCategoryIds.length + (activeTab === 'following' ? 1 : 0)}
              </span>
            )}
          </div>

          {/* 投稿作成FAB（右）- ログインユーザーのみ表示 */}
          {user && (
            <button
              onClick={handleCreateButtonClick}
              className="w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center pointer-events-auto"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* フィルターサイドバー */}
      <CategoryFilterSidebar
        isOpen={isFilterSidebarOpen}
        onClose={() => setIsFilterSidebarOpen(false)}
        activeTab={activeTab}
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
  )
}