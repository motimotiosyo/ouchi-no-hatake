'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext as useAuth } from '@/contexts/auth'
import { apiClient } from '@/services/apiClient'
import CreateGrowthRecordModal from './CreateGrowthRecordModal'
import DeleteConfirmDialog from './DeleteConfirmDialog'
import CreatePostModal from '../posts/CreatePostModal'
import FavoriteButton from './FavoriteButton'
import GuideStepsDisplay from './GuideStepsDisplay'
import type { Post } from '@/types'
import type { GuideStepInfo } from '@/types/growthRecord'

interface GrowthRecord {
  id: number
  record_number: number
  record_name: string
  location: string
  started_on: string
  ended_on?: string
  planting_method: 'seed' | 'seedling' | null
  status: 'planning' | 'growing' | 'completed' | 'failed'
  created_at: string
  updated_at: string
  thumbnail_url?: string
  plant: {
    id: number
    name: string
    description: string
  }
  guide?: {
    id: number
    plant: {
      id: number
      name: string
    }
    guide_step_info?: GuideStepInfo
  } | null
  user: {
    id: number
    name: string
  }
  favorites_count: number
  favorited_by_current_user: boolean
}

interface Props {
  id: string
}

export default function GrowthRecordDetail({ id }: Props) {
  const { user, executeProtected } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const [growthRecord, setGrowthRecord] = useState<GrowthRecord | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false)
  const [stepToggleLoading, setStepToggleLoading] = useState(false)

  const fetchGrowthRecord = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem('auth_token')
      const result = await apiClient.get<{ growth_record: GrowthRecord, posts: Post[] }>(
        `/api/v1/growth_records/${id}`,
        token || undefined
      )

      if (result.success) {
        setGrowthRecord(result.data.growth_record)
        setPosts(result.data.posts || [])
      } else {
        setError(result.error.message)
      }
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('成長記録の取得でエラーが発生しました:', err)
      }
      setError('成長記録の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchGrowthRecord()
  }, [fetchGrowthRecord])

  const handleEditSuccess = () => {
    // 編集成功時に詳細情報を再取得
    fetchGrowthRecord()
  }

  const handleDeleteSuccess = () => {
    // 削除成功時に一覧ページに戻る
    router.push('/growth-records')
  }

  const handleCreatePostSuccess = () => {
    // 投稿作成成功時に詳細情報を再取得
    fetchGrowthRecord()
  }

  const getStatusText = (status: string | null) => {
    if (!status) return '計画中'
    switch (status) {
      case 'planning':
        return '計画中'
      case 'growing':
        return '育成中'
      case 'completed':
        return '収穫済み'
      case 'failed':
        return '失敗'
      default:
        return status
    }
  }

  const getStatusColor = (status: string | null) => {
    if (!status) return 'bg-yellow-100 text-yellow-800'
    switch (status) {
      case 'planning':
        return 'bg-yellow-100 text-yellow-800'
      case 'growing':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleEditButtonClick = () => {
    executeProtected(() => {
      setIsEditModalOpen(true)
    })
  }

  const handleDeleteButtonClick = () => {
    executeProtected(() => {
      setIsDeleteDialogOpen(true)
    })
  }

  const handleCreatePostButtonClick = () => {
    executeProtected(() => {
      setIsCreatePostModalOpen(true)
    })
  }

  const handleStepComplete = async (stepId: number, completedAt: string) => {
    if (stepToggleLoading) return

    await executeProtected(async () => {
      setStepToggleLoading(true)
      try {
        const token = localStorage.getItem('auth_token')
        if (!token) {
          setError('認証トークンが見つかりません')
          return
        }

        const result = await apiClient.patch(`/api/v1/growth_records/${id}/steps/${stepId}/complete`, {
          completed_at: completedAt
        }, token)

        if (result.success) {
          await fetchGrowthRecord()
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.error('ステップ完了エラー:', result.error.message)
          }
          setError('ステップの完了記録に失敗しました')
        }
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error('ステップ完了でエラーが発生しました:', err)
        }
        setError('ステップの完了記録に失敗しました')
      } finally {
        setStepToggleLoading(false)
      }
    })
  }

  const handleStepUncomplete = async (stepId: number) => {
    if (stepToggleLoading) return

    await executeProtected(async () => {
      setStepToggleLoading(true)
      try {
        const token = localStorage.getItem('auth_token')
        if (!token) {
          setError('認証トークンが見つかりません')
          return
        }

        const result = await apiClient.patch(`/api/v1/growth_records/${id}/steps/${stepId}/uncomplete`, {}, token)

        if (result.success) {
          await fetchGrowthRecord()
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.error('ステップ完了取消エラー:', result.error.message)
          }
          setError('ステップの完了取消に失敗しました')
        }
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error('ステップ完了取消でエラーが発生しました:', err)
        }
        setError('ステップの完了取消に失敗しました')
      } finally {
        setStepToggleLoading(false)
      }
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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
        <div className="text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <button
            onClick={() => router.push('/growth-records')}
            className="text-blue-600 hover:text-blue-800"
          >
            {'< '}成長記録一覧に戻る
          </button>
        </div>
      </div>
    )
  }

  if (!growthRecord) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-600">成長記録が見つかりません</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 戻るボタン */}
      <div>
        <button
          onClick={() => router.push(user && user.id === growthRecord.user.id ? '/growth-records' : '/')}
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          {'< '}{user && user.id === growthRecord.user.id ? '成長記録一覧に戻る' : 'タイムラインに戻る'}
        </button>
      </div>

      {/* 成長記録基本情報 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* サムネイル画像 */}
          <div className="flex-shrink-0">
            {growthRecord.thumbnail_url ? (
              <img
                src={growthRecord.thumbnail_url}
                alt={`${growthRecord.plant.name} - ${growthRecord.record_name}`}
                className="w-full md:w-48 h-48 object-cover rounded-lg"
              />
            ) : (
              <div className="w-full md:w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-6xl">🌱</span>
              </div>
            )}
          </div>
          
          {/* 基本情報 */}
          <div className="flex-1">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {growthRecord.plant.name}
                </h1>
                <p className="text-gray-600 mb-2">{growthRecord.record_name}</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(growthRecord.status)}`}>
                  {getStatusText(growthRecord.status)}
                </span>
              </div>
              <div className="flex space-x-2">
                {/* お気に入りボタン */}
                {user && user.id !== growthRecord.user.id && (
                  <FavoriteButton
                    growthRecordId={growthRecord.id}
                    initialFavorited={growthRecord.favorited_by_current_user}
                    initialCount={growthRecord.favorites_count}
                    onUpdate={(favorited, count) => {
                      setGrowthRecord(prev => prev ? {
                        ...prev,
                        favorited_by_current_user: favorited,
                        favorites_count: count
                      } : null)
                    }}
                  />
                )}
                {/* 編集・削除ボタン（本人のみ） */}
                {user && user.id === growthRecord.user.id && (
                  <>
                    <button
                      onClick={handleEditButtonClick}
                      className="px-4 py-2 text-sm text-orange-600 bg-orange-50 rounded hover:bg-orange-100 transition-colors"
                    >
                      編集
                    </button>
                    <button
                      onClick={handleDeleteButtonClick}
                      className="px-4 py-2 text-sm text-red-600 bg-red-50 rounded hover:bg-red-100 transition-colors"
                    >
                      削除
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">栽培場所</h3>
                <p className="text-gray-900">{growthRecord.location}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">記録番号</h3>
                <p className="text-gray-900">#{growthRecord.record_number}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  {growthRecord.planting_method === 'seed'
                    ? '種まき日'
                    : growthRecord.planting_method === 'seedling'
                      ? '植え付け日'
                      : '栽培開始日'}
                </h3>
                <p className="text-gray-900">
                  {growthRecord.started_on ? formatDate(growthRecord.started_on) : '---.--.-'}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">記録開始日</h3>
                <p className="text-gray-900">
                  {growthRecord.created_at ? formatDate(growthRecord.created_at) : '---.--.-'}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">栽培終了日</h3>
                <p className="text-gray-900">
                  {growthRecord.ended_on ? formatDate(growthRecord.ended_on) : '---.--.-'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ガイドステップ表示セクション */}
      {growthRecord.guide?.guide_step_info && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            栽培ガイド - {growthRecord.guide.plant.name}
          </h2>
          <GuideStepsDisplay
            stepInfo={growthRecord.guide.guide_step_info}
            recordStatus={growthRecord.status}
            isOwner={user?.id === growthRecord.user.id}
            onStepComplete={handleStepComplete}
            onStepUncomplete={handleStepUncomplete}
          />
        </div>
      )}

      {/* 成長メモ */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            成長メモ ({posts.length}件)
          </h2>
          {user && user.id === growthRecord.user.id && (
            <button
              onClick={handleCreatePostButtonClick}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm rounded-md transition-colors"
            >
              ＋ 成長メモを作成
            </button>
          )}
        </div>
        
        {posts.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500">まだ投稿がありません</div>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                <div className="flex justify-between items-start mb-2">
                  {post.category && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {post.category.name}
                    </span>
                  )}
                  <div className="text-sm text-gray-500">
                    {formatDateTime(post.created_at)}
                  </div>
                </div>
                <p className="text-gray-600 text-sm">{post.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 編集モーダル */}
      <CreateGrowthRecordModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleEditSuccess}
        editData={growthRecord ? {
          id: growthRecord.id,
          plant_id: growthRecord.plant.id,
          record_name: growthRecord.record_name,
          location: growthRecord.location,
          started_on: growthRecord.started_on,
          ended_on: growthRecord.ended_on,
          status: growthRecord.status,
          thumbnail_url: growthRecord.thumbnail_url
        } : undefined}
      />

      {/* 削除確認ダイアログ */}
      {growthRecord && (
        <DeleteConfirmDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onSuccess={handleDeleteSuccess}
          growthRecord={{
            id: growthRecord.id,
            plant_name: growthRecord.plant.name,
            record_name: growthRecord.record_name
          }}
        />
      )}

      {/* 投稿作成モーダル */}
      <CreatePostModal
        isOpen={isCreatePostModalOpen}
        onClose={() => setIsCreatePostModalOpen(false)}
        onSuccess={handleCreatePostSuccess}
        preselectedGrowthRecordId={growthRecord?.id}
      />
    </div>
  )
}