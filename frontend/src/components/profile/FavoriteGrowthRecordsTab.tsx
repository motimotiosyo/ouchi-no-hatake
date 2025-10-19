'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { apiClient } from '@/services/apiClient'
import GrowthRecordCard from '@/components/growth-records/GrowthRecordCard'
import type { GrowthRecord } from '@/types/growthRecord'

interface PaginationInfo {
  current_page: number
  per_page: number
  total_count: number
  has_more: boolean
}

interface FavoriteGrowthRecordsTabProps {
  userId: number
  onCountChange?: (count: number) => void
}

export default function FavoriteGrowthRecordsTab({ userId, onCountChange }: FavoriteGrowthRecordsTabProps) {
  const [growthRecords, setGrowthRecords] = useState<GrowthRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [fetched, setFetched] = useState(false)
  const observer = useRef<IntersectionObserver | null>(null)

  const fetchFavoriteGrowthRecords = useCallback(async (page: number = 1, append: boolean = false) => {
    try {
      if (page === 1) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }
      setError(null)

      const token = localStorage.getItem('auth_token')
      const result = await apiClient.getUserFavoriteGrowthRecords(userId, token || undefined)

      if (result.success) {
        if (append) {
          setGrowthRecords(prev => [...prev, ...result.data.growth_records])
        } else {
          setGrowthRecords(result.data.growth_records)
        }
        setPagination(result.data.pagination as PaginationInfo)
        if (onCountChange && result.data.pagination) {
          onCountChange((result.data.pagination as PaginationInfo).total_count)
        }
        setFetched(true)
      } else {
        setError(result.error.message)
        setFetched(true)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
      setFetched(true)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [userId, onCountChange])

  const lastGrowthRecordElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading || loadingMore) return
    if (observer.current) observer.current.disconnect()

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && pagination?.has_more) {
        fetchFavoriteGrowthRecords(pagination.current_page + 1, true)
      }
    })

    if (node) observer.current.observe(node)
  }, [loading, loadingMore, pagination, fetchFavoriteGrowthRecords])

  useEffect(() => {
    if (!fetched && !loading) {
      fetchFavoriteGrowthRecords()
    }
  }, [fetched, loading, fetchFavoriteGrowthRecords])

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
        <p className="text-gray-600">まだお気に入りした成長記録がありません</p>
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
          <GrowthRecordCard record={record} onUpdate={() => fetchFavoriteGrowthRecords()} />
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
