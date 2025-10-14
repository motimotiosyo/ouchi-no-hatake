'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuthContext as useAuth } from '@/contexts/auth'
import { apiClient } from '@/services/apiClient'
import GrowthRecordCard from './GrowthRecordCard'
import CreateGrowthRecordModal from './CreateGrowthRecordModal'
import Link from 'next/link'

interface GrowthRecord {
  id: number
  record_number: number
  record_name: string
  location: string
  started_on: string
  ended_on?: string
  status: 'planning' | 'growing' | 'completed' | 'failed'
  created_at: string
  updated_at: string
  plant: {
    id: number
    name: string
    description: string
  }
}

interface PaginationInfo {
  current_page: number
  per_page: number
  total_count: number
  has_more: boolean
}

export default function GrowthRecordList() {
  const { user, executeProtected } = useAuth()
  const [growthRecords, setGrowthRecords] = useState<GrowthRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const observer = useRef<IntersectionObserver | null>(null)

  const fetchGrowthRecords = useCallback(async (page: number = 1, append: boolean = false) => {
    try {
      if (page === 1) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }
      setError(null)

      const token = localStorage.getItem('auth_token')
      const result = await apiClient.get<{ growth_records: GrowthRecord[], pagination: PaginationInfo }>(
        `/api/v1/growth_records?page=${page}&per_page=10`,
        token || undefined
      )

      if (result.success) {
        if (append) {
          setGrowthRecords(prev => [...prev, ...result.data.growth_records])
        } else {
          setGrowthRecords(result.data.growth_records)
        }
        setPagination(result.data.pagination)
      } else {
        setError(result.error.message)
      }
    } catch (err) {
      console.error('成長記録の取得でエラーが発生しました:', err)
      setError('成長記録の取得に失敗しました')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  const lastRecordElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading || loadingMore) return
    if (observer.current) observer.current.disconnect()
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && pagination?.has_more) {
        fetchGrowthRecords(pagination.current_page + 1, true)
      }
    })
    
    if (node) observer.current.observe(node)
  }, [loading, loadingMore, pagination, fetchGrowthRecords])

  useEffect(() => {
    if (user) {
      fetchGrowthRecords()
    }
  }, [user, fetchGrowthRecords])

  const handleCreateSuccess = () => {
    // 成長記録作成成功時に一覧を再取得
    fetchGrowthRecords()
  }

  const handleCreateButtonClick = () => {
    executeProtected(() => {
      setIsModalOpen(true)
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-red-600">{error}</div>
      </div>
    )
  }

  return (
    <div style={{ minWidth: '360px' }}>
      {/* 記録を始めるボタン */}
      <div className="flex justify-center mb-6">
        <button
          onClick={handleCreateButtonClick}
          className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          ＋ 記録を始める
        </button>
      </div>

      {/* 家庭菜園チェッカーへの誘導バナー */}
      <Link href="/checker">
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow-md border-2 border-green-200 p-6 mb-6 hover:shadow-lg hover:border-green-300 transition-all cursor-pointer">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="bg-green-500 rounded-full p-3">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                🌱 何を育てるか迷っていませんか？
              </h3>
              <p className="text-gray-700 mb-3">
                簡単な質問に答えるだけで、あなたにぴったりの野菜が見つかります！
              </p>
              <div className="flex items-center gap-2 text-green-600 font-semibold">
                <span>家庭菜園チェッカーで診断する</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* 成長記録一覧 */}
      {growthRecords.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500">まだ成長記録がありません</div>
        </div>
      ) : (
        <>
          {growthRecords.map((record, index) => (
            <div
              key={record.id}
              ref={index === growthRecords.length - 1 ? lastRecordElementRef : undefined}
              className="mb-4"
            >
              <GrowthRecordCard record={record} onUpdate={() => fetchGrowthRecords()} />
            </div>
          ))}
        </>
      )}

      {/* 読み込み中インジケーター */}
      {loadingMore && (
        <div className="flex justify-center items-center py-4">
          <div className="text-gray-600">さらに読み込み中...</div>
        </div>
      )}

      {/* 全件読み込み完了 */}
      {pagination && !pagination.has_more && growthRecords.length > 0 && (
        <div className="text-center py-8">
          <div className="text-gray-500">すべての成長記録を表示しました</div>
        </div>
      )}

      {/* 成長記録作成モーダル */}
      <CreateGrowthRecordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  )
}