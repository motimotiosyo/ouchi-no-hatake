'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import TimelinePost from './TimelinePost'
import CreatePostModal from '../posts/CreatePostModal'
import CategoryFilterSidebar from '../common/CategoryFilterSidebar'
import TimelineFloatingButtons from './TimelineFloatingButtons'
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
    fetchPosts(1, false, selectedPostTypes, selectedCategoryIds, activeTab)
  }

  const handleCreateButtonClick = () => {
    executeProtected(() => {
      setIsCreateModalOpen(true)
    })
  }

  const handleApplyFilter = (postTypes: PostType[], categoryIds: number[]) => {
    const params = new URLSearchParams()
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

  if (loading) return <div className="flex justify-center items-center py-8"><div className="text-gray-600">読み込み中...</div></div>
  if (error) return <div className="flex justify-center items-center py-8"><div className="text-red-600">{error}</div></div>

  return (
    <>
      <div className="flex justify-center">
        <div className="w-full max-w-2xl min-w-80">
        {/* 家庭菜園チェッカー誘導バナー（ログイン前のみ表示） */}
        {!user && (
          <div className="mb-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200 p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-green-800 mb-1">🌱 家庭菜園チェッカー</h3>
                <p className="text-sm text-green-700">あなたの環境に最適な野菜を診断しましょう！</p>
              </div>
              <a
                href="/checker"
                className="ml-4 px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors whitespace-nowrap"
              >
                診断する
              </a>
            </div>
          </div>
        )}
        <div className="pt-0">
        {posts.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500">投稿がありません</div>
          </div>
        ) : (
          <>
            {posts.map((post, index) => (
              <div
                key={post.id}
                ref={index === posts.length - 1 ? lastPostElementRef : undefined}
                className="bg-white rounded-lg shadow-md hover:shadow-lg hover:-translate-y-1 border border-gray-200 transition-all duration-200 px-4 pt-4 pb-3 mb-4"
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
      <TimelineFloatingButtons
        user={user}
        selectedPostTypes={selectedPostTypes}
        selectedCategoryIds={selectedCategoryIds}
        onFilterClick={() => setIsFilterSidebarOpen(true)}
        onCreateClick={handleCreateButtonClick}
      />
      <CategoryFilterSidebar
        isOpen={isFilterSidebarOpen}
        onClose={() => setIsFilterSidebarOpen(false)}
        selectedPostTypes={selectedPostTypes}
        selectedCategoryIds={selectedCategoryIds}
        onApplyFilter={handleApplyFilter}
      />
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