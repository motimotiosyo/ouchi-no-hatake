'use client'

import Link from 'next/link'

interface PublicHamburgerMenuProps {
  isOpen: boolean
  onClose: () => void
}

export default function PublicHamburgerMenu({ isOpen, onClose }: PublicHamburgerMenuProps) {
  if (!isOpen) return null

  return (
    <>
      {/* 薄暗いオーバーレイ - メニュー外クリックで閉じる */}
      <div
        className="fixed inset-0 z-40"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'brightness(0.7)'
        }}
        onClick={onClose}
      />

      {/* メニュー */}
      <div className="fixed top-0 right-0 h-full w-80 max-w-[80vw] bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">メニュー</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* メニュー項目 */}
        <nav className="p-4">
          <Link
            href="/"
            className="block py-3 px-4 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={onClose}
          >
            タイムライン
          </Link>
          <Link
            href="/checker"
            className="block py-3 px-4 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={onClose}
          >
            家庭菜園チェッカー
          </Link>
          <Link
            href="/login"
            className="block py-3 px-4 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={onClose}
          >
            ログイン
          </Link>
          <Link
            href="/signup"
            className="block py-3 px-4 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={onClose}
          >
            新規登録
          </Link>

          <hr className="my-4 border-gray-200" />

          <Link
            href="/privacy-policy"
            className="block py-3 px-4 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={onClose}
          >
            プライバシーポリシー
          </Link>
          <Link
            href="/terms-of-service"
            className="block py-3 px-4 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={onClose}
          >
            利用規約
          </Link>
        </nav>
      </div>
    </>
  )
}
