'use client'
import { useRef, useEffect } from 'react'

interface Category {
  id: number
  name: string
  color: string
  icon: string
}
type PostType = 'growth_record_post' | 'general_post'

interface FilterSelectionProps {
  categories: Category[]
  tempSelectedPostTypes: PostType[]
  tempSelectedIds: number[]
  isGrowthRecordExpanded: boolean
  setIsGrowthRecordExpanded: (value: boolean) => void
  handleGrowthRecordToggle: () => void
  handleGeneralPostToggle: () => void
  handleCategoryToggle: (categoryId: number) => void
}

export default function FilterSelection({
  categories, tempSelectedPostTypes, tempSelectedIds, isGrowthRecordExpanded,
  setIsGrowthRecordExpanded, handleGrowthRecordToggle, handleGeneralPostToggle, handleCategoryToggle
}: FilterSelectionProps) {
  const growthRecordCheckboxRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (growthRecordCheckboxRef.current && categories.length > 0) {
      const allCategoriesSelected = categories.length === tempSelectedIds.length
      const someCategoriesSelected = tempSelectedIds.length > 0 && !allCategoriesSelected
      growthRecordCheckboxRef.current.indeterminate = someCategoriesSelected
    }
  }, [tempSelectedIds, categories])
  return (
    <div className="p-4 border-b border-gray-200">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">投稿タイプ</h3>
      <div className="space-y-2">
        <div className="rounded-lg hover:bg-gray-50 transition-colors">
          <div className="flex items-center p-3 cursor-pointer" onClick={() => setIsGrowthRecordExpanded(!isGrowthRecordExpanded)}>
            <input ref={growthRecordCheckboxRef} type="checkbox" checked={tempSelectedPostTypes.includes('growth_record_post')} onChange={(e) => { e.stopPropagation(); handleGrowthRecordToggle(); }} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
            <span className="ml-3 text-sm text-gray-700 flex-1">🌱 成長記録投稿</span>
            <svg className={`w-5 h-5 text-gray-500 transition-transform ${isGrowthRecordExpanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          {isGrowthRecordExpanded && (
            <div className="pl-10 pr-3 pb-3 space-y-1">
              {categories.map(category => (
                <label key={category.id} className="flex items-center p-2 rounded hover:bg-gray-100 cursor-pointer transition-colors">
                  <input type="checkbox" checked={tempSelectedIds.includes(category.id)} onChange={() => handleCategoryToggle(category.id)} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                  <span className="ml-2 text-sm flex items-center gap-2">
                    <span>{category.icon}</span>
                    <span className="text-gray-700">{category.name}</span>
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
        <label className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
          <input type="checkbox" checked={tempSelectedPostTypes.includes('general_post')} onChange={() => handleGeneralPostToggle()} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
          <span className="ml-3 text-sm text-gray-700">💬 雑談投稿</span>
        </label>
      </div>
    </div>
  )
}
