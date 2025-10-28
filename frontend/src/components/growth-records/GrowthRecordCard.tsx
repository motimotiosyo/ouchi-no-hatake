'use client'

import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { useAuthContext as useAuth } from '@/contexts/auth'
import CreateGrowthRecordModal from './CreateGrowthRecordModal'
import DeleteConfirmDialog from './DeleteConfirmDialog'
import FavoriteButton from './FavoriteButton'

interface GrowthRecord {
  id: number
  record_number: number
  record_name: string
  location: string | null
  started_on: string | null
  ended_on?: string | null
  status: 'planning' | 'growing' | 'completed' | 'failed'
  created_at: string
  updated_at: string
  thumbnail_url?: string | null
  plant: {
    id: number
    name: string
    description: string
  } | null
  custom_plant_name?: string | null
  user?: {
    id: number
    name: string
  }
  favorites_count?: number
  favorited_by_current_user?: boolean
}

interface Props {
  record: GrowthRecord
  onUpdate: () => void
  showFavoriteButton?: boolean
}

export default function GrowthRecordCard({ record, onUpdate, showFavoriteButton = false }: Props) {
  const { user } = useAuth()
  const [showMenu, setShowMenu] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [favoriteCount, setFavoriteCount] = useState(record.favorites_count ?? 0)
  const [isFavorited, setIsFavorited] = useState(record.favorited_by_current_user ?? false)

  // 品種名（plant.name または custom_plant_name）
  const plantDisplayName = record.plant?.name || record.custom_plant_name || '不明な品種'

  // editDataとgrowthRecordをメモ化して再レンダリングを防ぐ
  const editData = useMemo(() => ({
    id: record.id,
    plant_id: record.plant?.id || 0,
    custom_plant_name: record.custom_plant_name,
    record_name: record.record_name,
    location: record.location,
    started_on: record.started_on,
    ended_on: record.ended_on,
    status: record.status,
    thumbnail_url: record.thumbnail_url
  }), [record.id, record.plant?.id, record.custom_plant_name, record.record_name, record.location, record.started_on, record.ended_on, record.status, record.thumbnail_url])

  const growthRecordData = useMemo(() => ({
    id: record.id,
    plant_name: plantDisplayName,
    record_name: record.record_name
  }), [record.id, plantDisplayName, record.record_name])

  // モーダルの開閉コールバックをメモ化
  const handleEditModalClose = useCallback(() => {
    setIsEditModalOpen(false)
  }, [])

  const handleDeleteDialogClose = useCallback(() => {
    setIsDeleteDialogOpen(false)
  }, [])

  const handleFavoriteUpdate = useCallback((favorited: boolean, count: number) => {
    setIsFavorited(favorited)
    setFavoriteCount(count)
  }, [])

  const getStatusText = (status: string | null) => {
    if (!status) return '計画中'
    switch (status) {
      case 'planning':
        return '計画中'
      case 'growing':
        return '育成中'
      case 'completed':
        return '収穫済み'
      case 'failed':
        return '失敗'
      default:
        return status
    }
  }

  const getStatusColor = (status: string | null) => {
    if (!status) return 'bg-yellow-100 text-yellow-800'
    switch (status) {
      case 'planning':
        return 'bg-yellow-100 text-yellow-800'
      case 'growing':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    }).replace(/\//g, ' / ')
  }

return (
    <div
      className="bg-white rounded-lg shadow-md hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02] border border-gray-200 transition-all duration-200 relative"
      style={{
        zIndex: showMenu ? 9999 : 'auto'
      }}
    >
      {/* 背景リンク */}
      <Link
        href={`/growth-records/${record.id}`}
        className="absolute inset-0 z-0 rounded-lg"
        style={{
          pointerEvents: showMenu || isEditModalOpen || isDeleteDialogOpen ? 'none' : 'auto'
        }}
      />
      {/* モバイル表示 */}
      <div className="md:hidden relative z-10 pointer-events-none">
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden pointer-events-auto">
                {record.thumbnail_url ? (
                  <img 
                    src={record.thumbnail_url} 
                    alt={record.record_name} 
                    className="w-full h-full object-cover pointer-events-none"
                  />
                ) : (
                  <span className="text-2xl pointer-events-none">🌱</span>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{plantDisplayName}</h3>
                <p className="text-sm text-gray-600">{record.record_name}</p>
                {record.user && (
                  <p className="text-xs text-gray-500">by {record.user.name}</p>
                )}
              </div>
            </div>
            {!showFavoriteButton && (
              <div className="relative pointer-events-auto" style={{ zIndex: 100 }}>
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <span className="text-lg">⋯</span>
                </button>
                {showMenu && (
                  <>
                    <div
                      className="fixed inset-0"
                      style={{ zIndex: 999 }}
                      onClick={() => setShowMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200" style={{ zIndex: 1000 }}>
                      <Link href={`/growth-records/${record.id}`} className="w-full px-4 py-2 text-left text-sm text-blue-600 hover:bg-gray-50 block">
                        詳細
                      </Link>
                      <button
                        onClick={() => {
                          setShowMenu(false)
                          setIsEditModalOpen(true)
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-900 hover:bg-gray-50"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => {
                          setShowMenu(false)
                          setIsDeleteDialogOpen(true)
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-900 hover:bg-gray-50"
                      >
                        削除
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-2 flex-wrap">
              <div
                className="pointer-events-auto cursor-default relative"
                style={{ zIndex: 10 }}
                onClick={(e) => e.preventDefault()}
              >
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                  {getStatusText(record.status)}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                {formatDate(record.created_at)}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-xs">
                {record.started_on ? formatDate(record.started_on) : '--/--'} 〜 {record.ended_on ? formatDate(record.ended_on) : '--/--'}
              </div>
              {showFavoriteButton && user && (
                <div className="pointer-events-auto">
                  <FavoriteButton
                    growthRecordId={record.id}
                    initialFavorited={isFavorited}
                    initialCount={favoriteCount}
                    onUpdate={handleFavoriteUpdate}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* デスクトップ表示 */}
      <div className="hidden md:block relative z-10 pointer-events-none">
        <div className="py-3 px-4">
          <div className="flex items-center space-x-4">
            {/* サムネイル用スペース */}
            <div className="w-20 h-20 min-h-20 aspect-square bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden pointer-events-auto">
              {record.thumbnail_url ? (
                <img 
                  src={record.thumbnail_url} 
                  alt={record.record_name} 
                  className="w-full h-full object-cover pointer-events-none"
                />
              ) : (
                <span className="text-2xl pointer-events-none">🌱</span>
              )}
            </div>
            
            {/* メイン情報 */}
            <div className="flex-1 min-w-0">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-gray-900 text-lg truncate">
                    {plantDisplayName}
                    {record.record_name && ` - ${record.record_name}`}
                  </div>
                  <div className="flex items-center space-x-2 ml-4" style={{ position: 'relative', zIndex: 10 }}>
                    <div 
                      className="pointer-events-auto cursor-default"
                      onClick={(e) => e.preventDefault()}
                    >
                      <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                        {record.location}
                      </span>
                    </div>
                    <div 
                      className="pointer-events-auto cursor-default"
                      onClick={(e) => e.preventDefault()}
                    >
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                        {getStatusText(record.status)}
                      </span>
                    </div>
                    {!showFavoriteButton && (
                      <div className="relative pointer-events-auto" style={{ zIndex: 100 }}>
                        <button
                          onClick={() => setShowMenu(!showMenu)}
                          className="px-2 py-1 text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                          <span className="text-2xl">⋯</span>
                        </button>
                        {showMenu && (
                          <>
                            <div
                              className="fixed inset-0"
                              style={{ zIndex: 999 }}
                              onClick={() => setShowMenu(false)}
                            />
                            <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200" style={{ zIndex: 1000 }}>
                              <button
                                onClick={() => {
                                  setShowMenu(false)
                                  setIsEditModalOpen(true)
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-gray-900 hover:bg-gray-50"
                              >
                                編集
                              </button>
                              <button
                                onClick={() => {
                                  setShowMenu(false)
                                  setIsDeleteDialogOpen(true)
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-gray-900 hover:bg-gray-50"
                              >
                                削除
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-3">
                      <div className="text-xs text-gray-500">{formatDate(record.created_at)}</div>
                      <div className="text-xs">
                        {record.started_on ? formatDate(record.started_on) : '--/--'} 〜 {record.ended_on ? formatDate(record.ended_on) : '--/--'}
                      </div>
                    </div>
                    {showFavoriteButton && user && (
                      <div className="pointer-events-auto ml-2">
                        <FavoriteButton
                          growthRecordId={record.id}
                          initialFavorited={isFavorited}
                          initialCount={favoriteCount}
                          onUpdate={handleFavoriteUpdate}
                        />
                      </div>
                    )}
                  </div>
                  {record.user && (
                    <div className="text-xs text-gray-500">投稿者: {record.user.name}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 編集モーダル（Portalでbody直下にレンダリング） */}
      {typeof document !== 'undefined' && createPortal(
        <CreateGrowthRecordModal
          isOpen={isEditModalOpen}
          onClose={handleEditModalClose}
          onSuccess={onUpdate}
          editData={editData}
        />,
        document.body
      )}

      {/* 削除確認ダイアログ（Portalでbody直下にレンダリング） */}
      {typeof document !== 'undefined' && createPortal(
        <DeleteConfirmDialog
          isOpen={isDeleteDialogOpen}
          onClose={handleDeleteDialogClose}
          onSuccess={onUpdate}
          growthRecord={growthRecordData}
        />,
        document.body
      )}
    </div>
  )
}