'use client'

import { DiagnosisResult, SelectedChoice } from '@/types/checker'
import Link from 'next/link'
import { useAuthContext } from '@/contexts/auth'
import { useState } from 'react'

interface CheckerResultPageProps {
  results: DiagnosisResult[]
  selectedChoices: SelectedChoice[]
  onRetry: () => void
}

export default function CheckerResultPage({ results, selectedChoices, onRetry }: CheckerResultPageProps) {
  const { isAuthenticated } = useAuthContext()
  const [isSharing, setIsSharing] = useState(false)
  const [isSelectionOpen, setIsSelectionOpen] = useState(false)
  const [isOtherResultsOpen, setIsOtherResultsOpen] = useState(false)

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
    <div className="px-4 pb-6 -mt-4 animate-fade-in">
      {/* ヘッダー */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">診断結果</h1>
        <p className="text-gray-600">あなたにおすすめの野菜はこちら！</p>
      </div>

      {/* 選択した内容（アコーディオン） */}
      {selectedChoices.length > 0 && (
        <div className="bg-blue-50 rounded-lg shadow-md border border-blue-200 mb-8 overflow-hidden">
          <button
            onClick={() => setIsSelectionOpen(!isSelectionOpen)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-blue-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span className="text-lg font-bold text-gray-800">あなたの選択</span>
            </div>
            <svg
              className={`w-5 h-5 text-gray-600 transition-transform ${isSelectionOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {isSelectionOpen && (
            <div className="px-6 pb-6 space-y-3">
              {selectedChoices.map((choice, index) => (
                <div key={index} className="bg-white rounded-lg p-3 border border-blue-100">
                  <p className="text-sm font-medium text-gray-700 mb-1">{choice.question_text}</p>
                  <p className="text-base text-gray-900 font-semibold">→ {choice.choice_text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* トップ3結果（特別表示） */}
      <div className="space-y-6 mb-8">
        {results.slice(0, 3).map((result, index) => {
          const medalColors = ['text-yellow-500', 'text-gray-400', 'text-orange-600']
          const medalBgs = ['bg-yellow-50', 'bg-gray-50', 'bg-orange-50']
          const borderColors = ['border-yellow-200', 'border-gray-300', 'border-orange-200']
          const sizes = ['text-3xl', 'text-2xl', 'text-xl']
          // 3位から順に表示: 3位(0秒)->2位(1秒)->1位(2秒)
          const animationDelay = (2 - index) * 1000

          return (
            <div
              key={result.plant.id}
              className={`bg-white rounded-lg shadow-lg ${borderColors[index]} border-2 transition-all duration-200 p-6 animate-slide-in-right`}
              style={{ animationDelay: `${animationDelay}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className={`${medalBgs[index]} rounded-full p-3 flex-shrink-0`}>
                  <div className={`${medalColors[index]} ${sizes[index]} font-bold`}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`${sizes[index]} font-bold text-green-600`}>
                      {index + 1}位
                    </span>
                    <h3 className={`${sizes[index]} font-bold text-gray-800`}>
                      {result.plant.name}
                    </h3>
                  </div>
                  <p className="text-gray-600 mb-3 text-base">{result.plant.description}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">適合スコア:</span>
                    <div className="flex-1 max-w-xs bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-green-600 h-3 rounded-full transition-all duration-500"
                        style={{
                          width: `${(result.score / Math.max(...results.map(r => r.score))) * 100}%`
                        }}
                      />
                    </div>
                    <span className="text-base font-bold text-gray-700">{result.score}点</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* 4位以下（その他の結果として折りたたみ） */}
      {results.length > 3 && (
        <div className="mb-8">
          <button
            onClick={() => setIsOtherResultsOpen(!isOtherResultsOpen)}
            className="w-full bg-white rounded-lg shadow-md border border-gray-200 p-5 hover:shadow-lg transition-all duration-200 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              <span className="text-lg font-semibold text-gray-800">
                その他の結果（{results.length - 3}件）
              </span>
            </div>
            <svg
              className={`w-5 h-5 text-gray-500 transition-transform ${isOtherResultsOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isOtherResultsOpen && (
            <div className="mt-4 space-y-3">
              {results.slice(3).map((result, index) => {
                const actualIndex = index + 3
                return (
                  <div
                    key={result.plant.id}
                    className="bg-white rounded-lg shadow border border-gray-200 p-4 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-gray-600">
                          {actualIndex + 1}位
                        </span>
                        <h3 className="text-lg font-bold text-gray-800">
                          {result.plant.name}
                        </h3>
                      </div>
                      <span className="text-base font-medium text-gray-600">{result.score}点</span>
                    </div>
                    <p className="text-gray-600 mt-2 text-sm">{result.plant.description}</p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

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
