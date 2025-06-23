export default function DashboardPage() {
  return (
    <div className="min-h-screen py-8">  {/* bg-gray-50を削除 */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            ダッシュボード
          </h1>
          <p className="text-gray-600 mb-6">
            ログインに成功しました！これは一時的なダッシュボードページです。
          </p>

          {/* 以下はそのまま */}
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            {/* ... */}
          </div>

          <div className="mt-6">
            <a 
              href="/login"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              ログインページに戻る
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}