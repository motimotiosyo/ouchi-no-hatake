'use client'

import Link from 'next/link'

export default function PublicHeader() {
  return (
    <header className="bg-[#6AF484] p-4 shadow">
      <nav className="container mx-auto flex items-center px-4">
        <Link href="/" className="font-medium">ホーム</Link>
        <div className="ml-auto flex space-x-3 mr-4">
          <Link href="/how-to-use" className="font-medium">使い方</Link>
          <Link href="/login" className="font-medium">ログイン</Link>
          <Link href="/signup" className="font-medium">新規登録</Link>
        </div>
      </nav>
    </header>
  )
}