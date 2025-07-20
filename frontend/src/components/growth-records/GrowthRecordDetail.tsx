'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import CreateGrowthRecordModal from './CreateGrowthRecordModal'
import DeleteConfirmDialog from './DeleteConfirmDialog'
import CreatePostModal from '../posts/CreatePostModal'
import { API_BASE_URL } from '@/lib/api'

interface GrowthRecord {
  id: number
  record_number: number
  record_name: string
  location: string
  started_on: string
  ended_on?: string
  status: 'planning' | 'growing' | 'completed' | 'failed'
  created_at: string
  updated_at: string
  plant: {
    id: number
    name: string
    description: string
  }
  user: {
    id: number
    name: string
  }
}

interface Post {
  id: number
  title: string
  content: string
  created_at: string
  category: {
    id: number
    name: string
  }
}

interface Props {
  id: string
}

export default function GrowthRecordDetail({ id }: Props) {
  const { token, user } = useAuth()
  const router = useRouter()
  const [growthRecord, setGrowthRecord] = useState<GrowthRecord | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false)

  const fetchGrowthRecord = useCallback(async () => {
    try {
      setLoading(true)
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/growth_records/${id}`, {
        method: 'GET',
        headers
      })

      if (!response.ok) {
        if (response.status === 404) {
          setError('成長記録が見つかりません')
        } else {
          setError('成長記録の取得に失敗しました')
        }
        return
      }

      const data = await response.json()
      setGrowthRecord(data.growth_record)
      setPosts(data.posts || [])
    } catch (err) {
      console.error('Error fetching growth record:', err)
      setError('成長記録の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }, [id, token])

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
            一覧に戻る
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
          {user && user.id === growthRecord.user.id ? '一覧に戻る' : 'タイムラインに戻る'}
        </button>
      </div>

      {/* 成長記録基本情報 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {growthRecord.plant.name}
            </h1>
            {growthRecord.record_name && (
              <p className="text-gray-600 mb-2">{growthRecord.record_name}</p>
            )}
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(growthRecord.status)}`}>
              {getStatusText(growthRecord.status)}
            </span>
          </div>
          {user && user.id === growthRecord.user.id && (
            <div className="flex space-x-2">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="px-4 py-2 text-sm text-orange-600 bg-orange-50 rounded hover:bg-orange-100 transition-colors"
              >
                編集
              </button>
              <button
                onClick={() => setIsDeleteDialogOpen(true)}
                className="px-4 py-2 text-sm text-red-600 bg-red-50 rounded hover:bg-red-100 transition-colors"
              >
                削除
              </button>
            </div>
          )}
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
            <h3 className="text-sm font-medium text-gray-500 mb-1">栽培開始日</h3>
            <p className="text-gray-900">
              {growthRecord.started_on ? formatDate(growthRecord.started_on) : '---.--.-'}
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

      {/* 関連投稿 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            関連投稿 ({posts.length}件)
          </h2>
          {user && user.id === growthRecord.user.id && (
            <button
              onClick={() => setIsCreatePostModalOpen(true)}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm rounded-md transition-colors"
            >
              ＋ 投稿を作成
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
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {post.category.name}
                  </span>
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
          status: growthRecord.status
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