'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import PublicHamburgerMenu from './PublicHamburgerMenu'

export default function PublicHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 bg-[#6AF484] shadow z-50 h-16">
      <div className="flex justify-center h-full">
        <nav className="w-full max-w-2xl min-w-80 flex items-center justify-between px-4">
          <Link href="/" className="flex items-end gap-2 h-full pb-2">
            <Image src="/logo.png" alt="おうちの畑" width={120} height={80} priority className="h-[calc(100%-0.5rem)] w-auto" />
            <span className="text-xl font-bold leading-none pb-1">おうちの畑</span>
          </Link>

          {/* ハンバーガーメニューアイコン（PC・スマホ共通） */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="p-2 hover:bg-green-300 rounded"
            aria-label="メニューを開く"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </nav>
      </div>

      {/* ハンバーガーメニュー */}
      <PublicHamburgerMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />
    </header>
  )
}