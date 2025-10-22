import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'プロフィール編集 | おうちの畑',
  description: 'プロフィール情報を編集して、あなたの家庭菜園ライフをカスタマイズしよう。',
  openGraph: {
    title: 'プロフィール編集 | おうちの畑',
    description: 'プロフィール情報を編集して、あなたの家庭菜園ライフをカスタマイズしよう。',
    type: 'website',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'プロフィール編集 | おうちの畑',
    description: 'プロフィール情報を編集して、あなたの家庭菜園ライフをカスタマイズしよう。',
  },
}

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
