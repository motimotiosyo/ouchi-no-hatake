import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '投稿詳細 | おうちの畑',
  description: '野菜の成長記録や栽培の様子を詳しく見てみよう。おうちの畑の投稿詳細ページ。',
  openGraph: {
    title: '投稿詳細 | おうちの畑',
    description: '野菜の成長記録や栽培の様子を詳しく見てみよう。おうちの畑の投稿詳細ページ。',
    type: 'article',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: '投稿詳細 | おうちの畑',
    description: '野菜の成長記録や栽培の様子を詳しく見てみよう。おうちの畑の投稿詳細ページ。',
  },
}

export default function PostDetailLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
