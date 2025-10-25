'use client'

import Link from 'next/link'
import { useState } from 'react'
import PublicHamburgerMenu from './PublicHamburgerMenu'

export default function PublicHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 bg-[#6AF484] p-4 shadow z-50">
      <div className="flex justify-center">
        <nav className="w-full max-w-2xl min-w-80 flex items-center justify-between px-4">
          <Link href="/" className="text-xl font-black tracking-wide font-serif">🌱 おうちの畑</Link>

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