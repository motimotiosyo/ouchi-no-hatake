// 成長記録ステータスのテキスト表示
export const getStatusText = (status: string | null): string => {
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

// 成長記録ステータスの色設定
export const getStatusColor = (status: string | null): string => {
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

// 日付フォーマット（年月日のみ）
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  })
}

// 日時フォーマット（年月日時分）
export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
