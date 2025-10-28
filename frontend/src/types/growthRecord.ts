// 成長記録関連の型定義
import { ID, DateTimeString } from './common'

/**
 * 成長記録ステータス
 */
export type GrowthRecordStatus = 'planning' | 'growing' | 'completed' | 'failed'

/**
 * 栽培方法
 */
export type PlantingMethod = 'seed' | 'seedling'

/**
 * 植物情報
 */
export interface Plant {
  id: ID
  name: string
  description: string
}

/**
 * 植物情報（nullable対応）
 */
export type PlantOrNull = Plant | null

/**
 * ガイドステップ
 */
export interface GuideStep {
  id: ID
  growth_record_step_id?: ID
  title: string
  description: string
  position: number
  due_days: number
  phase: number
  applicable_to: string
  adjusted_due_days?: number
  done?: boolean
  completed_at?: string | null
  is_current?: boolean
  is_completed?: boolean
  days_until?: number
}

/**
 * ガイドステップ情報
 */
export interface GuideStepInfo {
  status: 'planning' | 'growing' | 'completed' | 'failed'
  elapsed_days?: number
  total_days?: number
  preparation_step?: GuideStep
  current_step?: GuideStep
  next_step?: GuideStep
  all_steps: GuideStep[]
}

/**
 * ガイド情報（簡易版）
 */
export interface GrowthRecordGuide {
  id: ID
  plant: {
    id: ID
    name: string
  }
  guide_step_info?: GuideStepInfo
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
  planting_method: PlantingMethod | null
  status: GrowthRecordStatus
  created_at: DateTimeString
  updated_at: DateTimeString
  plant: PlantOrNull
  custom_plant_name?: string | null
  guide: GrowthRecordGuide | null
  thumbnail_url: string | null
  favorites_count: number
  favorited_by_current_user: boolean
  user?: {
    id: ID
    name: string
  }
}

/**
 * お気に入りレスポンス
 */
export interface FavoriteResponse {
  message: string
  favorites_count: number
  favorited: boolean
}
