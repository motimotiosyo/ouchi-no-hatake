'use client'

import { useState } from 'react'
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

interface Props {
  record: GrowthRecord
}

export default function GrowthRecordCard({ record }: Props) {
  const [showMenu, setShowMenu] = useState(false)

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
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      {/* モバイル表示 */}
      <div className="md:hidden">
        <Link href={`/growth-records/${record.id}`} className="block p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🌱</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{record.plant.name}</h3>
                <p className="text-sm text-gray-600">{record.record_name}</p>
              </div>
            </div>
            <div className="relative">
              <button
                onClick={(e) => {
                  e.preventDefault()
                  setShowMenu(!showMenu)
                }}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <span className="text-lg">⋯</span>
              </button>
              {showMenu && (
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                  <button className="w-full px-4 py-2 text-left text-sm text-blue-600 hover:bg-gray-50">
                    詳細
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm text-orange-600 hover:bg-gray-50">
                    編集
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50">
                    削除
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                {getStatusText(record.status)}
              </span>
            </div>
            <div>
              {record.started_on ? formatDate(record.started_on) : '---.--.-'} 〜 {record.ended_on ? formatDate(record.ended_on) : '---.--.-'}
            </div>
          </div>
        </Link>
      </div>

      {/* デスクトップ表示 */}
      <div className="hidden md:block">
        <Link href={`/growth-records/${record.id}`} className="block">
          <div className="grid grid-cols-6 gap-4 py-4 px-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center">
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                {getStatusText(record.status)}
              </span>
            </div>
            <div className="flex items-center">
              <div>
                <div className="font-semibold text-gray-900">{record.plant.name}</div>
                <div className="text-sm text-gray-600">{record.record_name}</div>
              </div>
            </div>
            <div className="flex items-center text-gray-600">
              {record.location}
            </div>
            <div className="flex items-center text-gray-600">
              {record.started_on ? formatDate(record.started_on) : '---.--.-'}
            </div>
            <div className="flex items-center text-gray-600">
              {record.ended_on ? formatDate(record.ended_on) : '---.--.-'}
            </div>
            <div className="flex items-center justify-end space-x-2">
              <button className="px-3 py-1 text-sm text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors">
                詳細
              </button>
              <button className="px-3 py-1 text-sm text-orange-600 bg-orange-50 rounded hover:bg-orange-100 transition-colors">
                編集
              </button>
              <button className="px-3 py-1 text-sm text-red-600 bg-red-50 rounded hover:bg-red-100 transition-colors">
                削除
              </button>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}