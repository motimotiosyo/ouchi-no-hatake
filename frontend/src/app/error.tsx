'use client'

import Link from 'next/link'

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-start justify-center bg-[#E8FEE9] pt-32">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h1 className="text-6xl font-bold text-red-600 mb-4">エラー</h1>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            エラーが発生しました
          </h2>
          <p className="text-gray-600 mb-8">
            申し訳ございません。予期しないエラーが発生しました。
            <br />
            もう一度お試しください。
          </p>

          <div className="flex flex-col gap-4">
            <button
              onClick={reset}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              もう一度試す
            </button>

            <Link
              href="/"
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors inline-block"
            >
              ホームに戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
