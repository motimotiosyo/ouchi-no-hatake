'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useAuthContext as useAuth } from '@/contexts/auth'
import { apiClient } from '@/services/apiClient'

// アバター画像アップロード制限
const AVATAR_UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024 // 10MB
}

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function EditProfileModal({ isOpen, onClose, onSuccess }: Props) {
  const { user, executeProtectedAsync } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // フォーム状態
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || ''
  })

  // アバター画像選択状態
  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>(user?.avatar_url || '')
  const [imageError, setImageError] = useState<string>('')
  const [removeAvatar, setRemoveAvatar] = useState<boolean>(false)

  // ユーザー情報が更新されたらフォームデータを更新
  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        name: user.name,
        bio: user.bio || ''
      })
      setAvatarPreview(user.avatar_url || '')
      setSelectedAvatar(null)
      setRemoveAvatar(false)
      setImageError('')
      setError(null)
    }
  }, [isOpen, user])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setImageError('') // エラーをクリア

    if (!file) return

    // ファイルサイズチェック
    if (file.size > AVATAR_UPLOAD_LIMITS.MAX_FILE_SIZE) {
      setImageError('ファイルサイズは10MB以下にしてください')
      e.target.value = ''
      return
    }

    // ファイル形式チェック
    const allowedTypes = ['image/jpeg', 'image/png']
    if (!allowedTypes.includes(file.type)) {
      setImageError('JPEG（.jpg）またはPNG（.png）形式のみ対応しています')
      e.target.value = ''
      return
    }

    // ファイル名と拡張子の整合性チェック
    const filename = file.name.toLowerCase()
    if ((filename.endsWith('.jpg') || filename.endsWith('.jpeg')) && file.type !== 'image/jpeg') {
      setImageError('ファイル名とファイル形式が一致しません')
      e.target.value = ''
      return
    }
    if (filename.endsWith('.png') && file.type !== 'image/png') {
      setImageError('ファイル名とファイル形式が一致しません')
      e.target.value = ''
      return
    }

    setSelectedAvatar(file)
    setRemoveAvatar(false)

    // プレビュー生成
    const reader = new FileReader()
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveAvatarPreview = () => {
    setSelectedAvatar(null)
    setAvatarPreview('')
    setRemoveAvatar(true)
    setImageError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      setError('ユーザー名は必須です')
      return
    }

    if (formData.bio.length > 500) {
      setError('自己紹介は500文字以内で入力してください')
      return
    }

    setLoading(true)
    setError(null)

    await executeProtectedAsync(async () => {
      const token = localStorage.getItem('auth_token')
      const formDataToSend = new FormData()
      formDataToSend.append('user[name]', formData.name)
      formDataToSend.append('user[bio]', formData.bio)

      if (selectedAvatar) {
        formDataToSend.append('user[avatar]', selectedAvatar)
      }

      if (removeAvatar) {
        formDataToSend.append('user[remove_avatar]', 'true')
      }

      const result = await apiClient.put('/api/v1/users/profile', formDataToSend, token || undefined)

      if (result.success) {
        // AuthContextを更新するために /api/v1/auth/me を呼び出し、localStorageを更新
        const meResult = await apiClient.get<{ user: typeof user }>('/api/v1/auth/me', token || undefined)
        if (meResult.success) {
          localStorage.setItem('auth_user', JSON.stringify(meResult.data.user))
          // ページをリロードしてAuthContextを更新
          window.location.reload()
        }
        onSuccess()
        onClose()
      } else {
        setError(result.error.message || 'プロフィールの更新に失敗しました')
      }

      setLoading(false)
    })
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
    }
  }

  if (!isOpen) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'brightness(0.7)'
      }}
      onClick={handleClose}
    >
      {/* モーダル本体 */}
      <div
        className="relative bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">プロフィール編集</h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* コンテンツ */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* エラー表示 */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* アバター画像 */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              アバター画像
            </label>

            {/* プレビュー */}
            <div className="flex items-center gap-4">
              <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="アバタープレビュー"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-500 text-4xl font-semibold">
                    {user?.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="cursor-pointer px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm">
                  画像を選択
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handleAvatarChange}
                    className="hidden"
                    disabled={loading}
                  />
                </label>

                {(avatarPreview || selectedAvatar) && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatarPreview}
                    disabled={loading}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-sm disabled:opacity-50"
                  >
                    削除
                  </button>
                )}
              </div>
            </div>

            {imageError && (
              <p className="text-red-600 text-sm">{imageError}</p>
            )}
            <p className="text-gray-500 text-xs">
              JPEG（.jpg）またはPNG（.png）形式、10MB以内
            </p>
          </div>

          {/* ユーザー名 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              ユーザー名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
              disabled={loading}
            />
          </div>

          {/* 自己紹介 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              自己紹介
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 h-32 resize-none"
              maxLength={500}
              disabled={loading}
              placeholder="自己紹介を入力してください（最大500文字）"
            />
            <p className="text-gray-500 text-xs text-right">
              {formData.bio.length} / 500
            </p>
          </div>

          {/* ボタン */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50"
            >
              {loading ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}
