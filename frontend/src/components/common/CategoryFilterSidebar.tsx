'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { apiClient } from '@/services/apiClient'
import FilterSelection from './FilterSelection'

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
  selectedPostTypes: PostType[]
  selectedCategoryIds: number[]
  onApplyFilter: (postTypes: PostType[], categoryIds: number[]) => void
}

export default function CategoryFilterSidebar({
  isOpen,
  onClose,
  selectedPostTypes,
  selectedCategoryIds,
  onApplyFilter
}: Props) {
  const [categories, setCategories] = useState<Category[]>([])
  const [tempSelectedPostTypes, setTempSelectedPostTypes] = useState<PostType[]>(selectedPostTypes)
  const [tempSelectedIds, setTempSelectedIds] = useState<number[]>(selectedCategoryIds)
  const [isGrowthRecordExpanded, setIsGrowthRecordExpanded] = useState(false)

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
        <FilterSelection
          categories={categories}
          tempSelectedPostTypes={tempSelectedPostTypes}
          tempSelectedIds={tempSelectedIds}
          isGrowthRecordExpanded={isGrowthRecordExpanded}
          setIsGrowthRecordExpanded={setIsGrowthRecordExpanded}
          handleGrowthRecordToggle={handleGrowthRecordToggle}
          handleGeneralPostToggle={handleGeneralPostToggle}
          handleCategoryToggle={handleCategoryToggle}
        />

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
