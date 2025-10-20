'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import HamburgerMenu from './HamburgerMenu'

export default function AuthenticatedHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  
  // タイムラインページかどうかを判定
  const isTimelinePage = pathname === '/'
  
  // タブ状態を取得
  const activeTab = searchParams.get('tab') || 'all'
  
  const handleTabChange = (tab: 'all' | 'following') => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (tab === 'following') {
      params.set('tab', 'following')
    } else {
      params.delete('tab')
    }
    
    router.push(`/?${params.toString()}`)
  }
  
  return (
    <header className="fixed top-0 left-0 right-0 shadow z-50">
      {/* ヘッダー本体 */}
      <div className="bg-[#95FB99] py-2 px-4">
        <div className="flex justify-center">
          <nav className="w-full max-w-2xl min-w-80 flex items-center justify-between px-4">
            <Link href="/" className="text-xl font-black tracking-wide font-serif">🌱 おうちの畑</Link>
        
        <div className="flex items-center space-x-3">
          {/* 通知 */}
          <button className="p-1 hover:bg-green-300 rounded font-medium">
            通知
          </button>
          
          {/* ハンバーガーアイコン */}
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="p-1 hover:bg-green-300 rounded"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          </div>
          </nav>
        </div>
      </div>

      {/* タブバー（タイムラインページのみ表示） */}
      {isTimelinePage && (
        <div className="border-b border-gray-200" style={{ background: 'rgba(255, 255, 255, 0.3)', backdropFilter: 'blur(10px)' }}>
          <div className="flex justify-center">
            <div className="w-full max-w-2xl min-w-80 flex">
              <button
                onClick={() => handleTabChange('all')}
                className={`flex-1 py-1 px-4 text-xs font-medium transition-colors ${
                  activeTab === 'all'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                全体
              </button>
              <button
                onClick={() => handleTabChange('following')}
                className={`flex-1 py-1 px-4 text-xs font-medium transition-colors ${
                  activeTab === 'following'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                フォロー中
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ハンバーガーメニュー */}
      <HamburgerMenu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
      />
    </header>
  )
}