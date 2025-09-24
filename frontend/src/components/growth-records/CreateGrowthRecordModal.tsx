'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuthContext as useAuth } from '@/contexts/auth'
import { useApi, usePublicApi } from '@/hooks/useApi'

interface Plant {
  id: number
  name: string
  description: string
}

interface GrowthRecord {
  id: number
  plant_id: number
  record_name: string
  location: string
  started_on: string
  ended_on?: string
  status: 'planning' | 'growing' | 'completed' | 'failed'
}

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  editData?: GrowthRecord
}

export default function CreateGrowthRecordModal({ isOpen, onClose, onSuccess, editData }: Props) {
  const { executeProtectedAsync } = useAuth()
  const { authenticatedCall, loading, error, clearError } = useApi()
  const { publicCall } = usePublicApi()
  const [plants, setPlants] = useState<Plant[]>([])

  // フォーム状態
  const [formData, setFormData] = useState({
    plant_id: '',
    record_name: '',
    location: '',
    started_on: '',
    ended_on: '',
    status: 'planning' as 'planning' | 'growing' | 'completed' | 'failed'
  })

  const fetchPlants = useCallback(async () => {
    try {
      const data = await publicCall('/api/v1/plants')
      
      if (data) {
        setPlants(data.plants)
      }
    } catch (err) {
      console.error('Error fetching plants:', err)
    }
  }, [publicCall])

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
          status: editData.status || 'planning'
        })
      }
    }
  }, [isOpen, editData, fetchPlants])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    await executeProtectedAsync(async () => {
      try {
        const isEditMode = !!editData
        const endpoint = isEditMode 
          ? `/api/v1/growth_records/${editData.id}`
          : '/api/v1/growth_records'
        
        const method = isEditMode ? 'PUT' : 'POST'

        const data = await authenticatedCall(endpoint, {
          method: method,
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            growth_record: formData
          })
        })

        if (data) {
          // 成功時
          onSuccess()
          onClose()
          
          // フォームリセット
          setFormData({
            plant_id: '',
            record_name: '',
            location: '',
            started_on: '',
            ended_on: '',
            status: 'planning'
          })
        }
      } catch (err) {
        console.error(`Error ${editData ? 'updating' : 'creating'} growth record:`, err)
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
    clearError()
    setFormData({
      plant_id: '',
      record_name: '',
      location: '',
      started_on: '',
      ended_on: '',
      status: 'planning'
    })
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
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

            {/* 記録名 */}
            <div>
              <label htmlFor="record_name" className="block text-sm font-medium text-gray-700 mb-2">
                記録名
              </label>
              <input
                type="text"
                id="record_name"
                name="record_name"
                value={formData.record_name}
                onChange={handleInputChange}
                placeholder="例: 春のミニトマト栽培"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
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