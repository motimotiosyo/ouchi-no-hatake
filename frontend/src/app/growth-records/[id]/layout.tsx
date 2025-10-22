import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '成長記録詳細 | おうちの畑',
  description: '野菜の成長過程を詳しく確認。写真とメモで記録された栽培の様子を見てみよう。',
  openGraph: {
    title: '成長記録詳細 | おうちの畑',
    description: '野菜の成長過程を詳しく確認。写真とメモで記録された栽培の様子を見てみよう。',
    type: 'article',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: '成長記録詳細 | おうちの畑',
    description: '野菜の成長過程を詳しく確認。写真とメモで記録された栽培の様子を見てみよう。',
  },
}

export default function GrowthRecordDetailLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
