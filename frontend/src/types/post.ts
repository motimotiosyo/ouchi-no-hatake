// 投稿関連の型定義
import { ID, DateTimeString } from './common'

/**
 * 投稿タイプ
 */
export type PostType = 'growth_record_post' | 'general_post'

/**
 * 投稿者情報
 */
export interface PostUser {
  id: ID
  name: string
}

/**
 * 成長記録情報（投稿に紐づく）
 */
export interface PostGrowthRecord {
  id: ID
  record_name: string
  plant: {
    id: ID
    name: string
  }
}

/**
 * カテゴリ情報
 */
export interface PostCategory {
  id: ID
  name: string
}

/**
 * 投稿型
 */
export interface Post {
  id: ID
  title: string
  content: string
  post_type: PostType
  created_at: DateTimeString
  images?: string[]
  likes_count: number
  liked_by_current_user: boolean
  comments_count: number
  user: PostUser
  growth_record?: PostGrowthRecord
  category?: PostCategory
}
