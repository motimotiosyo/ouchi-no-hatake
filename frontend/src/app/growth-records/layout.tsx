import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '成長記録 | おうちの畑',
  description: 'あなたの野菜の成長記録を管理。写真とメモで成長を振り返り、楽しく栽培を続けよう。',
  openGraph: {
    title: '成長記録 | おうちの畑',
    description: 'あなたの野菜の成長記録を管理。写真とメモで成長を振り返り、楽しく栽培を続けよう。',
    type: 'website',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: '成長記録 | おうちの畑',
    description: 'あなたの野菜の成長記録を管理。写真とメモで成長を振り返り、楽しく栽培を続けよう。',
  },
}

export default function GrowthRecordsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
