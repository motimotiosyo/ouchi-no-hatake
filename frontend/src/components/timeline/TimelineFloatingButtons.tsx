'use client'

import type { User } from '@/types'

interface TimelineFloatingButtonsProps {
  user: User | null
  selectedPostTypes: string[]
  selectedCategoryIds: number[]
  onFilterClick: () => void
  onCreateClick: () => void
}

export default function TimelineFloatingButtons({
  user,
  selectedPostTypes,
  selectedCategoryIds,
  onFilterClick,
  onCreateClick
}: TimelineFloatingButtonsProps) {
  const filterCount = selectedPostTypes.length + selectedCategoryIds.length
  const hasFilter = filterCount > 0

  return (
    <div className="fixed bottom-28 left-1/2 transform -translate-x-1/2 w-full max-w-2xl px-4 pointer-events-none z-40">
      <div className="flex justify-between items-center">
        {/* フィルターFAB（左） */}
        <div className="relative">
          <button
            onClick={onFilterClick}
            className={`w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center pointer-events-auto ${
              hasFilter
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : 'bg-white hover:bg-gray-50 text-blue-600 border-2 border-blue-500'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              <circle cx="8" cy="6" r="2" fill="currentColor" />
              <circle cx="14" cy="12" r="2" fill="currentColor" />
              <circle cx="10" cy="18" r="2" fill="currentColor" />
            </svg>
          </button>
          {hasFilter && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center border-2 border-white font-semibold">
              {filterCount}
            </span>
          )}
        </div>

        {/* 投稿作成FAB（右）- ログインユーザーのみ表示 */}
        {user && (
          <button
            onClick={onCreateClick}
            className="w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center pointer-events-auto"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
