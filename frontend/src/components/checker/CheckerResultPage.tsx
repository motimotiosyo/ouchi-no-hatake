'use client'

import { DiagnosisResult } from '@/types/checker'
import Link from 'next/link'
import { useAuthContext } from '@/contexts/auth'

interface CheckerResultPageProps {
  results: DiagnosisResult[]
  onRetry: () => void
}

export default function CheckerResultPage({ results, onRetry }: CheckerResultPageProps) {
  const { isAuthenticated } = useAuthContext()

  return (
    <div className="px-4 py-6">
      {/* ヘッダー */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">診断結果</h1>
        <p className="text-gray-600">あなたにおすすめの野菜はこちら！</p>
      </div>

      {/* 結果一覧 */}
      <div className="space-y-4 mb-8">
        {results.map((result, index) => (
          <div
            key={result.plant.id}
            className="bg-white rounded-lg shadow-md hover:shadow-lg hover:-translate-y-1 border border-gray-200 transition-all duration-200 p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl font-bold text-green-600">
                    {index + 1}位
                  </span>
                  <h3 className="text-xl font-bold text-gray-800">
                    {result.plant.name}
                  </h3>
                </div>
                <p className="text-gray-600 mb-3">{result.plant.description}</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">適合スコア:</span>
                  <div className="flex-1 max-w-xs bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${(result.score / Math.max(...results.map(r => r.score))) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{result.score}点</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA（行動喚起）*/}
      <div className="bg-green-50 rounded-lg shadow-md border border-gray-200 p-6 mb-6">
        {isAuthenticated ? (
          <div className="text-center">
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              早速育ててみませんか？
            </h3>
            <p className="text-gray-600 mb-4">
              成長記録を作成して、栽培の様子を記録しましょう！
            </p>
            <Link
              href="/growth-records"
              className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              成長記録を作成する
            </Link>
          </div>
        ) : (
          <div className="text-center">
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              会員登録して栽培を始めよう！
            </h3>
            <p className="text-gray-600 mb-4">
              成長記録の作成や他のユーザーとの交流ができます
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/signup"
                className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                会員登録
              </Link>
              <Link
                href="/login"
                className="inline-block bg-gray-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors"
              >
                ログイン
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* もう一度診断ボタン */}
      <div className="text-center">
        <button
          onClick={onRetry}
          className="text-green-600 hover:text-green-700 font-medium underline"
        >
          もう一度診断する
        </button>
      </div>
    </div>
  )
}
