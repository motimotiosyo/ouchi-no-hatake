// 共通型定義

/**
 * ID型の定義
 */
export type ID = number

/**
 * ISO8601形式の日時文字列
 */
export type DateTimeString = string

/**
 * ページネーション関連の型定義
 */
export interface PaginationParams {
  page?: number
  per_page?: number
  limit?: number
  offset?: number
}

export interface PaginationMeta {
  current_page: number
  total_pages: number
  total_count: number
  per_page: number
  has_next_page: boolean
  has_prev_page: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}

/**
 * タイムスタンプ付きエンティティの基底型
 */
export interface TimestampedEntity {
  created_at: DateTimeString
  updated_at: DateTimeString
}

/**
 * ソート順の定義
 */
export type SortOrder = 'asc' | 'desc'

/**
 * ソートパラメータの定義
 */
export interface SortParams {
  sort_by?: string
  order?: SortOrder
}

/**
 * 検索パラメータの定義
 */
export interface SearchParams {
  query?: string
  keyword?: string
}

/**
 * 共通のクエリパラメータ
 */
export type QueryParams = PaginationParams & SortParams & SearchParams
