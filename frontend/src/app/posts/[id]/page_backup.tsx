'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useImageModal } from '@/contexts/ImageModalContext'
import Link from 'next/link'
import { API_BASE_URL } from '@/lib/api'

interface Comment {
  id: number
  content: string
  created_at: string
  parent_comment_id?: number
  user: {
    id: number
    name: string
  }
  replying_to?: {
    id: number
    user_name: string
  }
}

interface Post {
  id: number
  title: string
  content: string
  post_type: 'growth_record_post' | 'general_post'
  created_at: string
  images?: string[]
  likes_count: number
  liked_by_current_user: boolean
  comments_count: number
  user: {
    id: number
    name: string
  }
  growth_record?: {
    id: number
    record_name: string
    plant: {
      id: number
      name: string
    }
  }
  category?: {
    id: number
    name: string
  }
}

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const { openModal } = useImageModal()
  
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [isLikeLoading, setIsLikeLoading] = useState(false)
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [deleteCommentId, setDeleteCommentId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-600">投稿が見つかりません</div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1>Post Detail Page</h1>
      <p>Minimal working version</p>
    </div>
  )
}