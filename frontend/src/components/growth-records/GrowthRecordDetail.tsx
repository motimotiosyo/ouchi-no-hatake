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
import { getStatusText, getStatusColor, formatDate, formatDateTime } from '@/utils/growthRecordHelpers'
import type { Post } from '@/types'
import type { GrowthRecord } from '@/types/growthRecord'

interface Props {
  id: string
}

export default function GrowthRecordDetail({ id }: Props) {
  const { user, executeProtected } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastType, setToastType] = useState<'success' | 'error'>('error')
  const router = useRouter()
  const [growthRecord, setGrowthRecord] = useState<GrowthRecord | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false)
  const [stepToggleLoading, setStepToggleLoading] = useState(false)
  const [isGuideExpanded, setIsGuideExpanded] = useState(false)

  // トーストメッセージを表示して3秒後に自動的に消す
  const showToast = (message: string, type: 'success' | 'error' = 'error') => {
    setToastMessage(message)
    setToastType(type)
    setTimeout(() => setToastMessage(null), 3000)
  }

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
          showToast(result.error.message || 'ステップの完了記録に失敗しました')
        }
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error('ステップ完了でエラーが発生しました:', err)
        }
        showToast('ステップの完了記録に失敗しました')
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
          showToast(result.error.message || 'ステップの完了取消に失敗しました')
        }
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error('ステップ完了取消でエラーが発生しました:', err)
        }
        showToast('ステップの完了取消に失敗しました')
      } finally {
        setStepToggleLoading(false)
      }
    })
  }

  const handleStatusUpdate = async (status: 'completed' | 'failed') => {
    if (stepToggleLoading) return

    await executeProtected(async () => {
      setStepToggleLoading(true)
      try {
        const token = localStorage.getItem('auth_token')
        if (!token) {
          setError('認証トークンが見つかりません')
          return
        }

        const result = await apiClient.patch(`/api/v1/growth_records/${id}`, {
          status: status
        }, token)

        if (result.success) {
          showToast(status === 'completed' ? 'ステータスを「収穫済み」に更新しました' : 'ステータスを「失敗」に更新しました', 'success')
          await fetchGrowthRecord()
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.error('ステータス更新エラー:', result.error.message)
          }
          showToast(result.error.message || 'ステータスの更新に失敗しました')
        }
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error('ステータス更新でエラーが発生しました:', err)
        }
        showToast('ステータスの更新に失敗しました')
      } finally {
        setStepToggleLoading(false)
      }
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
            className="text-gray-600 hover:text-gray-800"
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
      {/* トーストメッセージ */}
      {toastMessage && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 text-white px-6 py-3 rounded-lg shadow-lg ${toastType === 'success' ? 'bg-blue-500' : 'bg-red-500'}`}>
          {toastMessage}
        </div>
      )}

      {/* 戻るボタン */}
      <div>
        <button
          onClick={() => router.push(user && growthRecord.user && user.id === growthRecord.user.id ? '/growth-records' : '/')}
          className="text-gray-600 hover:text-gray-800 flex items-center"
        >
          {'< '}{user && growthRecord.user && user.id === growthRecord.user.id ? '成長記録一覧に戻る' : 'タイムラインに戻る'}
        </button>
      </div>

      {/* 成長記録基本情報 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-6">
          {/* 左側：サムネイル画像（全高） */}
          <div className="flex flex-col">
            {growthRecord.thumbnail_url ? (
              <img
                src={growthRecord.thumbnail_url}
                alt={`${growthRecord.plant?.name || growthRecord.custom_plant_name || '成長記録'} - ${growthRecord.record_name}`}
                className="w-full h-full min-h-[180px] object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-full min-h-[180px] bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-4xl">🌱</span>
              </div>
            )}
          </div>

          {/* 右側：基本情報 */}
          <div className="flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {growthRecord.plant?.name || growthRecord.custom_plant_name}
                  </h1>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(growthRecord.status)}`}>
                    {getStatusText(growthRecord.status)}
                  </span>
                </div>
                <p className="text-gray-600">{growthRecord.record_name}</p>
              </div>
              <div className="flex space-x-2 flex-shrink-0">
                {/* お気に入りボタン */}
                {user && growthRecord.user && user.id !== growthRecord.user.id && (
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
                {user && growthRecord.user && user.id === growthRecord.user.id && (
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

            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <div>
                  <span className="text-gray-500">栽培場所:</span>
                  <span className="ml-2 text-gray-900">{growthRecord.location}</span>
                </div>
                <div>
                  <span className="text-gray-500">記録作成:</span>
                  <span className="ml-2 text-gray-900">{formatDate(growthRecord.created_at)}</span>
                </div>
                <div>
                  <span className="text-gray-500">
                    {growthRecord.planting_method === 'seed'
                      ? '種まき日:'
                      : growthRecord.planting_method === 'seedling'
                        ? '植え付け日:'
                        : '栽培開始日:'}
                  </span>
                  <span className="ml-2 text-gray-900">
                    {growthRecord.started_on ? formatDate(growthRecord.started_on) : '--/--'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">栽培終了日:</span>
                  <span className="ml-2 text-gray-900">
                    {growthRecord.ended_on ? formatDate(growthRecord.ended_on) : '--/--'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 下部：栽培ガイド（折りたたみ可能） */}
        {growthRecord.guide?.guide_step_info && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            {/* ガイドヘッダー（常に表示） */}
            <button
              onClick={() => setIsGuideExpanded(!isGuideExpanded)}
              className="w-full text-left hover:bg-gray-50 rounded-lg p-3 transition-colors"
            >
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">
                    📖 栽培ガイド - {growthRecord.guide.plant.name}
                  </h3>
                  {/* ガイド概要（折りたたみ時） */}
                  {!isGuideExpanded && growthRecord.status === 'growing' && (
                    <div className="flex flex-wrap gap-2 text-xs">
                      {growthRecord.guide.guide_step_info.elapsed_days !== undefined && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          経過{growthRecord.guide.guide_step_info.elapsed_days}日
                        </span>
                      )}
                      {growthRecord.guide.guide_step_info.current_step && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                          現在: {growthRecord.guide.guide_step_info.current_step.title}
                        </span>
                      )}
                      {growthRecord.guide.guide_step_info.next_step && (
                        <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded">
                          次: {growthRecord.guide.guide_step_info.next_step.title}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="ml-4 text-gray-400 flex-shrink-0">
                  {isGuideExpanded ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </div>
              </div>
            </button>

            {/* ガイド詳細（展開時のみ表示） */}
            {isGuideExpanded && (
              <div className="mt-3">
                <GuideStepsDisplay
                  stepInfo={growthRecord.guide.guide_step_info}
                  recordStatus={growthRecord.status}
                  plantingMethod={growthRecord.planting_method}
                  isOwner={user?.id === growthRecord.user?.id}
                  onStepComplete={handleStepComplete}
                  onStepUncomplete={handleStepUncomplete}
                  onStatusUpdate={handleStatusUpdate}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* 成長メモ */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            成長メモ ({posts.length}件)
          </h2>
          {user && growthRecord.user && user.id === growthRecord.user.id && (
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
          plant_id: growthRecord.plant?.id || 0,
          custom_plant_name: growthRecord.custom_plant_name,
          record_name: growthRecord.record_name,
          location: growthRecord.location,
          planting_method: growthRecord.planting_method,
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
            plant_name: growthRecord.plant?.name || growthRecord.custom_plant_name || '不明な品種',
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