'use client'

import { Question } from '@/types/checker'

interface CheckerQuestionPageProps {
  question: Question
  currentQuestionIndex: number
  totalQuestions: number
  selectedChoiceId: number | null
  onSelectChoice: (choiceId: number) => void
  onNext: () => void
  onPrevious: () => void
  onSubmit: () => void
}

export default function CheckerQuestionPage({
  question,
  currentQuestionIndex,
  totalQuestions,
  selectedChoiceId,
  onSelectChoice,
  onNext,
  onPrevious,
  onSubmit
}: CheckerQuestionPageProps) {
  const isFirstQuestion = currentQuestionIndex === 0
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1

  return (
    <div className="px-4 pb-6 -mt-4">
      {/* タイトルと説明（最初の質問のみ） */}
      {isFirstQuestion && (
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">家庭菜園チェッカー</h1>
          <p className="text-gray-600 text-lg">
            質問に答えて、あなたにぴったりの野菜を見つけましょう！
          </p>
        </div>
      )}

      {/* 進捗表示 */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">
            質問 {currentQuestionIndex + 1} / {totalQuestions}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* 質問文 */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">{question.text}</h2>
      </div>

      {/* 選択肢 */}
      <div className="space-y-4 mb-8">
        {question.choices.map((choice) => (
          <button
            key={choice.id}
            onClick={() => onSelectChoice(choice.id)}
            className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
              selectedChoiceId === choice.id
                ? 'border-green-600 bg-green-50'
                : 'border-gray-300 hover:border-green-400 bg-white'
            }`}
          >
            <span className="text-lg">{choice.text}</span>
          </button>
        ))}
      </div>

      {/* ナビゲーションボタン */}
      <div className="flex justify-between gap-4">
        <button
          onClick={onPrevious}
          disabled={isFirstQuestion}
          className={`px-6 py-3 rounded-lg font-medium ${
            isFirstQuestion
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gray-500 text-white hover:bg-gray-600'
          }`}
        >
          戻る
        </button>

        {isLastQuestion ? (
          <button
            onClick={onSubmit}
            disabled={selectedChoiceId === null}
            className={`px-6 py-3 rounded-lg font-medium ${
              selectedChoiceId === null
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            診断結果を見る
          </button>
        ) : (
          <button
            onClick={onNext}
            disabled={selectedChoiceId === null}
            className={`px-6 py-3 rounded-lg font-medium ${
              selectedChoiceId === null
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            次へ
          </button>
        )}
      </div>
    </div>
  )
}
