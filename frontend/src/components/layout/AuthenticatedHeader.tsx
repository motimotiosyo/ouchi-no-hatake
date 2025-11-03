'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import HamburgerMenu from './HamburgerMenu'
import NotificationDropdown from '../notifications/NotificationDropdown'
import { notificationApi } from '@/lib/api/notifications'
import { useAuthContext as useAuth } from '@/contexts/auth'
import Logger from '@/utils/logger'

export default function AuthenticatedHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const { token } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const notificationButtonRef = useRef<HTMLButtonElement>(null)
  
  // タイムラインページかどうかを判定
  const isTimelinePage = pathname === '/'
  
  // タブ状態を取得
  const activeTab = searchParams.get('tab') || 'all'

  // 未読通知数を取得
  useEffect(() => {
    if (!token) return

    const fetchUnreadCount = async () => {
      try {
        const count = await notificationApi.getUnreadCount(token)
        setUnreadCount(count)
      } catch (error) {
        Logger.error('Failed to fetch unread count', error instanceof Error ? error : undefined)
      }
    }

    fetchUnreadCount()

    // 30秒ごとに未読数を更新
    const interval = setInterval(fetchUnreadCount, 30000)

    return () => clearInterval(interval)
  }, [token])

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
      <div className="bg-[#95FB99] h-16">
        <div className="flex justify-center h-full">
          <nav className="w-full max-w-2xl min-w-80 flex items-center justify-between px-4">
            <Link href="/" className="flex items-end gap-2 h-full pb-2">
              <Image src="/logo.png" alt="おうちの畑" width={120} height={80} priority className="h-[calc(100%-0.5rem)] w-auto" />
              <span className="text-xl font-bold leading-none pb-1">おうちの畑</span>
            </Link>
        
        <div className="flex items-center space-x-3">
          {/* 通知 */}
          <div className="relative">
            <button
              ref={notificationButtonRef}
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="p-2 hover:bg-green-300 rounded relative"
              aria-label="通知"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
            <NotificationDropdown
              isOpen={isNotificationOpen}
              onClose={() => setIsNotificationOpen(false)}
              onUnreadCountChange={setUnreadCount}
              token={token}
              buttonRef={notificationButtonRef}
            />
          </div>
          
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