'use client'

import React from 'react'

interface Props {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  status: 'completed' | 'failed'
  loading?: boolean
}

export default function StatusUpdateConfirmDialog({ isOpen, onClose, onConfirm, status, loading = false }: Props) {
  if (!isOpen) return null

  const isCompleted = status === 'completed'
  const title = isCompleted ? 'ステータスを「収穫済み」に更新' : 'ステータスを「失敗」に更新'
  const message = isCompleted
    ? '収穫が完了しました。ステータスを「収穫済み」に更新しますか？'
    : '栽培を失敗として記録しますか？この操作は取り消せません。'
  const buttonColor = isCompleted ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
  const buttonText = isCompleted ? '収穫済みにする' : '失敗として記録'
  const iconColor = isCompleted ? 'text-green-600' : 'text-yellow-600'
  const bgColor = isCompleted ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
  const warningText = isCompleted ? 'text-green-800' : 'text-yellow-800'
  const warningSubText = isCompleted ? 'text-green-700' : 'text-yellow-700'

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'brightness(0.7)'
      }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
              disabled={loading}
            >
              ×
            </button>
          </div>

          <div className="mb-6">
            <div className={`${bgColor} border rounded-md p-4`}>
              <div className="flex items-start">
                <svg className={`w-5 h-5 ${iconColor} mr-2 mt-0.5 flex-shrink-0`} fill="currentColor" viewBox="0 0 20 20">
                  {isCompleted ? (
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  ) : (
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  )}
                </svg>
                <div>
                  <p className={`${warningText} font-medium`}>{message}</p>
                  <p className={`${warningSubText} text-sm mt-1`}>
                    ステータスの変更後は元に戻せません
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={`px-4 py-2 text-white rounded-md ${buttonColor} disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors`}
            >
              {loading ? '更新中...' : buttonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
