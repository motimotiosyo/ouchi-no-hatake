'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { apiClient } from '@/services/apiClient'
import GrowthRecordCard from '@/components/growth-records/GrowthRecordCard'

interface GrowthRecord {
  id: number
  record_number: number
  record_name: string
  location: string
  started_on: string
  ended_on?: string
  status: 'planning' | 'growing' | 'completed' | 'failed'
  thumbnail_url?: string
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

export default function GrowthRecordsTab() {
  const [growthRecords, setGrowthRecords] = useState<GrowthRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [error, setError] = useState<string | null>(null)
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
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  const lastGrowthRecordElementRef = useCallback((node: HTMLDivElement | null) => {
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
    if (growthRecords.length === 0 && !loading) {
      fetchGrowthRecords()
    }
  }, [growthRecords.length, loading, fetchGrowthRecords])

  if (loading && growthRecords.length === 0) {
    return (
      <div className="flex justify-center py-8">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  if (growthRecords.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-600">まだ成長記録がありません</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {growthRecords.map((record, index) => (
        <div
          key={record.id}
          ref={index === growthRecords.length - 1 ? lastGrowthRecordElementRef : null}
        >
          <GrowthRecordCard record={record} onUpdate={() => fetchGrowthRecords()} />
        </div>
      ))}
      {loadingMore && (
        <div className="flex justify-center py-4">
          <div className="text-gray-600">読み込み中...</div>
        </div>
      )}
    </div>
  )
}
