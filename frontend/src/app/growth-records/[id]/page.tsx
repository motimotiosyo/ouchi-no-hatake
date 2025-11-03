'use client'

import { useParams } from 'next/navigation'
import GrowthRecordDetail from '@/components/growth-records/GrowthRecordDetail'

export default function GrowthRecordDetailPage() {
  const params = useParams()
  const id = params.id

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-2xl min-w-80 px-4 pb-6 -mt-4">
        <GrowthRecordDetail id={id as string} />
      </div>
    </div>
  )
}