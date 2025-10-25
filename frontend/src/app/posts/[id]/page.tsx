'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuthContext as useAuth } from '@/contexts/auth'
import { useImageModal } from '@/contexts/ImageModalContext'
import Link from 'next/link'
import { API_BASE_URL } from '@/lib/api'
import { apiClient } from '@/services/apiClient'
import type { Post, Comment } from '@/types'
import { sharePost } from '@/utils/sharePost'

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
  const [isSharing, setIsSharing] = useState(false)
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [deleteCommentId, setDeleteCommentId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set())
  const [showDeletePostModal, setShowDeletePostModal] = useState(false)
  const [isDeletingPost, setIsDeletingPost] = useState(false)

  // 投稿詳細とコメント取得
  useEffect(() => {
    const fetchPostAndComments = async () => {
      if (!params.id) return
      
      try {
        const token = localStorage.getItem('auth_token')

        // 投稿詳細取得（個別投稿IDで取得）
        const postResult = await apiClient.get<Post>(`/api/v1/posts/${params.id}`, token || undefined)

        if (postResult.success) {
          setPost(postResult.data)
          setLikesCount(postResult.data.likes_count)
          setIsLiked(postResult.data.liked_by_current_user)
        } else {
          // 個別取得がない場合、一覧から検索
          const listResult = await apiClient.get<{ posts: Post[], pagination: { current_page: number, per_page: number, total_count: number, has_more: boolean } }>('/api/v1/posts?page=1&per_page=100', token || undefined)

          if (listResult.success) {
            const targetPost = listResult.data.posts.find((p: Post) => p.id === parseInt(params.id as string))

            if (targetPost) {
              setPost(targetPost)
              setLikesCount(targetPost.likes_count)
              setIsLiked(targetPost.liked_by_current_user)
            } else {
              console.error('投稿が見つかりません')
              router.push('/')
              return
            }
          } else {
            console.error('投稿が見つかりません')
            router.push('/')
            return
          }
        }

        // コメント取得（ネスト表示）
        const commentsResult = await apiClient.get<{ comments: Comment[] }>(`/api/v1/posts/${params.id}/comments`, token || undefined)

        if (commentsResult.success) {
          setComments(commentsResult.data.comments || [])
        }
      } catch (error) {
        console.error('データ取得でエラーが発生しました:', error)
        router.push('/')
      } finally {
        setLoading(false)
      }
    }

    fetchPostAndComments()
  }, [params.id, router])

  // いいね処理
  const handleLikeClick = async () => {
    if (!isAuthenticated) {
      setShowLoginModal(true)
      return
    }

    if (isLikeLoading || !post) return

    setIsLikeLoading(true)
    
    try {
      const token = localStorage.getItem('auth_token')

      if (!token) {
        console.error('トークンが見つかりません')
        setShowLoginModal(true)
        return
      }

      const result = isLiked
        ? await apiClient.delete<{ likes_count: number, liked: boolean }>(`/api/v1/posts/${post.id}/likes`, token)
        : await apiClient.post<{ likes_count: number, liked: boolean }>(`/api/v1/posts/${post.id}/likes`, {}, token)

      if (result.success) {
        setLikesCount(result.data.likes_count)
        setIsLiked(result.data.liked)
      } else {
        console.error('いいね処理に失敗しました:', result.error.message)
      }
    } catch (error) {
      console.error('いいね処理でエラーが発生しました:', error)
    } finally {
      setIsLikeLoading(false)
    }
  }

  // シェア処理
  const handleShareClick = async () => {
    if (!post) return

    setIsSharing(true)
    try {
      await sharePost({
        title: '投稿',
        content: post.content,
        url: typeof window !== 'undefined' ? window.location.href : ''
      })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Share failed:', error)
      }
    } finally {
      setIsSharing(false)
    }
  }

  // 画像クリック処理
  const handleImageClick = (imageIndex: number) => {
    if (post?.images && post.images.length > 0) {
      const fullImageUrls = post.images.map(imageUrl => `${API_BASE_URL}${imageUrl}`)
      openModal(fullImageUrls, imageIndex, post.title || `${post.user.name}の投稿`)
    }
  }

  // コメント投稿
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated || !newComment.trim() || submitting || !post) return

    setSubmitting(true)
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        console.error('認証トークンが見つかりません')
        return
      }

      const result = await apiClient.post<{ comment: Comment }>(
        `/api/v1/posts/${post.id}/comments`,
        {
          comment: {
            content: newComment.trim(),
            parent_comment_id: replyingTo
          }
        },
        token
      )

      if (result.success) {
        setComments(prev => [...prev, result.data.comment])
        setNewComment('')
        setReplyingTo(null)
        // コメント一覧を再取得して最新状態を反映
        window.location.reload() // 簡易的な再読み込み
      } else {
        console.error('コメント投稿に失敗しました:', result.error.message)
      }
    } catch (error) {
      console.error('コメント投稿でエラーが発生しました:', error)
    } finally {
      setSubmitting(false)
    }
  }

  // コメント削除確認
  const handleDeleteClick = (commentId: number) => {
    setDeleteCommentId(commentId)
  }

  // コメント削除実行
  const handleConfirmDelete = async () => {
    if (!isAuthenticated || !post || !deleteCommentId || isDeleting) return

    setIsDeleting(true)
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        console.error('認証トークンが見つかりません')
        return
      }

      const result = await apiClient.delete<void>(`/api/v1/posts/${post.id}/comments/${deleteCommentId}`, token)

      if (result.success) {
        setComments(prev => prev.filter(comment => comment.id !== deleteCommentId))
        setDeleteCommentId(null)
      } else {
        console.error('コメント削除に失敗しました:', result.error.message)
      }
    } catch (error) {
      console.error('コメント削除でエラーが発生しました:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  // 削除キャンセル
  const handleCancelDelete = () => {
    setDeleteCommentId(null)
  }

  // 投稿削除確認
  const handleDeletePost = () => {
    setShowDeletePostModal(true)
  }

  // 投稿削除実行
  const handleConfirmDeletePost = async () => {
    if (!isAuthenticated || !post || isDeletingPost) return

    setIsDeletingPost(true)
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        console.error('認証トークンが見つかりません')
        return
      }

      const result = await apiClient.delete<void>(`/api/v1/posts/${post.id}`, token)

      if (result.success) {
        router.push('/')
      } else {
        console.error('投稿削除に失敗しました:', result.error.message)
      }
    } catch (error) {
      console.error('投稿削除でエラーが発生しました:', error)
    } finally {
      setIsDeletingPost(false)
      setShowDeletePostModal(false)
    }
  }

  // 投稿削除キャンセル
  const handleCancelDeletePost = () => {
    setShowDeletePostModal(false)
  }

  // リプライ表示切り替え
  const toggleCommentExpansion = (commentId: number) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev)
      if (newSet.has(commentId)) {
        newSet.delete(commentId)
      } else {
        newSet.add(commentId)
      }
      return newSet
    })
  }

  // コメント総数をカウント（再帰的）
  const getTotalCommentCount = (comments: Comment[]): number => {
    return comments.reduce((total, comment) => {
      return total + 1 + (comment.replies ? getTotalCommentCount(comment.replies) : 0)
    }, 0)
  }

  // 再帰的にコメントを表示するコンポーネント
  const renderComment = (comment: Comment, depth: number = 0) => (
    <div key={comment.id} className="relative">
      <div className="flex space-x-3">
        {/* アイコンエリア */}
        <div className="relative">
          {/* アイコン */}
          <div className={`w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0`}>
            <span className={`text-white font-medium text-sm`}>
              {comment.user.name.charAt(0)}
            </span>
          </div>
        </div>
        
        {/* コンテンツエリア */}
        <div className="flex-1 min-w-0">
          {/* ユーザー名と日時、アクションボタン */}
          <div className="flex justify-between items-start mb-2">
            <div className="flex flex-col flex-1 min-w-0">
              <span className="font-medium text-sm text-gray-900 truncate">{comment.user.name}</span>
              <span className="text-xs text-gray-500">
                {formatDateTime(comment.created_at)}
              </span>
            </div>

            <div className="flex items-center space-x-2 flex-shrink-0">
              {isAuthenticated && (
                <button
                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                  className={`text-gray-400 hover:text-blue-500 ${depth === 0 ? 'text-sm px-2 py-1' : 'text-xs px-1 py-1'} rounded hover:bg-blue-50 transition-colors`}
                  title="返信"
                >
                  <svg className={`${depth === 0 ? 'w-4 h-4' : 'w-3 h-3'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                </button>
              )}
              {isAuthenticated && user && user.id === comment.user.id && (
                <button
                  onClick={() => handleDeleteClick(comment.id)}
                  className={`text-gray-400 hover:text-red-500 ${depth === 0 ? 'text-sm px-2 py-1' : 'text-xs px-1 py-1'} rounded hover:bg-red-50 transition-colors`}
                  title="削除"
                >
                  <svg className={`${depth === 0 ? 'w-4 h-4' : 'w-3 h-3'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          
          {/* コメント本文（ユーザー名と同じレベル） */}
          <div className="mb-2">
            <p className={`text-gray-900 leading-relaxed break-words ${depth === 0 ? '' : 'text-sm'}`}>
              {comment.content}
            </p>
          </div>
        </div>
      </div>
      
      {/* リプライ入力フォーム */}
      {replyingTo === comment.id && isAuthenticated && (
        <div className={`mb-4 bg-gray-50 rounded-lg border border-blue-200 p-${depth === 0 ? '4' : '3'}`}>
          <form onSubmit={handleSubmitComment} className="space-y-3">
            <div className="flex space-x-3">
              <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-medium text-xs">
                  {user?.name?.charAt(0)}
                </span>
              </div>
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="返信を入力..."
                  className="w-full p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  maxLength={255}
                  disabled={submitting}
                />
                <div className="flex justify-between items-center mt-2 flex-wrap gap-2">
                  <span className="text-sm text-gray-500 flex-shrink-0">
                    {newComment.length}/255文字
                  </span>
                  <div className="flex space-x-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => setReplyingTo(null)}
                      className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors whitespace-nowrap"
                    >
                      キャンセル
                    </button>
                    <button
                      type="submit"
                      disabled={!newComment.trim() || submitting}
                      className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors whitespace-nowrap"
                    >
                      {submitting ? '投稿中...' : 'リプライ'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}
      
    </div>
  )

  // 全ての子孫コメントを再帰的に表示する関数（フラット表示）
  const renderAllReplies = (replies: Comment[], parentDepth: number = 0) => {
    return replies.map((reply, index) => (
      <div key={reply.id}>
        <div className="border-t border-gray-200 my-3"></div>
        {renderComment(reply, parentDepth + 1)}
        {reply.replies && reply.replies.length > 0 && renderAllReplies(reply.replies, parentDepth + 1)}
      </div>
    ))
  }

  // 日時フォーマット
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

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
    <div className="max-w-2xl mx-auto px-4 pb-6 -mt-8">
      {/* 戻るボタン */}
      <div className="mb-4">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-800"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          戻る
        </button>
      </div>

      {/* 投稿詳細 */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 px-6 pt-6 pb-4">
        {/* ヘッダー部分 */}
        <div className="mb-4">
          {/* ユーザー情報と日時 */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center">
                <span className="text-white font-medium">
                  {post.user.name.charAt(0)}
                </span>
              </div>
              <div>
                <div className="font-medium text-gray-900">{post.user.name}</div>
                <div className="text-sm text-gray-500">
                  {formatDateTime(post.created_at)}
                </div>
              </div>
            </div>

            {/* 削除ボタン */}
            {isAuthenticated && user && user.id === post.user.id && (
              <button
                onClick={handleDeletePost}
                className="text-gray-400 hover:text-red-500 p-2 rounded hover:bg-red-50 transition-colors"
                title="投稿を削除"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
          
          {/* カテゴリ・成長記録情報 */}
          <div className="flex items-center space-x-2">
            {post.post_type === 'growth_record_post' && post.growth_record ? (
              <Link 
                href={`/growth-records/${post.growth_record.id}`}
                className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 hover:bg-green-200 transition-colors"
              >
                🌱 成長記録
              </Link>
            ) : (
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                post.post_type === 'growth_record_post' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {post.post_type === 'growth_record_post' ? '🌱 成長記録' : '💬 雑談'}
              </span>
            )}
            {post.post_type === 'growth_record_post' && post.category && (
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                {post.category.name}
              </span>
            )}
          </div>
        </div>

        {/* 投稿内容 */}
        <div className="mb-1">
          <p className="text-gray-900 text-lg leading-relaxed">
            {post.content}
          </p>
        </div>

        {/* 投稿画像 */}
        {post.images && post.images.length > 0 && (
          <div className="mb-1">
            <div className={`grid gap-3 ${
              post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
            }`}>
              {post.images.map((imageUrl, index) => (
                <div key={index} className="relative cursor-pointer">
                  <img
                    src={`${API_BASE_URL}${imageUrl}`}
                    alt={`投稿画像 ${index + 1}`}
                    className={`w-full rounded-md border border-gray-200 transition-opacity hover:opacity-90 ${
                      post.images?.length === 1
                        ? 'max-h-96 object-contain'
                        : 'h-48 object-cover'
                    }`}
                    onClick={() => handleImageClick(index)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* アクションボタン */}
        <div className="flex items-center">
          <div className="flex-1 flex justify-center">
            <div className="flex items-center text-gray-500">
              <svg className="w-6 h-6 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.965 8.965 0 01-4.126-1.004L5 21l1.996-3.874A8.965 8.965 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
              </svg>
              <span className="text-sm">
                {getTotalCommentCount(comments)}
              </span>
            </div>
          </div>

          <div className="flex-1 flex justify-center">
            <button
              onClick={handleLikeClick}
              className={`flex items-center justify-center transition-colors ${
                isLiked
                  ? 'text-red-500'
                  : isAuthenticated
                    ? 'text-gray-500 hover:text-red-500'
                    : 'text-gray-300 cursor-not-allowed'
              }`}
              disabled={!isAuthenticated || isLikeLoading}
            >
              <svg
                className="w-6 h-6 mr-1"
                fill={isLiked ? "currentColor" : "none"}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <span className="text-sm">
                {likesCount > 0 ? likesCount : ''}
              </span>
            </button>
          </div>

          <div className="flex-1 flex justify-center">
            <button
              onClick={handleShareClick}
              className="flex items-center text-gray-500 hover:text-blue-500 transition-colors"
              disabled={isSharing}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* PC版: 投稿直下の入力フォーム */}
      <div className="hidden md:block mt-6">
        {isAuthenticated && !replyingTo ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <form onSubmit={handleSubmitComment}>
              <div className="flex space-x-3">
                <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-medium text-sm">
                    {user?.name?.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="コメントを入力"
                    className="w-full p-3 rounded-lg resize-none focus:outline-none border-0 transition-all"
                    rows={1}
                    maxLength={255}
                    disabled={submitting}
                    onFocus={(e) => {
                      e.target.rows = 3;
                    }}
                    onBlur={(e) => {
                      if (!newComment.trim()) {
                        e.target.rows = 1;
                      }
                    }}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-500">
                      {newComment.length}/255文字
                    </span>
                    <button
                      type="submit"
                      disabled={!newComment.trim() || submitting}
                      className="px-6 py-2 bg-blue-500 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors font-medium"
                    >
                      {submitting ? '投稿中...' : '返信'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        ) : !isAuthenticated && (
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 text-center">
            <p className="text-gray-600 mb-4">コメントするにはログインが必要です</p>
            <button
              onClick={() => router.push('/login')}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            >
              ログイン
            </button>
          </div>
        )}
      </div>

      {/* コメント一覧 */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">コメント ({getTotalCommentCount(comments)})</h3>
        
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            コメントがありません
          </div>
        ) : (
          <div className="space-y-6">
            {comments.map((topComment) => (
              <div key={topComment.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                {/* トップレベルコメント */}
                <div className="relative">
                  {/* リプライ開閉ボタン */}
                  {topComment.replies && topComment.replies.length > 0 && (
                    <button
                      onClick={() => toggleCommentExpansion(topComment.id)}
                      className="flex items-center text-gray-500 hover:text-gray-700 text-sm mb-3 transition-colors"
                    >
                      <svg 
                        className={`w-4 h-4 mr-1 transform transition-transform ${
                          expandedComments.has(topComment.id) ? 'rotate-90' : ''
                        }`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      {getTotalCommentCount([topComment]) - 1}件の返信
                      {expandedComments.has(topComment.id) ? 'を隠す' : 'を表示'}
                    </button>
                  )}

                  {/* トップレベルコメントを表示 */}
                  {renderComment(topComment, 0)}
                  
                  {/* 返信を展開表示（全ての子孫コメントを再帰的にフラット表示） */}
                  {topComment.replies && topComment.replies.length > 0 && expandedComments.has(topComment.id) && (
                    <div className="mt-3">
                      {renderAllReplies(topComment.replies)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* モバイル版用のスペース確保 */}
      <div className="md:hidden h-32"></div>

      {/* モバイル版: 画面下部固定入力フォーム */}
      {isAuthenticated && !replyingTo && (
        <div className="md:hidden fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 z-40 transition-all duration-300">
          <div className="p-4">
            <form onSubmit={handleSubmitComment}>
              <div className="flex space-x-3">
                <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-medium text-sm">
                    {user?.name?.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="コメントを入力"
                    className="w-full p-3 rounded-lg resize-none focus:outline-none border-0 transition-all duration-300"
                    rows={1}
                    maxLength={255}
                    disabled={submitting}
                    onFocus={(e) => {
                      e.target.rows = 3;
                      const container = e.target.parentElement?.parentElement?.parentElement?.parentElement;
                      if (container) {
                        (container as HTMLElement).style.bottom = '64px';
                        (container as HTMLElement).style.boxShadow = '0 -4px 16px rgba(0,0,0,0.1)';
                      }
                    }}
                    onBlur={(e) => {
                      if (!newComment.trim()) {
                        e.target.rows = 1;
                        const container = e.target.parentElement?.parentElement?.parentElement?.parentElement;
                        if (container) {
                          (container as HTMLElement).style.bottom = '64px';
                          (container as HTMLElement).style.boxShadow = 'none';
                        }
                      }
                    }}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-500">
                      {newComment.length}/255文字
                    </span>
                    <button
                      type="submit"
                      disabled={!newComment.trim() || submitting}
                      className="px-4 py-2 bg-blue-500 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors text-sm font-medium"
                    >
                      {submitting ? '投稿中...' : '返信'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* コメント削除確認モーダル */}
      {deleteCommentId && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(2px)'
          }}
          onClick={handleCancelDelete}
        >
          <div className="bg-white rounded-lg p-6 m-4 max-w-sm w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">コメントを削除</h3>
            <p className="text-gray-600 mb-6">
              このコメントを削除してもよろしいですか？<br />
              この操作は取り消せません。
            </p>
            <div className="flex space-x-3 justify-end">
              <button
                onClick={handleCancelDelete}
                disabled={isDeleting}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? '削除中...' : '削除する'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 投稿削除確認モーダル */}
      {showDeletePostModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(2px)'
          }}
          onClick={handleCancelDeletePost}
        >
          <div className="bg-white rounded-lg p-6 m-4 max-w-sm w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">投稿を削除</h3>
            <p className="text-gray-600 mb-6">
              この投稿を削除してもよろしいですか？<br />
              この操作は取り消せません。
            </p>
            <div className="flex space-x-3 justify-end">
              <button
                onClick={handleCancelDeletePost}
                disabled={isDeletingPost}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleConfirmDeletePost}
                disabled={isDeletingPost}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeletingPost ? '削除中...' : '削除する'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ログインモーダル */}
      {showLoginModal && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            backdropFilter: 'brightness(0.7)'
          }}
          onClick={() => setShowLoginModal(false)}
        >
          <div className="bg-white rounded-lg p-6 m-4 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4 text-center">ログインが必要です</h2>
            <p className="text-gray-600 mb-6 text-center">
              投稿へのいいね、コメントを行うにはログインが必要です。
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowLoginModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                onClick={() => {
                  setShowLoginModal(false)
                  router.push('/login')
                }}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                ログイン
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}