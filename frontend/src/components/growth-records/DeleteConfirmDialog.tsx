'use client'

import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useApi } from '@/hooks/useApi'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  growthRecord: {
    id: number
    plant_name: string
    record_name: string
  }
}

export default function DeleteConfirmDialog({ isOpen, onClose, onSuccess, growthRecord }: Props) {
  const { } = useAuth()
  const { authenticatedCall, loading, error, clearError } = useApi()

  const handleDelete = async () => {
    clearError()

    try {
      const data = await authenticatedCall(`/api/v1/growth_records/${growthRecord.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (data !== null) {
        // 成功時
        onSuccess()
        onClose()
      }
    } catch (err) {
      console.error('Error deleting growth record:', err)
    }
  }

  const handleClose = () => {
    onClose()
    clearError()
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
        className="bg-white rounded-lg max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">成長記録を削除</h2>
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

          <div className="mb-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-yellow-800 font-medium">この操作は元に戻せません</p>
                  <p className="text-yellow-700 text-sm mt-1">
                    関連する投稿も全て削除されます
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-md p-4">
              <p className="text-sm text-gray-600 mb-2">削除する成長記録:</p>
              <p className="font-semibold text-gray-900">{growthRecord.plant_name}</p>
              {growthRecord.record_name && (
                <p className="text-sm text-gray-600">{growthRecord.record_name}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '削除中...' : '削除する'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}