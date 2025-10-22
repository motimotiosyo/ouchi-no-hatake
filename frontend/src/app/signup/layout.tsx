import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '新規登録 | おうちの畑',
  description: 'おうちの畑で野菜の育成記録を共有しよう。新規登録して、野菜診断や育て方指南を活用できます。',
  openGraph: {
    title: '新規登録 | おうちの畑',
    description: 'おうちの畑で野菜の育成記録を共有しよう。新規登録して、野菜診断や育て方指南を活用できます。',
    type: 'website',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: '新規登録 | おうちの畑',
    description: 'おうちの畑で野菜の育成記録を共有しよう。新規登録して、野菜診断や育て方指南を活用できます。',
  },
}

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
