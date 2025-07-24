'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import GrowthRecordCard from './GrowthRecordCard'
import CreateGrowthRecordModal from './CreateGrowthRecordModal'
import { API_BASE_URL } from '@/lib/api'

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
  const { token } = useAuth()
  const [growthRecords, setGrowthRecords] = useState<GrowthRecord[]>([])
  const [loading, setLoading] = useState(true)
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
      
      const response = await fetch(`${API_BASE_URL}/api/v1/growth_records?page=${page}&per_page=10`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error Response:', response.status, errorText)
        throw new Error(`Failed to fetch growth records: ${response.status} ${errorText}`)
      }
      
      const data = await response.json()
      
      if (data.growth_records && data.pagination) {
        if (append) {
          setGrowthRecords(prev => [...prev, ...data.growth_records])
        } else {
          setGrowthRecords(data.growth_records)
        }
        setPagination(data.pagination)
      }
    } catch (err) {
      setError('成長記録を読み込めませんでした')
      console.error('Error fetching growth records:', err)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [token])

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
    if (token) {
      fetchGrowthRecords()
    }
  }, [token, fetchGrowthRecords])

  const handleCreateSuccess = () => {
    // 成長記録作成成功時に一覧を再取得
    fetchGrowthRecords()
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
          onClick={() => setIsModalOpen(true)}
          className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          ＋ 記録を始める
        </button>
      </div>

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