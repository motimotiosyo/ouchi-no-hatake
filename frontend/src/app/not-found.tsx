import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-start justify-center bg-[#E8FEE9] pt-32">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h1 className="text-6xl font-bold text-green-600 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            ページが見つかりません
          </h2>
          <p className="text-gray-600 mb-8">
            お探しのページは存在しないか、移動した可能性があります。
          </p>

          <Link
            href="/"
            className="inline-block w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            ホームに戻る
          </Link>
        </div>
      </div>
    </div>
  )
}
