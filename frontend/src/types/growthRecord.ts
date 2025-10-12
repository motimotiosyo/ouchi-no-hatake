// 成長記録関連の型定義
import { ID, DateTimeString } from './common'

/**
 * 成長記録ステータス
 */
export type GrowthRecordStatus = 'planning' | 'growing' | 'completed' | 'failed'

/**
 * 植物情報
 */
export interface Plant {
  id: ID
  name: string
  description: string
}

/**
 * 成長記録型
 */
export interface GrowthRecord {
  id: ID
  record_number: number
  record_name: string
  location: string | null
  started_on: string | null
  ended_on: string | null
  status: GrowthRecordStatus
  created_at: DateTimeString
  updated_at: DateTimeString
  plant: Plant
  thumbnail_url: string | null
  favorites_count: number
  favorited_by_current_user: boolean
}

/**
 * お気に入りレスポンス
 */
export interface FavoriteResponse {
  message: string
  favorites_count: number
  favorited: boolean
}
