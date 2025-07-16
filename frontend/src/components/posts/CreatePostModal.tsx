'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { API_BASE_URL } from '@/lib/api'

interface GrowthRecord {
  id: number
  record_name: string
  plant: {
    id: number
    name: string
  }
}

// 固定カテゴリリスト
const CATEGORIES = [
  { id: 1, name: "栽培記録" },
  { id: 2, name: "種まき" },
  { id: 3, name: "水やり" },
  { id: 4, name: "収穫" },
  { id: 5, name: "雑談" },
  { id: 6, name: "質問" },
  { id: 7, name: "病気・害虫" },
  { id: 8, name: "肥料" },
  { id: 9, name: "その他" }
]

interface PostData {
  id: number
  title: string
  content: string
  growth_record_id?: number
  category_id: number
  post_type: 'growth_record_post' | 'general_post'
}

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  editData?: PostData
  preselectedGrowthRecordId?: number
}

export default function CreatePostModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  editData, 
  preselectedGrowthRecordId 
}: Props) {
  const { token } = useAuth()
  const [growthRecords, setGrowthRecords] = useState<GrowthRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // フォーム状態
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    growth_record_id: preselectedGrowthRecordId?.toString() || '',
    category_id: '',
    post_type: 'growth_record_post' as 'growth_record_post' | 'general_post'
  })

  // データ取得とフォーム初期化
  useEffect(() => {
    if (isOpen) {
      fetchGrowthRecords()
      
      // 編集モードの場合、初期値を設定
      if (editData) {
        setFormData({
          title: editData.title,
          content: editData.content,
          growth_record_id: editData.growth_record_id?.toString() || '',
          category_id: editData.category_id.toString(),
          post_type: editData.post_type
        })
      } else if (preselectedGrowthRecordId) {
        // 成長記録が事前選択されている場合
        setFormData(prev => ({
          ...prev,
          growth_record_id: preselectedGrowthRecordId.toString(),
          post_type: 'growth_record_post'
        }))
      }
    }
  }, [isOpen, editData, preselectedGrowthRecordId])

  const fetchGrowthRecords = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/growth_records?per_page=100`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setGrowthRecords(data.growth_records || [])
      }
    } catch (err) {
      console.error('Error fetching growth records:', err)
    }
  }, [token])


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const isEditMode = !!editData
      const url = isEditMode 
        ? `${API_BASE_URL}/api/v1/posts/${editData.id}`
        : `${API_BASE_URL}/api/v1/posts`
      
      const method = isEditMode ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          post: {
            title: formData.title,
            content: formData.content,
            growth_record_id: formData.growth_record_id ? parseInt(formData.growth_record_id) : null,
            category_id: formData.post_type === 'growth_record_post' ? parseInt(formData.category_id) : null,
            post_type: formData.post_type
          }
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `投稿の${isEditMode ? '更新' : '作成'}に失敗しました`)
      }

      // 成功時
      onSuccess()
      handleClose()
    } catch (err) {
      console.error(`Error ${editData ? 'updating' : 'creating'} post:`, err)
      setError(err instanceof Error ? err.message : `投稿の${editData ? '更新' : '作成'}に失敗しました`)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      title: '',
      content: '',
      growth_record_id: preselectedGrowthRecordId?.toString() || '',
      category_id: '',
      post_type: 'growth_record_post'
    })
    setError(null)
    onClose()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    // 投稿タイプが変更された場合、成長記録とカテゴリをリセット
    if (name === 'post_type') {
      setFormData(prev => ({
        ...prev,
        post_type: value as 'growth_record_post' | 'general_post',
        growth_record_id: value === 'general_post' ? '' : prev.growth_record_id,
        category_id: value === 'general_post' ? '' : prev.category_id
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'brightness(0.7)'
      }}
      onClick={handleClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {editData ? '投稿を編集' : '新しい投稿'}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 投稿タイプ選択 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                投稿タイプ <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="post_type"
                    value="growth_record_post"
                    checked={formData.post_type === 'growth_record_post'}
                    onChange={handleInputChange}
                    disabled={!!preselectedGrowthRecordId}
                    className="mr-2"
                  />
                  <span className="text-sm">🌱 成長記録として投稿（成長記録 + タイムライン）</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="post_type"
                    value="general_post"
                    checked={formData.post_type === 'general_post'}
                    onChange={handleInputChange}
                    disabled={!!preselectedGrowthRecordId}
                    className="mr-2"
                  />
                  <span className="text-sm">💬 雑談として投稿（タイムラインのみ）</span>
                </label>
              </div>
            </div>

            {/* 成長記録選択（成長記録投稿の場合のみ表示） */}
            {formData.post_type === 'growth_record_post' && (
              <div>
                <label htmlFor="growth_record_id" className="block text-sm font-medium text-gray-700 mb-2">
                  成長記録 <span className="text-red-500">*</span>
                </label>
                <select
                  id="growth_record_id"
                  name="growth_record_id"
                  value={formData.growth_record_id}
                  onChange={handleInputChange}
                  required
                  disabled={!!preselectedGrowthRecordId}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                >
                  <option value="">成長記録を選択してください</option>
                  {growthRecords.map((record) => (
                    <option key={record.id} value={record.id}>
                      {record.plant.name} - {record.record_name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* カテゴリ選択（成長記録投稿の場合のみ表示） */}
            {formData.post_type === 'growth_record_post' && (
              <div>
                <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-2">
                  カテゴリ <span className="text-red-500">*</span>
                </label>
                <select
                  id="category_id"
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">カテゴリを選択してください</option>
                  {CATEGORIES.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* タイトル */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                タイトル <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                maxLength={100}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="タイトルを入力してください"
              />
            </div>

            {/* 内容 */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                内容 <span className="text-red-500">*</span>
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                required
                rows={6}
                maxLength={1000}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                placeholder="投稿内容を入力してください"
              />
              <div className="text-right text-sm text-gray-500 mt-1">
                {formData.content.length}/1000
              </div>
            </div>


            {/* ボタン */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (editData ? '更新中...' : '投稿中...') : (editData ? '更新する' : '投稿する')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}