import { Guide } from '@/types/guide'

interface GuideDetailProps {
  guide: Guide
}

export default function GuideDetail({ guide }: GuideDetailProps) {
  // 栽培期間を計算
  const totalDays = guide.steps.length > 0 
    ? Math.max(...guide.steps.map(s => s.due_days))
    : 0

  // 必要な道具を生成
  const getRequiredTools = () => {
    const baseTools = ['プランター', '培養土', 'じょうろ', '肥料']
    // ステップに「支柱」「ネット」などのキーワードがあれば追加
    const needsSupport = guide.steps.some(s =>
      s.description.includes('支柱') || s.description.includes('ネット')
    )
    if (needsSupport) baseTools.push('支柱またはネット')
    return baseTools
  }

  // 月文字列を数値配列に変換
  const parseMonths = (monthsStr: string | null): number[] => {
    if (!monthsStr) return []
    return monthsStr.split(',').map(m => parseInt(m.trim(), 10))
  }

  // カレンダーデータの準備
  const calendarRows = [
    { label: '種まき', months: parseMonths(guide.calendar.planting_months), color: 'bg-green-200' },
    { label: '植え付け', months: parseMonths(guide.calendar.transplanting_months), color: 'bg-blue-200' },
    { label: '剪定・\n間引き', months: parseMonths(guide.calendar.pruning_months), color: 'bg-yellow-200' },
    { label: '追肥', months: parseMonths(guide.calendar.fertilizing_months), color: 'bg-orange-200' },
    { label: '収穫', months: parseMonths(guide.calendar.harvesting_months), color: 'bg-red-200' }
  ].filter(row => row.months.length > 0) // 該当月がない活動は表示しない

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-t-lg">
        <h1 className="text-3xl font-bold mb-2">{guide.plant.name}</h1>
        <p className="text-green-100">{guide.plant.description}</p>
      </div>

      {/* 概要情報 */}
      <div className="p-6 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 栽培期間 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">栽培期間</h3>
            <p className="text-lg text-gray-900">約{totalDays}日</p>
          </div>

          {/* 必要な道具 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">必要な道具</h3>
            <div className="flex flex-wrap gap-2">
              {getRequiredTools().map((tool, index) => (
                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                  {tool}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 日常的な手入れ */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">日常的な手入れ</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">💧</span>
              <div>
                <p className="text-sm font-medium text-gray-900">水やり</p>
                <p className="text-xs text-gray-600">土の表面が乾いたら、朝または夕方にたっぷりと</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-yellow-500 mt-0.5">☀️</span>
              <div>
                <p className="text-sm font-medium text-gray-900">日当たり</p>
                <p className="text-xs text-gray-600">1日4〜6時間以上の日光が当たる場所に</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">👀</span>
              <div>
                <p className="text-sm font-medium text-gray-900">観察</p>
                <p className="text-xs text-gray-600">葉の色や害虫の有無を週2〜3回チェック</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 栽培カレンダー */}
      {calendarRows.length > 0 && (
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">栽培カレンダー</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border border-gray-300 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-700 w-24">
                    作業
                  </th>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(month => (
                    <th key={month} className="border border-gray-300 bg-gray-50 px-2 py-2 text-sm font-semibold text-gray-700">
                      {month}月
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {calendarRows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    <td className="border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50">
                      {row.label}
                    </td>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(month => (
                      <td
                        key={month}
                        className={`border border-gray-300 px-2 py-4 ${
                          row.months.includes(month) ? row.color : 'bg-white'
                        }`}
                      />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ステップ一覧 */}
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">育て方ステップ</h2>
        <div className="space-y-6">
          {guide.steps.map((step, index) => (
            <div
              key={step.id}
              className="flex gap-4 pb-6 border-b last:border-b-0 border-gray-200"
            >
              {/* ステップ番号 */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  {index + 1}
                </div>
              </div>

              {/* ステップ内容 */}
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 mb-3">{step.description}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>目安: 開始から{step.due_days}日後</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* フッター */}
        <div className="mt-8 p-4 bg-green-50 rounded-lg">
          <p className="text-sm text-gray-600">
            💡 ヒント: 各ステップの目安日数は参考値です。季節や栽培環境によって変わることがあります。
          </p>
        </div>
      </div>
    </div>
  )
}
