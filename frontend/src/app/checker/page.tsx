'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { apiClient } from '@/services/apiClient'
import { Question, DiagnosisResult, SelectedChoice } from '@/types/checker'
import CheckerQuestionPage from '@/components/checker/CheckerQuestionPage'
import CheckerResultPage from '@/components/checker/CheckerResultPage'

function CheckerPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({}) // questionIndex -> choiceId
  const [results, setResults] = useState<DiagnosisResult[] | null>(null)
  const [selectedChoices, setSelectedChoices] = useState<SelectedChoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasRestoredFromUrl, setHasRestoredFromUrl] = useState(false)
  const [animationKey, setAnimationKey] = useState(0) // アニメーションをリセットするためのkey

  // 質問データ取得
  useEffect(() => {
    const fetchQuestions = async () => {
      setIsLoading(true)
      setError(null)

      const result = await apiClient.getCheckerQuestions()

      if (result.success) {
        setQuestions(result.data.questions)
      } else {
        setError(result.error.message)
      }

      setIsLoading(false)
    }

    fetchQuestions()
  }, [])

  // URLパラメータから結果を復元（初回マウント時のみ）
  useEffect(() => {
    const choiceIdsParam = searchParams.get('choices')
    if (choiceIdsParam && !results && !hasRestoredFromUrl) {
      const restoreResults = async () => {
        setIsLoading(true)
        try {
          const choiceIds = choiceIdsParam.split(',').map(Number)
          const result = await apiClient.submitCheckerAnswers(choiceIds)

          if (result.success) {
            setResults(result.data.results)
            setSelectedChoices(result.data.selected_choices || [])
            setHasRestoredFromUrl(true)
            setAnimationKey(prev => prev + 1) // アニメーションをリセット
          }
        } catch (err) {
          // URLパラメータが不正な場合は無視
        }
        setIsLoading(false)
      }
      restoreResults()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  // 選択肢を選択
  const handleSelectChoice = (choiceId: number) => {
    setAnswers({
      ...answers,
      [currentQuestionIndex]: choiceId
    })
  }

  // 次の質問へ
  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  // 前の質問へ
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  // 診断実行
  const handleSubmit = async () => {
    setIsLoading(true)
    setError(null)

    // 回答された選択肢IDを配列に変換
    const choiceIds = Object.values(answers)

    const result = await apiClient.submitCheckerAnswers(choiceIds)

    if (result.success) {
      setResults(result.data.results)
      setSelectedChoices(result.data.selected_choices || [])
      setAnimationKey(prev => prev + 1) // アニメーションをリセット

      // URLパラメータに選択肢IDを保存（リロード時に結果を復元するため）
      const params = new URLSearchParams()
      params.set('choices', choiceIds.join(','))
      router.push(`/checker?${params.toString()}`, { scroll: false })
    } else {
      setError(result.error.message)
    }

    setIsLoading(false)
  }

  // もう一度診断
  const handleRetry = () => {
    setCurrentQuestionIndex(0)
    setAnswers({})
    setResults(null)
    setSelectedChoices([])
    setError(null)
    setHasRestoredFromUrl(false) // 復元フラグをリセット
    // URLパラメータをクリア
    router.push('/checker', { scroll: false })
  }

  // ローディング画面
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  // エラー画面
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
          >
            トップページへ戻る
          </button>
        </div>
      </div>
    )
  }

  // 結果画面
  if (results) {
    return (
      <div className="flex justify-center">
        <div className="w-full max-w-2xl min-w-80">
          <CheckerResultPage
            key={animationKey}
            results={results}
            selectedChoices={selectedChoices}
            onRetry={handleRetry}
          />
        </div>
      </div>
    )
  }

  // 質問画面
  const currentQuestion = questions[currentQuestionIndex]
  const selectedChoiceId = answers[currentQuestionIndex] ?? null

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-2xl min-w-80">
        <CheckerQuestionPage
          question={currentQuestion}
          currentQuestionIndex={currentQuestionIndex}
          totalQuestions={questions.length}
          selectedChoiceId={selectedChoiceId}
          onSelectChoice={handleSelectChoice}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  )
}

export default function CheckerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    }>
      <CheckerPageContent />
    </Suspense>
  )
}
