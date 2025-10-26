'use client'

import { useState, forwardRef } from 'react'
import type { GuideStepInfo, GrowthRecordStatus } from '@/types/growthRecord'
import DatePicker, { registerLocale } from 'react-datepicker'
import { ja } from 'date-fns/locale/ja'
import 'react-datepicker/dist/react-datepicker.css'

registerLocale('ja', ja)

// カレンダーアイコン付き入力欄
interface DateInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onClick'> {
  onClick?: () => void
}

const DateInputWithIcon = forwardRef<HTMLInputElement, DateInputProps>(
  ({ value, onClick, onChange, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <input
          {...props}
          value={value}
          onChange={onChange}
          ref={ref}
          placeholder="yyyy/MM/dd"
          className="w-full px-3 py-2 pr-10 text-base border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          type="button"
          onClick={onClick}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 z-10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
      </div>
    )
  }
)
DateInputWithIcon.displayName = 'DateInputWithIcon'

interface Props {
  stepInfo: GuideStepInfo
  recordStatus: GrowthRecordStatus
  plantingMethod: 'seed' | 'seedling' | null
  isOwner?: boolean
  onStepComplete?: (stepId: number, completedAt: string) => Promise<void>
  onStepUncomplete?: (stepId: number) => Promise<void>
}

export default function GuideStepsDisplay({ stepInfo, recordStatus, plantingMethod, isOwner = false, onStepComplete, onStepUncomplete }: Props) {
  const [showDateInput, setShowDateInput] = useState<number | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
  // 計画中の表示
  if (stepInfo.status === 'planning' && stepInfo.preparation_step) {
    return (
      <div className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
              準備: {stepInfo.preparation_step.title}
            </h3>
            <p className="text-gray-700">{stepInfo.preparation_step.description}</p>
          </div>
        </div>

        {/* 全ステップのプレビュー */}
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">栽培スケジュール</h4>
          <div className="space-y-2">
            {stepInfo.all_steps.map((step, index) => {
              // Phase 0を除いた連番を計算
              const displayNumber = stepInfo.all_steps.slice(0, index).filter(s => s.phase !== 0).length + 1

              // Phase 0（準備）が完了しているか確認
              const phase0Step = stepInfo.all_steps.find(s => s.phase === 0)
              const isPhase0Complete = phase0Step?.done || false

              // 苗から栽培の場合、Phase 1（種まき）とPhase 2（育苗）はスキップ
              const isSkippedPhase = plantingMethod === 'seedling' && (step.phase === 1 || step.phase === 2)

              // Phase 0（準備）、Phase 1（種まき）、Phase 3（植え付け）のみ計画中で完了可能
              // ただし、Phase 1とPhase 3はPhase 0完了後のみ
              // 苗から栽培の場合はPhase 1をスキップ
              const canCompleteInPlanning = !isSkippedPhase && (
                step.phase === 0 ||
                ((step.phase === 1 || step.phase === 3) && isPhase0Complete)
              )

              return (
                <div key={step.id}>
                  <div
                    className={`p-3 rounded border ${
                      isSkippedPhase
                        ? 'bg-gray-100 border-gray-300 opacity-50'
                        : step.done ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start">
                      <span className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium mr-3 flex-shrink-0 ${
                        isSkippedPhase
                          ? 'bg-gray-400 text-gray-600 line-through'
                          : step.done ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700'
                      }`}>
                        {isSkippedPhase ? '−' : step.done ? '✓' : step.phase === 0 ? '準' : displayNumber}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{step.title}</p>
                        {isSkippedPhase ? (
                          <p className="text-xs text-gray-500">苗から栽培のためスキップ</p>
                        ) : (
                          <>
                            <p className="text-xs text-gray-500">目安: {step.due_days}日後</p>
                            {step.phase !== 0 && step.done && step.completed_at && (
                              <p className="text-xs text-green-600 mt-1">完了日: {step.completed_at}</p>
                            )}
                          </>
                        )}
                      </div>

                      {/* 完了登録・編集ボタン（Phase 0, 1, 3のみ） */}
                      {isOwner && canCompleteInPlanning && onStepComplete && step.growth_record_step_id && (
                        <div className="ml-3 flex gap-2 flex-shrink-0">
                          {step.phase === 0 ? (
                            // Phase 0（準備）はチェックボックス形式
                            !step.done ? (
                              <button
                                onClick={() => {
                                  if (step.growth_record_step_id) {
                                    onStepComplete(step.growth_record_step_id, new Date().toISOString().split('T')[0])
                                  }
                                }}
                                className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors whitespace-nowrap"
                              >
                                準備を完了
                              </button>
                            ) : (
                              onStepUncomplete && (
                                <button
                                  onClick={() => {
                                    if (step.growth_record_step_id) onStepUncomplete(step.growth_record_step_id)
                                  }}
                                  className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors whitespace-nowrap"
                                >
                                  完了を取消
                                </button>
                              )
                            )
                          ) : (
                            // Phase 1, 3は日付入力あり
                            !step.done ? (
                              <button
                                onClick={() => {
                                  if (step.growth_record_step_id && canCompleteInPlanning) {
                                    setSelectedDate(new Date())
                                    setShowDateInput(step.growth_record_step_id)
                                  }
                                }}
                                disabled={!canCompleteInPlanning}
                                className={`px-3 py-1 text-xs rounded transition-colors whitespace-nowrap ${
                                  canCompleteInPlanning
                                    ? 'bg-green-500 text-white hover:bg-green-600'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                              >
                                完了を記録
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={() => {
                                    if (step.growth_record_step_id && step.completed_at) {
                                      setSelectedDate(new Date(step.completed_at))
                                      setShowDateInput(step.growth_record_step_id)
                                    }
                                  }}
                                  className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors whitespace-nowrap"
                                >
                                  日付を編集
                                </button>
                                {onStepUncomplete && (
                                  <button
                                    onClick={() => {
                                      if (step.growth_record_step_id) onStepUncomplete(step.growth_record_step_id)
                                    }}
                                    className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors whitespace-nowrap"
                                  >
                                    完了を取消
                                  </button>
                                )}
                              </>
                            )
                          )}
                        </div>
                      )}
                    </div>

                    {/* 日付入力UI（Phase 0以外） */}
                    {step.phase !== 0 && showDateInput === step.growth_record_step_id && onStepComplete && (
                      <div className="mt-3 ml-0 md:ml-11 p-3 bg-blue-50 border border-blue-200 rounded">
                        {/* Phase 1（種まき）またはPhase 3（植え付け）の未完了時の警告 */}
                        {!step.done && (step.phase === 1 || step.phase === 3) && (
                          <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                            <p className="text-xs text-yellow-700">
                              ⚠️ {step.phase === 1 ? '種まき' : '植え付け'}を完了すると、ステータスが育成中に変わり、計画中には戻せなくなります
                            </p>
                          </div>
                        )}
                        <label className="block text-xs font-medium text-gray-700 mb-2">
                          完了日を入力してください
                        </label>
                        <div className="flex flex-col md:flex-row gap-2">
                          <DatePicker
                            selected={selectedDate}
                            onChange={(date) => setSelectedDate(date)}
                            dateFormat="yyyy年MM月dd日"
                            locale="ja"
                            customInput={<DateInputWithIcon />}
                            wrapperClassName="w-full md:flex-1"
                            popperClassName="z-[10001]"
                            preventOpenOnFocus
                            shouldCloseOnSelect
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => setShowDateInput(null)}
                              className="flex-1 md:flex-none px-4 py-2 text-sm bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors whitespace-nowrap"
                            >
                              キャンセル
                            </button>
                            <button
                              onClick={async () => {
                                if (step.growth_record_step_id && selectedDate) {
                                  const dateStr = selectedDate instanceof Date 
                                    ? selectedDate.toISOString().split('T')[0]
                                    : selectedDate
                                  await onStepComplete(step.growth_record_step_id, dateStr)
                                  setShowDateInput(null)
                                }
                              }}
                              className="flex-1 md:flex-none px-4 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors whitespace-nowrap"
                            >
                              記録
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // 育成中の表示
  if (stepInfo.status === 'growing') {
    return (
      <div className="space-y-4">
        {/* 経過日数 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            栽培開始から <span className="font-bold text-lg">{stepInfo.elapsed_days}</span> 日経過
          </p>
        </div>

        {/* 現在のステップ */}
        {stepInfo.current_step && (
          <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium mr-2">
                現在
              </span>
              <h3 className="text-lg font-semibold text-green-800">
                {stepInfo.current_step.title}
              </h3>
            </div>
            <p className="text-gray-700 mb-2">{stepInfo.current_step.description}</p>
            <p className="text-sm text-gray-600">目安: {stepInfo.current_step.due_days}日後</p>
          </div>
        )}

        {/* 次のステップ */}
        {stepInfo.next_step && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <span className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-medium mr-2">
                次
              </span>
              <h3 className="text-lg font-semibold text-orange-800">
                {stepInfo.next_step.title}
              </h3>
            </div>
            <p className="text-gray-700 mb-2">{stepInfo.next_step.description}</p>
            <div className="flex justify-between items-center text-sm">
              <p className="text-gray-600">目安: {stepInfo.next_step.due_days}日後</p>
              {stepInfo.next_step.days_until !== undefined && stepInfo.next_step.days_until > 0 && (
                <p className="text-orange-600 font-medium">
                  あと{stepInfo.next_step.days_until}日
                </p>
              )}
            </div>
          </div>
        )}

        {/* タイムライン */}
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">栽培タイムライン</h4>
          <div className="relative">
            {/* 縦線 */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300"></div>

            <div className="space-y-4">
              {stepInfo.all_steps.map((step, index) => {
                // Phase 0を除いた連番を計算
                const displayNumber = stepInfo.all_steps.slice(0, index).filter(s => s.phase !== 0).length + 1

                // Phase 3（植え付け）の完了状況を確認
                const phase3Step = stepInfo.all_steps.find(s => s.phase === 3)
                const isPhase3Complete = phase3Step?.done || false

                // スキップ判定:
                // - 苗から栽培の場合、Phase 1（種まき）とPhase 2（育苗）はスキップ
                // - Phase 3完了時、Phase 1とPhase 2はスキップ（植え付けから開始した場合）
                const isSkippedPhase = (plantingMethod === 'seedling' && (step.phase === 1 || step.phase === 2)) ||
                  (isPhase3Complete && (step.phase === 1 || step.phase === 2))

                // 前のステップが完了しているか確認（順次活性化）
                // スキップ対象のフェーズは無視する
                const previousSteps = stepInfo.all_steps.slice(0, index).filter(s => {
                  const isPrevSkipped = (plantingMethod === 'seedling' && (s.phase === 1 || s.phase === 2)) ||
                    (isPhase3Complete && (s.phase === 1 || s.phase === 2))
                  return !isPrevSkipped
                })
                const canComplete = !isSkippedPhase && (previousSteps.length === 0 || previousSteps.every(s => s.done))

                return (
                  <div key={step.id} className="relative flex items-start">
                    {/* ステップマーカー */}
                    <div
                      className={`relative z-10 w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium ${
                        isSkippedPhase
                          ? 'bg-gray-400 text-gray-600'
                          : step.is_completed
                          ? 'bg-green-500 text-white'
                          : step.is_current
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-300 text-gray-700'
                      }`}
                    >
                      {isSkippedPhase ? '−' : step.is_completed ? '✓' : step.phase === 0 ? '準' : displayNumber}
                    </div>

                  {/* ステップ内容 */}
                  <div className="ml-4 flex-1">
                    <div
                      className={`p-3 rounded border ${
                        isSkippedPhase
                          ? 'bg-gray-100 border-gray-300 opacity-50'
                          : step.is_current
                          ? 'bg-blue-50 border-blue-300'
                          : step.is_completed
                          ? 'bg-gray-50 border-gray-200'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{step.title}</p>
                            {isSkippedPhase ? (
                              <p className="text-xs text-gray-500 mt-1">
                                {plantingMethod === 'seedling'
                                  ? '苗から栽培のためスキップ'
                                  : '植え付けから開始したためスキップ'}
                              </p>
                            ) : (
                              <>
                                <p className="text-xs text-gray-500 mt-1">目安: {step.due_days}日後</p>
                                {step.done && step.completed_at && (
                                  <p className="text-xs text-green-600 mt-1">完了日: {step.completed_at}</p>
                                )}
                              </>
                            )}
                          </div>
                          {isOwner && onStepComplete && step.growth_record_step_id && (
                            <div className="ml-3">
                              {step.phase === 0 ? (
                                // Phase 0（準備）はチェック形式（育成中では常に完了済みのはず）
                                step.done && (
                                  <span className="text-xs text-green-600">✓ 完了</span>
                                )
                              ) : (
                                // Phase 1以降は日付管理
                                !step.done ? (
                                  <button
                                    onClick={() => {
                                      if (canComplete) {
                                        setSelectedDate(new Date())
                                        setShowDateInput(step.growth_record_step_id!)
                                      }
                                    }}
                                    disabled={!canComplete}
                                    className={`px-3 py-1 text-xs rounded transition-colors ${
                                      canComplete
                                        ? 'bg-green-500 text-white hover:bg-green-600'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                                  >
                                    完了を記録
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => {
                                      if (step.completed_at) {
                                        setSelectedDate(new Date(step.completed_at))
                                        setShowDateInput(step.growth_record_step_id!)
                                      }
                                    }}
                                    className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                  >
                                    日付を編集
                                  </button>
                                )
                              )}
                            </div>
                          )}
                        </div>

                        {/* 日付入力UI（Phase 0以外） */}
                        {showDateInput === step.growth_record_step_id && onStepComplete && step.phase !== 0 && (
                          <div className="mt-3 p-3 bg-white border border-gray-300 rounded">
                            <label className="block text-xs font-medium text-gray-700 mb-2">
                              完了日を入力してください
                            </label>
                            <div className="flex flex-col md:flex-row gap-2">
                              <DatePicker
                                selected={selectedDate}
                                onChange={(date) => setSelectedDate(date)}
                                dateFormat="yyyy年MM月dd日"
                                locale="ja"
                                customInput={<DateInputWithIcon />}
                                wrapperClassName="w-full md:flex-1"
                                popperClassName="z-[10001]"
                                preventOpenOnFocus
                                shouldCloseOnSelect
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setShowDateInput(null)}
                                  className="flex-1 md:flex-none px-4 py-2 text-sm bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors whitespace-nowrap"
                                >
                                  キャンセル
                                </button>
                                <button
                                  onClick={async () => {
                                    if (step.growth_record_step_id && selectedDate) {
                                      const dateStr = selectedDate instanceof Date 
                                        ? selectedDate.toISOString().split('T')[0]
                                        : selectedDate
                                      await onStepComplete(step.growth_record_step_id, dateStr)
                                      setShowDateInput(null)
                                    }
                                  }}
                                  className="flex-1 md:flex-none px-4 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors whitespace-nowrap"
                                >
                                  記録
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 完了/失敗の表示
  if (stepInfo.status === 'completed' || stepInfo.status === 'failed') {
    return (
      <div className="space-y-4">
        {/* 総日数 */}
        {stepInfo.total_days !== undefined && (
          <div className={`border rounded-lg p-4 ${
            stepInfo.status === 'completed'
              ? 'bg-blue-50 border-blue-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <p className={`text-sm ${
              stepInfo.status === 'completed' ? 'text-blue-800' : 'text-red-800'
            }`}>
              栽培期間: <span className="font-bold text-lg">{stepInfo.total_days}</span> 日間
            </p>
          </div>
        )}

        {/* 全ステップの振り返り */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">栽培の記録</h4>
          <div className="space-y-3">
            {stepInfo.all_steps.map((step) => (
              <div
                key={step.id}
                className="flex items-start p-3 bg-gray-50 rounded border border-gray-200"
              >
                <span className="w-8 h-8 flex items-center justify-center bg-gray-400 text-white rounded-full text-sm font-medium mr-3">
                  {step.position}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{step.title}</p>
                  <p className="text-xs text-gray-600 mt-1">{step.description}</p>
                  <p className="text-xs text-gray-500 mt-1">目安: {step.due_days}日後</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return null
}
