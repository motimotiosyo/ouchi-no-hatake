'use client'

import { useState, useEffect, useRef } from 'react'
import { notificationApi } from '@/lib/api/notifications'
import type { Notification } from '@/types/notification'
import { useRouter } from 'next/navigation'
import Logger from '@/utils/logger'

interface NotificationDropdownProps {
  isOpen: boolean
  onClose: () => void
  onUnreadCountChange: (count: number) => void
  token: string | null
  buttonRef: React.RefObject<HTMLButtonElement>
}

export default function NotificationDropdown({
  isOpen,
  onClose,
  onUnreadCountChange,
  token,
  buttonRef,
}: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // ドロップダウン外クリックで閉じる
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node

      // ドロップダウン内またはボタン内のクリックは無視
      if (
        (dropdownRef.current && dropdownRef.current.contains(target)) ||
        (buttonRef.current && buttonRef.current.contains(target))
      ) {
        return
      }

      onClose()
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose, buttonRef])

  // 通知一覧を取得
  useEffect(() => {
    if (!isOpen || !token) return

    const fetchNotifications = async () => {
      setIsLoading(true)
      try {
        const response = await notificationApi.getNotifications(1, token)
        setNotifications(response.notifications)
      } catch (error) {
        Logger.error('Failed to fetch notifications', error instanceof Error ? error : undefined)
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotifications()
  }, [isOpen, token])

  // 通知をクリックした時の処理
  const handleNotificationClick = async (notification: Notification) => {
    if (!token) return

    try {
      // 未読なら既読にする
      if (!notification.read) {
        await notificationApi.markAsRead(notification.id, token)

        // ローカル状態を更新
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
        )

        // 未読数を更新
        const newCount = await notificationApi.getUnreadCount(token)
        onUnreadCountChange(newCount)
      }

      // 該当ページに遷移
      const { notifiable } = notification
      let targetPath = '/'

      switch (notifiable.type) {
        case 'Post':
          targetPath = `/posts/${notifiable.id}`
          break
        case 'Comment':
          targetPath = `/posts/${notifiable.post_id}`
          break
        case 'GrowthRecord':
          targetPath = `/growth-records/${notifiable.id}`
          break
      }

      router.push(targetPath)
      onClose()
    } catch (error) {
      Logger.error('Failed to handle notification click', error instanceof Error ? error : undefined)
    }
  }

  // 全て既読にする
  const handleMarkAllAsRead = async () => {
    if (!token) return

    try {
      await notificationApi.markAllAsRead(token)

      // ローカル状態を更新
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))

      // 未読数を0にする
      onUnreadCountChange(0)
    } catch (error) {
      Logger.error('Failed to mark all as read', error instanceof Error ? error : undefined)
    }
  }

  // 相対時間表示
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'たった今'
    if (diffMins < 60) return `${diffMins}分前`
    if (diffHours < 24) return `${diffHours}時間前`
    if (diffDays < 7) return `${diffDays}日前`
    return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })
  }

  if (!isOpen) return null

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-50"
    >
      {/* ヘッダー */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <h3 className="font-bold text-gray-800">通知</h3>
        {notifications.some((n) => !n.read) && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            全て既読
          </button>
        )}
      </div>

      {/* 通知一覧 */}
      <div className="divide-y divide-gray-100">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">読み込み中...</div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">通知はありません</div>
        ) : (
          notifications.map((notification) => (
            <button
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`w-full text-left p-3 hover:bg-gray-50 transition-colors ${
                !notification.read ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-start gap-2">
                {!notification.read && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 line-clamp-2">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatRelativeTime(notification.created_at)}
                  </p>
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      {/* フッター（もっと見るボタンなど、将来追加可能） */}
    </div>
  )
}
