import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ユーザープロフィール | おうちの畑',
  description: 'ユーザーの投稿や成長記録を見てみよう。おうちの畑のユーザープロフィールページ。',
  openGraph: {
    title: 'ユーザープロフィール | おうちの畑',
    description: 'ユーザーの投稿や成長記録を見てみよう。おうちの畑のユーザープロフィールページ。',
    type: 'profile',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ユーザープロフィール | おうちの畑',
    description: 'ユーザーの投稿や成長記録を見てみよう。おうちの畑のユーザープロフィールページ。',
  },
}

export default function UserProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
