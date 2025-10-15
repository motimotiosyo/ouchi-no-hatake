'use client'

import type { GuideStepInfo, GrowthRecordStatus } from '@/types/growthRecord'

interface Props {
  stepInfo: GuideStepInfo
  recordStatus: GrowthRecordStatus
}

export default function GuideStepsDisplay({ stepInfo }: Props) {
  // 計画中の表示
  if (stepInfo.status === 'planning' && stepInfo.preparation_step) {
    return (
      <div className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            準備: {stepInfo.preparation_step.title}
          </h3>
          <p className="text-gray-700">{stepInfo.preparation_step.description}</p>
        </div>

        {/* 全ステップのプレビュー */}
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">栽培スケジュール</h4>
          <div className="space-y-2">
            {stepInfo.all_steps.map((step) => (
              <div
                key={step.id}
                className="flex items-center p-3 bg-gray-50 rounded border border-gray-200"
              >
                <span className="w-8 h-8 flex items-center justify-center bg-gray-300 text-gray-700 rounded-full text-sm font-medium mr-3">
                  {step.position}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{step.title}</p>
                  <p className="text-xs text-gray-500">目安: {step.due_days}日後</p>
                </div>
              </div>
            ))}
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
              {stepInfo.all_steps.map((step) => (
                <div key={step.id} className="relative flex items-start">
                  {/* ステップマーカー */}
                  <div
                    className={`relative z-10 w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium ${
                      step.is_completed
                        ? 'bg-green-500 text-white'
                        : step.is_current
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-300 text-gray-700'
                    }`}
                  >
                    {step.is_completed ? '✓' : step.position}
                  </div>

                  {/* ステップ内容 */}
                  <div className="ml-4 flex-1">
                    <div
                      className={`p-3 rounded border ${
                        step.is_current
                          ? 'bg-blue-50 border-blue-300'
                          : step.is_completed
                          ? 'bg-gray-50 border-gray-200'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <p className="text-sm font-medium text-gray-900">{step.title}</p>
                      <p className="text-xs text-gray-500 mt-1">目安: {step.due_days}日後</p>
                    </div>
                  </div>
                </div>
              ))}
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
