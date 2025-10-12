'use client'

import { DiagnosisResult } from '@/types/checker'
import Link from 'next/link'
import { useAuthContext } from '@/contexts/auth'
import { useState } from 'react'

interface CheckerResultPageProps {
  results: DiagnosisResult[]
  onRetry: () => void
}

export default function CheckerResultPage({ results, onRetry }: CheckerResultPageProps) {
  const { isAuthenticated } = useAuthContext()
  const [isSharing, setIsSharing] = useState(false)

  // SNSシェア機能
  const handleShare = async () => {
    // トップ3の野菜名を取得
    const topPlants = results.slice(0, 3).map((r, i) => `${i + 1}位: ${r.plant.name}`).join('\n')
    const shareText = `🌱 おうちの畑 - 家庭菜園チェッカー 診断結果 🌱\n\nあなたにおすすめの野菜:\n${topPlants}\n\n`
    const shareUrl = typeof window !== 'undefined' ? window.location.href : ''

    setIsSharing(true)

    try {
      // Web Share API（モバイル対応）
      if (navigator.share) {
        await navigator.share({
          title: 'おうちの畑 - 診断結果',
          text: shareText,
          url: shareUrl
        })
      } else {
        // Twitter Intent URL（デスクトップ）
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText + shareUrl)}`
        window.open(twitterUrl, '_blank', 'noopener,noreferrer')
      }
    } catch (error) {
      // ユーザーがキャンセルした場合など
      if (error instanceof Error && error.name !== 'AbortError') {
        if (process.env.NODE_ENV === 'development') {
          console.error('Share failed:', error)
        }
      }
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <div className="px-4 py-6 animate-fade-in">
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
                      className="bg-green-600 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${(result.score / Math.max(...results.map(r => r.score))) * 100}%`,
                        animationDelay: `${index * 150 + 300}ms`
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{result.score}点</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* SNSシェアボタン */}
      <div className="text-center mb-6">
        <button
          onClick={handleShare}
          disabled={isSharing}
          className="inline-flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
          </svg>
          {isSharing ? 'シェア中...' : '診断結果をシェア'}
        </button>
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
