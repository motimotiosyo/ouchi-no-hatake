import Link from "next/link"

export default function Home() {
  return (
    <section>
      <h1 className="text-2xl font-bold text-center">
        あなたにピッタリの野菜を見つけてみよう！
      </h1>
      <Link href="/diagnosis">
        <div className="bg-white rounded-lg p-4 shadow-lg p-6 max-w-md mx-auto text-center">
          <h2 className="text-xl font-bold">🔍家庭菜園チェッカー🔰</h2>
          <p className="mt-2">
            まずは簡単な質問に答えて、
          </p>
          <p className="mt-2">
            おすすめの野菜を見つけてみましょう🌱
          </p>
          <p className="mt-2">
            ピッタリな野菜が見つかるかも！？
          </p>
        </div>
      </Link>
    </section>
  )
}