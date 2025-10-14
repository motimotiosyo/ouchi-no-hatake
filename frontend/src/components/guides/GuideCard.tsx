import Link from 'next/link'
import { GuideListItem } from '@/types/guide'

interface GuideCardProps {
  guide: GuideListItem
}

export default function GuideCard({ guide }: GuideCardProps) {
  return (
    <Link href={`/guides/${guide.id}`}>
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer border border-gray-200 h-[180px] flex flex-col overflow-hidden">
        <div className="flex flex-col h-full">
          <h3 className="font-bold text-gray-900 text-xl mb-3 flex-shrink-0">{guide.plant.name}</h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-3 overflow-hidden flex-1">{guide.plant.description}</p>
          <div className="text-sm text-gray-500 flex-shrink-0">
            {guide.steps_count}ステップ
          </div>
        </div>
      </div>
    </Link>
  )
}
