import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '家庭菜園チェッカー | おうちの畑',
  description: '簡単な質問に答えるだけで、あなたにぴったりの野菜が見つかります。初心者でも育てやすい野菜を診断して、家庭菜園を始めましょう！',
  openGraph: {
    title: '家庭菜園チェッカー | おうちの畑',
    description: '簡単な質問に答えるだけで、あなたにぴったりの野菜が見つかります。初心者でも育てやすい野菜を診断して、家庭菜園を始めましょう！',
    type: 'website',
    locale: 'ja_JP',
    images: [
      {
        url: '/ogp-checker.png',
        width: 1200,
        height: 630,
        alt: '家庭菜園チェッカー | おうちの畑',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '家庭菜園チェッカー | おうちの畑',
    description: '簡単な質問に答えるだけで、あなたにぴったりの野菜が見つかります。初心者でも育てやすい野菜を診断して、家庭菜園を始めましょう！',
    images: ['/ogp-checker.png'],
  },
}

export default function CheckerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
