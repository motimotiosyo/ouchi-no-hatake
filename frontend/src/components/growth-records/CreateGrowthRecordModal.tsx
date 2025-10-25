'use client'

import { useState, useEffect, useCallback, forwardRef } from 'react'
import { createPortal } from 'react-dom'
import { useAuthContext as useAuth } from '@/contexts/auth'
import { apiClient } from '@/services/apiClient'
import type { Plant } from '@/types/growthRecord'
import CustomSelect from '@/components/ui/CustomSelect'
import DatePicker, { registerLocale } from 'react-datepicker'
import { ja } from 'date-fns/locale/ja'
import 'react-datepicker/dist/react-datepicker.css'

registerLocale('ja', ja)

// カレンダーアイコン付き入力欄
const DateInputWithIcon = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ value, onClick, onChange, placeholder, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <input
          {...props}
          value={value}
          onChange={onChange}
          placeholder={placeholder || "yyyy/MM/dd"}
          ref={ref}
          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
        />
        <button
          type="button"
          onClick={onClick}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 z-10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
      </div>
    )
  }
)
DateInputWithIcon.displayName = 'DateInputWithIcon'

interface EditData {
  id: number
  plant_id: number
  record_name: string
  location: string | null
  started_on: string | null
  ended_on?: string | null
  status: 'planning' | 'growing' | 'completed' | 'failed'
  thumbnail_url?: string | null
}

// サムネイル画像アップロード制限
const THUMBNAIL_UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024 // 10MB
}

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  editData?: EditData
}

export default function CreateGrowthRecordModal({ isOpen, onClose, onSuccess, editData }: Props) {
  const { executeProtectedAsync } = useAuth()
  const [plants, setPlants] = useState<Plant[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // フォーム状態
  const [formData, setFormData] = useState({
    plant_id: '',
    record_name: '',
    location: '',
    started_on: '',
    ended_on: '',
    planting_method: 'seed' as 'seed' | 'seedling',
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

  // 植物一覧取得と編集データ設定
  useEffect(() => {
    if (isOpen) {
      fetchPlants()

      // 編集モードの場合、初期値を設定
      if (editData) {
        setFormData({
          plant_id: editData.plant_id.toString(),
          record_name: editData.record_name || '',
          location: editData.location || '',
          started_on: editData.started_on || '',
          ended_on: editData.ended_on || '',
          planting_method: 'seed',
          status: editData.status || 'planning'
        })

        // 既存のサムネイル画像がある場合はプレビューを設定
        if (editData.thumbnail_url) {
          setThumbnailPreview(editData.thumbnail_url)
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

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

        const formDataToSend = new FormData()
        // 新規作成、または計画中の場合のみplant_idを送信（育成中以降は変更不可）
        if (!isEditMode || formData.status === 'planning') {
          formDataToSend.append('growth_record[plant_id]', formData.plant_id)
        }
        formDataToSend.append('growth_record[record_name]', formData.record_name)
        formDataToSend.append('growth_record[location]', formData.location)
        formDataToSend.append('growth_record[started_on]', formData.started_on)
        if (formData.ended_on) {
          formDataToSend.append('growth_record[ended_on]', formData.ended_on)
        }
        formDataToSend.append('growth_record[status]', formData.status)
        if (selectedThumbnail) {
          formDataToSend.append('growth_record[thumbnail]', selectedThumbnail)
        }
        if (isEditMode && removeThumbnail) {
          formDataToSend.append('growth_record[remove_thumbnail]', 'true')
        }

        const token = localStorage.getItem('auth_token')
        const result = isEditMode
          ? await apiClient.put<{ growth_record: EditData }>(endpoint, formDataToSend, token || undefined)
          : await apiClient.post<{ growth_record: EditData }>(endpoint, formDataToSend, token || undefined)

        if (result.success) {
          onSuccess()
          handleClose()
        } else {
          console.error('422エラーの詳細:', result.error)
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
      record_name: '',
      location: '',
      started_on: '',
      ended_on: '',
      planting_method: 'seed',
      status: 'planning'
    })
    setSelectedThumbnail(null)
    setThumbnailPreview('')
    setImageError('')
    setRemoveThumbnail(false)
  }

  if (!isOpen) return null

  const modalContent = (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'brightness(0.7)'
      }}
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-lg max-w-md w-full max-h-[90vh] flex flex-col"
        style={{ fontSize: '16px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex justify-between items-center">
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
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-md">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                ステータス
              </label>
              <CustomSelect
                id="status"
                name="status"
                value={formData.status}
                onChange={(value) => setFormData(prev => ({ ...prev, status: value as 'planning' | 'growing' | 'completed' | 'failed' }))}
                options={
                  (!editData || editData.status === 'planning')
                    ? [
                        { value: 'planning', label: '計画中' },
                        { value: 'growing', label: '育成中' },
                        { value: 'completed', label: '収穫済み' },
                        { value: 'failed', label: '失敗' }
                      ]
                    : editData.status === 'growing'
                    ? [
                        { value: 'growing', label: '育成中' },
                        { value: 'completed', label: '収穫済み' },
                        { value: 'failed', label: '失敗' }
                      ]
                    : editData.status === 'completed'
                    ? [{ value: 'completed', label: '収穫済み' }]
                    : [{ value: 'failed', label: '失敗' }]
                }
                required
                disabled={editData && (editData.status === 'completed' || editData.status === 'failed')}
              />
              {editData && editData.status === 'planning' && formData.status !== 'planning' && (
                <p className="text-xs text-yellow-600 mt-1">
                  ⚠️ 育成中・収穫済み・失敗に変更すると、計画中には戻せなくなります
                </p>
              )}
              {editData && editData.status === 'growing' && (
                <p className="text-xs text-gray-500 mt-1">
                  育成中から計画中には戻せません
                </p>
              )}
              {editData && (editData.status === 'completed' || editData.status === 'failed') && (
                <p className="text-xs text-gray-500 mt-1">
                  {editData.status === 'completed' ? '収穫済み' : '失敗'}のステータスは変更できません
                </p>
              )}
            </div>
            <div>
              <label htmlFor="plant_id" className="block text-sm font-medium text-gray-700 mb-2">
                品種
              </label>
              <CustomSelect
                id="plant_id"
                name="plant_id"
                value={formData.plant_id}
                onChange={(value) => setFormData(prev => ({ ...prev, plant_id: value }))}
                options={[
                  { value: '', label: '選択してください' },
                  ...plants.map(plant => ({ value: plant.id.toString(), label: plant.name }))
                ]}
                required
                disabled={editData && formData.status !== 'planning'}
              />
              {editData && formData.status !== 'planning' && (
                <p className="text-xs text-gray-500 mt-1">
                  育成中以降は品種を変更できません
                </p>
              )}
            </div>

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

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                栽培場所
              </label>
              <CustomSelect
                id="location"
                name="location"
                value={formData.location}
                onChange={(value) => setFormData(prev => ({ ...prev, location: value }))}
                options={[
                  { value: '', label: '選択してください' },
                  { value: '室内', label: '室内' },
                  { value: 'ベランダ', label: 'ベランダ' },
                  { value: '庭', label: '庭' },
                  { value: '畑', label: '畑' },
                  { value: 'その他', label: 'その他' }
                ]}
                required
              />
            </div>

            {formData.status === 'growing' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  栽培方法
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="planting_method"
                      value="seed"
                      checked={formData.planting_method === 'seed'}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">種から</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="planting_method"
                      value="seedling"
                      checked={formData.planting_method === 'seedling'}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">苗から</span>
                  </label>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {formData.status === 'growing'
                  ? (formData.planting_method === 'seed' ? '種まき日' : '植え付け日')
                  : '栽培開始日'}
              </label>
              <DatePicker
                selected={formData.started_on ? new Date(formData.started_on) : null}
                onChange={(date) => setFormData(prev => ({ ...prev, started_on: date ? date.toISOString().split('T')[0] : '' }))}
                dateFormat="yyyy年MM月dd日"
                locale="ja"
                placeholderText="日付を選択してください"
                customInput={<DateInputWithIcon />}
                wrapperClassName="w-full"
                calendarClassName="z-[10001]"
                preventOpenOnFocus
                shouldCloseOnSelect
                required={formData.status !== 'planning'}
              />
            </div>

            {(formData.status === 'completed' || formData.status === 'failed') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  栽培終了日
                </label>
                <DatePicker
                  selected={formData.ended_on ? new Date(formData.ended_on) : null}
                  onChange={(date) => setFormData(prev => ({ ...prev, ended_on: date ? date.toISOString().split('T')[0] : '' }))}
                  dateFormat="yyyy年MM月dd日"
                  locale="ja"
                  placeholderText="日付を選択してください"
                  customInput={<DateInputWithIcon />}
                  wrapperClassName="w-full"
                  calendarClassName="z-[10001]"
                  preventOpenOnFocus
                  shouldCloseOnSelect
                  required
                />
              </div>
            )}

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
              
              {imageError && (
                <div className="mt-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                  {imageError}
                </div>
              )}
              
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

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null
}