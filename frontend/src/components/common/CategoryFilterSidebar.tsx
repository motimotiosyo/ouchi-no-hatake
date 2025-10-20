'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { apiClient } from '@/services/apiClient'

interface Category {
  id: number
  name: string
  color: string
  icon: string
}

type PostType = 'growth_record_post' | 'general_post'

interface Props {
  isOpen: boolean
  onClose: () => void
  activeTab: 'all' | 'following'
  selectedPostTypes: PostType[]
  selectedCategoryIds: number[]
  onApplyFilter: (postTypes: PostType[], categoryIds: number[]) => void
}

export default function CategoryFilterSidebar({
  isOpen,
  onClose,
  activeTab,
  selectedPostTypes,
  selectedCategoryIds,
  onApplyFilter
}: Props) {
  const [categories, setCategories] = useState<Category[]>([])
  const [tempSelectedPostTypes, setTempSelectedPostTypes] = useState<PostType[]>(selectedPostTypes)
  const [tempSelectedIds, setTempSelectedIds] = useState<number[]>(selectedCategoryIds)

  const [isGrowthRecordExpanded, setIsGrowthRecordExpanded] = useState(false)
  const growthRecordCheckboxRef = useRef<HTMLInputElement>(null)

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
    setTempSelectedPostTypes(selectedPostTypes)
    setTempSelectedIds(selectedCategoryIds)
  }, [selectedPostTypes, selectedCategoryIds, isOpen])

  // indeterminate状態の制御
  useEffect(() => {
    if (growthRecordCheckboxRef.current && categories.length > 0) {
      const allCategoriesSelected = categories.length === tempSelectedIds.length
      const someCategoriesSelected = tempSelectedIds.length > 0 && !allCategoriesSelected
      growthRecordCheckboxRef.current.indeterminate = someCategoriesSelected
    }
  }, [tempSelectedIds, categories])

  const handleGrowthRecordToggle = () => {
    const isChecked = tempSelectedPostTypes.includes('growth_record_post')
    
    if (isChecked) {
      // チェックを外す = 全カテゴリも外す
      setTempSelectedPostTypes(prev => prev.filter(type => type !== 'growth_record_post'))
      setTempSelectedIds([])
    } else {
      // チェックを入れる = 全カテゴリを選択
      setTempSelectedPostTypes(prev => [...prev, 'growth_record_post'])
      setTempSelectedIds(categories.map(c => c.id))
    }
  }

  const handleGeneralPostToggle = () => {
    setTempSelectedPostTypes(prev => {
      if (prev.includes('general_post')) {
        return prev.filter(type => type !== 'general_post')
      } else {
        return [...prev, 'general_post']
      }
    })
  }

  const handleCategoryToggle = (categoryId: number) => {
    setTempSelectedIds(prev => {
      const newIds = prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
      
      // カテゴリが1つでも選択されていれば成長記録投稿もチェック
      if (newIds.length > 0 && !tempSelectedPostTypes.includes('growth_record_post')) {
        setTempSelectedPostTypes(p => [...p, 'growth_record_post'])
      }
      // 全カテゴリが外れたら成長記録投稿も外す
      if (newIds.length === 0 && tempSelectedPostTypes.includes('growth_record_post')) {
        setTempSelectedPostTypes(p => p.filter(type => type !== 'growth_record_post'))
      }
      
      return newIds
    })
  }

  const handleApply = () => {
    onApplyFilter(tempSelectedPostTypes, tempSelectedIds)
    onClose()
  }

  const handleClearAll = () => {
    setTempSelectedPostTypes([])
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

{/* 投稿タイプ選択セクション */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">投稿タイプ</h3>
          <div className="space-y-2">
            {/* 成長記録投稿（アコーディオン） */}
            <div className="rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center p-3 cursor-pointer" onClick={() => setIsGrowthRecordExpanded(!isGrowthRecordExpanded)}>
                <input
                  ref={growthRecordCheckboxRef}
                  type="checkbox"
                  checked={tempSelectedPostTypes.includes('growth_record_post')}
                  onChange={(e) => {
                    e.stopPropagation()
                    handleGrowthRecordToggle()
                  }}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-3 text-sm text-gray-700 flex-1">🌱 成長記録投稿</span>
                <svg
                  className={`w-5 h-5 text-gray-500 transition-transform ${isGrowthRecordExpanded ? 'rotate-90' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>

              {/* カテゴリ選択（展開時のみ表示） */}
              {isGrowthRecordExpanded && (
                <div className="pl-10 pr-3 pb-3 space-y-1">
                  {categories.map(category => (
                    <label
                      key={category.id}
                      className="flex items-center p-2 rounded hover:bg-gray-100 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={tempSelectedIds.includes(category.id)}
                        onChange={() => handleCategoryToggle(category.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm flex items-center gap-2">
                        <span>{category.icon}</span>
                        <span className="text-gray-700">{category.name}</span>
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* 雑談投稿 */}
            <label className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={tempSelectedPostTypes.includes('general_post')}
                onChange={() => handleGeneralPostToggle()}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-3 text-sm text-gray-700">💬 雑談投稿</span>
            </label>
          </div>
        </div>

        {/* 適用ボタン */}
        <div className="sticky bottom-0 p-4 border-t border-gray-200 bg-white space-y-2">
          <button
            onClick={handleClearAll}
            className="w-full py-2 px-4 text-gray-600 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            条件を初期化
          </button>
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
