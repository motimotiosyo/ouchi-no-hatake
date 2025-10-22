import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ログイン',
  description: 'おうちの畑にログインして、野菜の育成記録を共有しよう。初心者向けの家庭菜園掲示板サービス。',
  openGraph: {
    title: 'ログイン | おうちの畑',
    description: 'おうちの畑にログインして、野菜の育成記録を共有しよう。初心者向けの家庭菜園掲示板サービス。',
  },
  twitter: {
    title: 'ログイン | おうちの畑',
    description: 'おうちの畑にログインして、野菜の育成記録を共有しよう。初心者向けの家庭菜園掲示板サービス。',
  },
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
