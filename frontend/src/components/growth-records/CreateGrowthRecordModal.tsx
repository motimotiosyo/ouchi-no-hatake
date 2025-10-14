'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuthContext as useAuth } from '@/contexts/auth'
import { apiClient } from '@/services/apiClient'

interface Plant {
  id: number
  name: string
  description: string
}

interface Guide {
  id: number
  plant: {
    id: number
    name: string
  }
}

interface GrowthRecord {
  id: number
  plant_id: number
  record_name: string
  location: string
  started_on: string
  ended_on?: string
  status: 'planning' | 'growing' | 'completed' | 'failed'
  thumbnail_url?: string
}

// サムネイル画像アップロード制限
const THUMBNAIL_UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024 // 10MB
}

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  editData?: GrowthRecord
}

export default function CreateGrowthRecordModal({ isOpen, onClose, onSuccess, editData }: Props) {
  const { executeProtectedAsync } = useAuth()
  const [plants, setPlants] = useState<Plant[]>([])
  const [guides, setGuides] = useState<Guide[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // フォーム状態
  const [formData, setFormData] = useState({
    plant_id: '',
    guide_id: '',
    record_name: '',
    location: '',
    started_on: '',
    ended_on: '',
    status: 'planning' as 'planning' | 'growing' | 'completed' | 'failed'
  })
  
  // サムネイル画像選択状態
  const [selectedThumbnail, setSelectedThumbnail] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('')
  const [imageError, setImageError] = useState<string>('')
  const [removeThumbnail, setRemoveThumbnail] = useState<boolean>(false)

  const fetchPlants = useCallback(async () => {
    try {
      const result = await apiClient.get<{ plants: Plant[] }>('/api/v1/plants')

      if (result.success) {
        setPlants(result.data.plants || [])
      } else {
        console.error('植物データの取得に失敗:', result.error.message)
      }
    } catch (err) {
      console.error('植物データの取得でエラーが発生しました:', err)
    }
  }, [])

  const fetchGuides = useCallback(async (plantId: string) => {
    if (!plantId) {
      setGuides([])
      return
    }

    try {
      const result = await apiClient.get<{ guides: Guide[] }>('/api/v1/guides')

      if (result.success) {
        // 選択した植物に対応するガイドのみフィルタリング
        const filteredGuides = (result.data.guides || []).filter(
          guide => guide.plant.id.toString() === plantId
        )
        setGuides(filteredGuides)
      } else {
        console.error('ガイドデータの取得に失敗:', result.error.message)
      }
    } catch (err) {
      console.error('ガイドデータの取得でエラーが発生しました:', err)
    }
  }, [])

  // 植物一覧取得と編集データ設定
  useEffect(() => {
    if (isOpen) {
      fetchPlants()

      // 編集モードの場合、初期値を設定
      if (editData) {
        const plantId = editData.plant_id.toString()
        setFormData({
          plant_id: plantId,
          guide_id: '',
          record_name: editData.record_name || '',
          location: editData.location || '',
          started_on: editData.started_on || '',
          ended_on: editData.ended_on || '',
          status: editData.status || 'planning'
        })

        // 植物に対応するガイドを取得
        fetchGuides(plantId)

        // 既存のサムネイル画像がある場合はプレビューを設定
        if (editData.thumbnail_url) {
          setThumbnailPreview(editData.thumbnail_url)
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  // 植物選択時にガイドを取得
  useEffect(() => {
    if (formData.plant_id) {
      fetchGuides(formData.plant_id)
    } else {
      setGuides([])
      setFormData(prev => ({ ...prev, guide_id: '' }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.plant_id])

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setImageError('') // エラーをクリア
    
    if (file) {
      // ファイルサイズをチェック
      if (file.size > THUMBNAIL_UPLOAD_LIMITS.MAX_FILE_SIZE) {
        setImageError(`ファイルサイズは${THUMBNAIL_UPLOAD_LIMITS.MAX_FILE_SIZE / (1024 * 1024)}MB以下にしてください`)
        return
      }
      
      // JPEG/PNG形式をチェック
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        setImageError('JPEG（.jpg）またはPNG（.png）形式の画像のみアップロードできます')
        return
      }
      
      // ファイル拡張子とMIMEタイプの整合性をチェック
      const fileName = file.name.toLowerCase()
      const fileType = file.type
      
      if ((fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) && fileType !== 'image/jpeg') {
        setImageError('ファイルの拡張子とファイル形式が一致しません。悪意のあるファイルの可能性があります')
        return
      }
      
      if (fileName.endsWith('.png') && fileType !== 'image/png') {
        setImageError('ファイルの拡張子とファイル形式が一致しません。悪意のあるファイルの可能性があります')
        return
      }
      
      setSelectedThumbnail(file)
      setRemoveThumbnail(false) // 新しい画像を選択したら削除フラグをクリア
      
      // プレビュー画像を生成
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          setThumbnailPreview(e.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveThumbnailPreview = () => {
    setSelectedThumbnail(null)
    setThumbnailPreview('')
    setImageError('')
    
    // 編集モードで既存の画像がある場合は削除フラグを立てる
    if (editData?.thumbnail_url) {
      setRemoveThumbnail(true)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    await executeProtectedAsync(async () => {
      try {
        setLoading(true)
        const isEditMode = !!editData
        const endpoint = isEditMode 
          ? `/api/v1/growth_records/${editData.id}`
          : '/api/v1/growth_records'

        // FormDataを使用して送信
        const formDataToSend = new FormData()
        formDataToSend.append('growth_record[plant_id]', formData.plant_id)
        if (formData.guide_id) {
          formDataToSend.append('growth_record[guide_id]', formData.guide_id)
        }
        formDataToSend.append('growth_record[record_name]', formData.record_name)
        formDataToSend.append('growth_record[location]', formData.location)
        formDataToSend.append('growth_record[started_on]', formData.started_on)
        if (formData.ended_on) {
          formDataToSend.append('growth_record[ended_on]', formData.ended_on)
        }
        formDataToSend.append('growth_record[status]', formData.status)
        
        // サムネイル画像を追加
        if (selectedThumbnail) {
          formDataToSend.append('growth_record[thumbnail]', selectedThumbnail)
        }
        
        // 画像削除フラグを追加（編集モードで削除チェックがある場合）
        if (isEditMode && removeThumbnail) {
          formDataToSend.append('growth_record[remove_thumbnail]', 'true')
        }

        const token = localStorage.getItem('auth_token')
        const result = isEditMode
          ? await apiClient.put<{ growth_record: GrowthRecord }>(endpoint, formDataToSend, token || undefined)
          : await apiClient.post<{ growth_record: GrowthRecord }>(endpoint, formDataToSend, token || undefined)

        if (result.success) {
          // 成功時
          onSuccess()
          handleClose()
        } else {
          setError(result.error.message)
        }
      } catch (err) {
        console.error(`成長記録の${editData ? '更新' : '作成'}でエラーが発生しました:`, err)
        setError(`成長記録の${editData ? '更新' : '作成'}に失敗しました`)
      } finally {
        setLoading(false)
      }
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleClose = () => {
    onClose()
    setError(null)
    setFormData({
      plant_id: '',
      guide_id: '',
      record_name: '',
      location: '',
      started_on: '',
      ended_on: '',
      status: 'planning'
    })
    setGuides([])
    setSelectedThumbnail(null)
    setThumbnailPreview('')
    setImageError('')
    setRemoveThumbnail(false)
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'brightness(0.7)'
      }}
      onClick={handleClose}
    >
      <div 
        className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {editData ? '成長記録を編集' : '成長記録を登録'}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-md">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ステータス */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                ステータス
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="planning">計画中</option>
                <option value="growing">育成中</option>
                <option value="completed">収穫済み</option>
                <option value="failed">失敗</option>
              </select>
            </div>

            {/* 品種選択 */}
            <div>
              <label htmlFor="plant_id" className="block text-sm font-medium text-gray-700 mb-2">
                品種
              </label>
              <select
                id="plant_id"
                name="plant_id"
                value={formData.plant_id}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">選択してください</option>
                {plants.map(plant => (
                  <option key={plant.id} value={plant.id}>
                    {plant.name}
                  </option>
                ))}
              </select>
            </div>

            {/* ガイド選択 */}
            {formData.plant_id && guides.length > 0 && (
              <div>
                <label htmlFor="guide_id" className="block text-sm font-medium text-gray-700 mb-2">
                  参考ガイド（任意）
                </label>
                <select
                  id="guide_id"
                  name="guide_id"
                  value={formData.guide_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">選択しない</option>
                  {guides.map(guide => (
                    <option key={guide.id} value={guide.id}>
                      {guide.plant.name}の育て方ガイド
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  ガイドを紐づけると、育て方の手順を参照しながら栽培を進められます
                </p>
              </div>
            )}

            {/* 記録名 */}
            <div>
              <label htmlFor="record_name" className="block text-sm font-medium text-gray-700 mb-2">
                記録名（任意）
              </label>
              <input
                type="text"
                id="record_name"
                name="record_name"
                value={formData.record_name}
                onChange={handleInputChange}
                placeholder="未入力の場合は自動で命名されます"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                例: 春のミニトマト栽培（空欄の場合「成長記録1」などの名前が自動で付きます）
              </p>
            </div>

            {/* 栽培場所 */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                栽培場所
              </label>
              <select
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">選択してください</option>
                <option value="室内">室内</option>
                <option value="ベランダ">ベランダ</option>
                <option value="庭">庭</option>
                <option value="畑">畑</option>
                <option value="その他">その他</option>
              </select>
            </div>

            {/* 栽培開始日 */}
            <div>
              <label htmlFor="started_on" className="block text-sm font-medium text-gray-700 mb-2">
                栽培開始日
              </label>
              <input
                type="date"
                id="started_on"
                name="started_on"
                value={formData.started_on}
                onChange={handleInputChange}
                required={formData.status !== 'planning'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* 栽培終了日 - 収穫済み・失敗の場合のみ表示 */}
            {(formData.status === 'completed' || formData.status === 'failed') && (
              <div>
                <label htmlFor="ended_on" className="block text-sm font-medium text-gray-700 mb-2">
                  栽培終了日
                </label>
                <input
                  type="date"
                  id="ended_on"
                  name="ended_on"
                  value={formData.ended_on}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            )}

            {/* サムネイル画像アップロード */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                サムネイル画像
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({THUMBNAIL_UPLOAD_LIMITS.MAX_FILE_SIZE / (1024 * 1024)}MB以下)
                </span>
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              
              {/* 画像エラーメッセージ */}
              {imageError && (
                <div className="mt-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                  {imageError}
                </div>
              )}
              
              {/* 画像プレビュー */}
              {thumbnailPreview && (
                <div className="mt-3">
                  <div className="relative inline-block">
                    <img
                      src={thumbnailPreview}
                      alt="サムネイルプレビュー"
                      className="w-32 h-32 object-cover rounded-md border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveThumbnailPreview}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}
              
              {/* 編集モードで既存画像削除のチェックボックス */}
              {editData?.thumbnail_url && !selectedThumbnail && !thumbnailPreview && (
                <div className="mt-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={removeThumbnail}
                      onChange={(e) => setRemoveThumbnail(e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">サムネイル画像を削除する</span>
                  </label>
                </div>
              )}
            </div>

            {/* ボタン */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (editData ? '更新中...' : '登録中...') : (editData ? '更新する' : '登録する')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}