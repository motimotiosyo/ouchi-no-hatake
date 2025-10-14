// 家庭菜園チェッカー関連の型定義
import { ID } from './common'

/**
 * 選択肢
 */
export interface Choice {
  id: ID
  text: string
}

/**
 * 質問
 */
export interface Question {
  id: ID
  text: string
  choices: Choice[]
}

/**
 * 診断結果の植物情報
 */
export interface DiagnosisPlant {
  id: ID
  name: string
  description: string
}

/**
 * 診断結果
 */
export interface DiagnosisResult {
  plant: DiagnosisPlant
  score: number
}

/**
 * 選択した内容
 */
export interface SelectedChoice {
  question_text: string
  choice_text: string
}
