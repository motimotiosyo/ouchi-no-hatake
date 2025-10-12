'use client'

import Link from 'next/link'

export default function PublicHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 bg-[#6AF484] p-4 shadow z-50">
      <div className="flex justify-center">
        <nav className="w-full max-w-2xl min-w-80 flex items-center px-4">
        <Link href="/" className="text-xl font-black pl-6 tracking-wide font-serif">🌱 おうちの畑</Link>
        <div className="ml-auto flex space-x-6 pr-6">
          <Link href="/checker" className="font-medium">野菜診断</Link>
          <Link href="/how-to-use" className="font-medium">使い方</Link>
          <Link href="/login" className="font-medium">ログイン</Link>
          <Link href="/signup" className="font-medium">新規登録</Link>
        </div>
        </nav>
      </div>
    </header>
  )
}