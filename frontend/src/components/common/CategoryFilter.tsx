'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/services/apiClient'
import type { PostCategory } from '@/types'

interface CategoryFilterProps {
  selectedCategoryId: number | null
  onCategoryChange: (categoryId: number | null) => void
}

export default function CategoryFilter({ selectedCategoryId, onCategoryChange }: CategoryFilterProps) {
  const [categories, setCategories] = useState<PostCategory[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value
    onCategoryChange(value === '' ? null : Number(value))
  }

  if (error) {
    return (
      <div className="text-red-600 text-sm">
        {error}
      </div>
    )
  }

  return (
    <div className="mb-4">
      <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-2">
        カテゴリで絞り込み
      </label>
      <select
        id="category-filter"
        value={selectedCategoryId?.toString() || ''}
        onChange={handleCategoryChange}
        disabled={loading}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        <option value="">すべて</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
    </div>
  )
}
