// コメント関連の型定義
import { ID, DateTimeString } from './common'

/**
 * コメント投稿者情報
 */
export interface CommentUser {
  id: ID
  name: string
}

/**
 * 返信先情報
 */
export interface ReplyingTo {
  id: ID
  user_name: string
}

/**
 * コメント型
 */
export interface Comment {
  id: ID
  content: string
  created_at: DateTimeString
  parent_comment_id?: ID
  user: CommentUser
  replying_to?: ReplyingTo
  replies?: Comment[]
}
