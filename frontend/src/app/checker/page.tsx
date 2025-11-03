import { Metadata } from 'next'
import CheckerClient from './CheckerClient'

// 静的OGPメタデータ
// opengraph-image.tsx と twitter-image.tsx が画像メタデータを自動生成
export const metadata: Metadata = {
  title: '家庭菜園チェッカー | おうちの畑',
  description: '簡単な質問に答えるだけで、あなたにぴったりの野菜が見つかります。初心者でも育てやすい野菜を診断して、家庭菜園を始めましょう！',
  openGraph: {
    title: '家庭菜園チェッカー | おうちの畑',
    description: '簡単な質問に答えるだけで、あなたにぴったりの野菜が見つかります。初心者でも育てやすい野菜を診断して、家庭菜園を始めましょう！',
    url: 'https://ouchi-no-hatake.com/checker',
    siteName: 'おうちの畑',
    type: 'website',
    locale: 'ja_JP',
    // images は opengraph-image.tsx が自動生成
  },
  twitter: {
    card: 'summary_large_image',
    title: '家庭菜園チェッカー | おうちの畑',
    description: '簡単な質問に答えるだけで、あなたにぴったりの野菜が見つかります。初心者でも育てやすい野菜を診断して、家庭菜園を始めましょう！',
    // images は twitter-image.tsx が自動生成
  },
}

// サーバーコンポーネント（静的レンダリング）
// 動的処理はCheckerClient（クライアントコンポーネント）に委譲
export default function CheckerPage() {
  return <CheckerClient />
}
