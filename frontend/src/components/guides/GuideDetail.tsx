import { Guide } from '@/types/guide'

interface GuideDetailProps {
  guide: Guide
}

export default function GuideDetail({ guide }: GuideDetailProps) {
  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-t-lg">
        <h1 className="text-3xl font-bold mb-2">{guide.plant.name}</h1>
        <p className="text-green-100">{guide.plant.description}</p>
      </div>

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
