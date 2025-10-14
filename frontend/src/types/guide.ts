// 育て方ガイド関連の型定義

/**
 * 植物情報（簡易版）
 */
export interface GuidePlant {
  id: number
  name: string
  description: string
}

/**
 * ガイドステップ
 */
export interface GuideStep {
  id: number
  title: string
  description: string
  position: number
  due_days: number
}

/**
 * ガイド（一覧用）
 */
export interface GuideListItem {
  id: number
  plant: GuidePlant
  steps_count: number
}

/**
 * 栽培カレンダー情報
 */
export interface GuideCalendar {
  planting_months: string | null
  transplanting_months: string | null
  pruning_months: string | null
  fertilizing_months: string | null
  harvesting_months: string | null
}

/**
 * ガイド（詳細）
 */
export interface Guide {
  id: number
  plant: GuidePlant
  calendar: GuideCalendar
  steps: GuideStep[]
}
