'use client'

import { useState, useEffect, useRef } from 'react'
import { apiClient } from '@/services/apiClient'
import type { PostCategory } from '@/types'

interface CategoryFilterIconMenuProps {
  selectedCategoryId: number | null
  onCategoryChange: (categoryId: number | null) => void
}

export default function CategoryFilterIconMenu({ selectedCategoryId, onCategoryChange }: CategoryFilterIconMenuProps) {
  const [categories, setCategories] = useState<PostCategory[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true)
      setError(null)

      try {
        const result = await apiClient.get<{ categories: PostCategory[] }>('/api/v1/categories')

        if (result.success) {
          setCategories(result.data.categories)
        } else {
          setError(result.error.message)
        }
      } catch (err) {
        console.error('カテゴリの取得でエラーが発生しました:', err)
        setError('カテゴリの取得に失敗しました')
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  // ドロップダウン外クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleCategorySelect = (categoryId: number | null) => {
    onCategoryChange(categoryId)
    setIsOpen(false)
  }

  const selectedCategory = categories.find(cat => cat.id === selectedCategoryId)

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* フィルターアイコンボタン */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className="relative p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="カテゴリでフィルター"
      >
        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        {/* アクティブフィルターバッジ */}
        {selectedCategoryId && (
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></span>
        )}
      </button>

      {/* ドロップダウンメニュー */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-2">
            <div className="text-xs font-semibold text-gray-500 px-3 py-2">カテゴリで絞り込み</div>
            {error ? (
              <div className="text-red-600 text-sm px-3 py-2">{error}</div>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                <button
                  onClick={() => handleCategorySelect(null)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    !selectedCategoryId
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-gray-900 hover:bg-gray-100 font-medium'
                  }`}
                >
                  すべて
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      selectedCategoryId === category.id
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-gray-900 hover:bg-gray-100 font-medium'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 選択中カテゴリ表示（ドロップダウン閉じている時） */}
      {!isOpen && selectedCategory && (
        <div className="absolute top-full right-0 mt-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded whitespace-nowrap">
          {selectedCategory.name}
        </div>
      )}
    </div>
  )
}
