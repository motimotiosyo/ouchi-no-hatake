'use client'

import TimelinePost from './TimelinePost'
import type { Post } from '@/types'

interface PaginationInfo {
  current_page: number
  per_page: number
  total_count: number
  has_more: boolean
}

interface TimelinePostListProps {
  posts: Post[]
  loadingMore: boolean
  pagination: PaginationInfo | null
  lastPostElementRef: (node: HTMLDivElement | null) => void
}

export default function TimelinePostList({
  posts,
  loadingMore,
  pagination,
  lastPostElementRef
}: TimelinePostListProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">投稿がありません</div>
      </div>
    )
  }

  return (
    <>
      {posts.map((post, index) => (
        <div
          key={post.id}
          ref={index === posts.length - 1 ? lastPostElementRef : undefined}
          className="bg-white rounded-lg shadow-md hover:shadow-lg hover:-translate-y-1 border border-gray-200 transition-all duration-200 px-4 py-4 mb-4"
        >
          <TimelinePost post={post} />
        </div>
      ))}

      {loadingMore && (
        <div className="flex justify-center items-center py-4">
          <div className="text-gray-600">さらに読み込み中...</div>
        </div>
      )}

      {pagination && !pagination.has_more && posts.length > 0 && (
        <div className="text-center py-8">
          <div className="text-gray-500">すべての投稿を表示しました</div>
        </div>
      )}
    </>
  )
}
