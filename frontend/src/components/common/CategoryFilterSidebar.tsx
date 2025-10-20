'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { apiClient } from '@/services/apiClient'

interface Category {
  id: number
  name: string
  color: string
  icon: string
}

interface Props {
  isOpen: boolean
  onClose: () => void
  activeTab: 'all' | 'following'
  selectedCategoryIds: number[]
  onApplyFilter: (categoryIds: number[], tab: 'all' | 'following') => void
}

export default function CategoryFilterSidebar({
  isOpen,
  onClose,
  activeTab,
  selectedCategoryIds,
  onApplyFilter
}: Props) {
  const [categories, setCategories] = useState<Category[]>([])
  const [tempSelectedIds, setTempSelectedIds] = useState<number[]>(selectedCategoryIds)
  const [tempActiveTab, setTempActiveTab] = useState<'all' | 'following'>(activeTab)

  // カテゴリ一覧を取得
  useEffect(() => {
    const fetchCategories = async () => {
      const result = await apiClient.get<{ categories: Category[] }>('/api/v1/categories')
      if (result.success && result.data.categories) {
        setCategories(result.data.categories)
      }
    }

    if (isOpen) {
      fetchCategories()
    }
  }, [isOpen])

  // 選択状態を同期
  useEffect(() => {
    setTempSelectedIds(selectedCategoryIds)
    setTempActiveTab(activeTab)
  }, [selectedCategoryIds, activeTab, isOpen])

  const handleCategoryToggle = (categoryId: number) => {
    setTempSelectedIds(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId)
      } else {
        return [...prev, categoryId]
      }
    })
  }

  const handleApply = () => {
    onApplyFilter(tempSelectedIds, tempActiveTab)
    onClose()
  }

  const handleClearAll = () => {
    setTempSelectedIds([])
  }

  if (!isOpen) return null

  return createPortal(
    <>
      {/* オーバーレイ */}
      <div
        className="fixed inset-0 z-40"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'brightness(0.7)'
        }}
        onClick={onClose}
      />

      {/* サイドバー（左側） */}
      <div className="fixed top-0 left-0 h-full w-80 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold text-gray-900">フィルター設定</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* タブ選択セクション */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">表示範囲</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setTempActiveTab('all')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                tempActiveTab === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              全体
            </button>
            <button
              onClick={() => setTempActiveTab('following')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                tempActiveTab === 'following'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              フォロー中
            </button>
          </div>
        </div>

        {/* カテゴリ選択セクション */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">カテゴリ</h3>
            {tempSelectedIds.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                すべてクリア
              </button>
            )}
          </div>

          <div className="space-y-2">
            {categories.map(category => (
              <label
                key={category.id}
                className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={tempSelectedIds.includes(category.id)}
                  onChange={() => handleCategoryToggle(category.id)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-3 text-sm flex items-center gap-2">
                  <span>{category.icon}</span>
                  <span className="text-gray-700">{category.name}</span>
                </span>
              </label>
            ))}
          </div>

          {tempSelectedIds.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700">
                {tempSelectedIds.length}件のカテゴリを選択中
              </p>
            </div>
          )}
        </div>

        {/* 適用ボタン */}
        <div className="sticky bottom-0 p-4 border-t border-gray-200 bg-white">
          <button
            onClick={handleApply}
            className="w-full py-3 px-4 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            適用する
          </button>
        </div>
      </div>
    </>,
    document.body
  )
}
