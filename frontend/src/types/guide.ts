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
 * ガイド（詳細）
 */
export interface Guide {
  id: number
  plant: GuidePlant
  steps: GuideStep[]
}
