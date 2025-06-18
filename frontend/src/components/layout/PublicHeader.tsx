import Link from 'next/link'

export default function PublicHeader() {
  return (
    <header className="bg-green-100 p-4 shadow">
      <nav className="container mx-auto flex space-x-6">
        <Link href="/" className="font-medium">ホーム</Link>
        <Link href="/how-to-use" className="font-medium">使い方</Link>
        <Link href="/login" className="font-medium">ログイン</Link>
        <Link href="/signup" className="font-medium">新規登録</Link>
      </nav>
    </header>
  )
}