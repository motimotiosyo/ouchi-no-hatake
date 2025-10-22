import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '育て方詳細 | おうちの畑',
  description: '野菜の育て方を詳しく解説。種まきから収穫までのステップを確認しよう。',
  openGraph: {
    title: '育て方詳細 | おうちの畑',
    description: '野菜の育て方を詳しく解説。種まきから収穫までのステップを確認しよう。',
    type: 'article',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: '育て方詳細 | おうちの畑',
    description: '野菜の育て方を詳しく解説。種まきから収穫までのステップを確認しよう。',
  },
}

export default function GuideDetailLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
