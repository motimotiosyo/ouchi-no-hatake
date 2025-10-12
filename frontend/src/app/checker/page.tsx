'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/services/apiClient'
import { Question, DiagnosisResult } from '@/types/checker'
import CheckerQuestionPage from '@/components/checker/CheckerQuestionPage'
import CheckerResultPage from '@/components/checker/CheckerResultPage'

export default function CheckerPage() {
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({}) // questionIndex -> choiceId
  const [results, setResults] = useState<DiagnosisResult[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
    setError(null)
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
          <CheckerResultPage results={results} onRetry={handleRetry} />
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
