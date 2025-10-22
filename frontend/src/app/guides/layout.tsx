import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '育て方指南 | おうちの畑',
  description: '野菜の育て方を詳しく解説。種まきから収穫まで、初心者にも分かりやすいステップで栽培をサポートします。',
  openGraph: {
    title: '育て方指南 | おうちの畑',
    description: '野菜の育て方を詳しく解説。種まきから収穫まで、初心者にも分かりやすいステップで栽培をサポートします。',
    type: 'website',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: '育て方指南 | おうちの畑',
    description: '野菜の育て方を詳しく解説。種まきから収穫まで、初心者にも分かりやすいステップで栽培をサポートします。',
  },
}

export default function GuidesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
