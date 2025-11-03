import { Metadata } from 'next'

// 完全静的レンダリングを強制
export const dynamic = 'force-static'

// 静的OGPメタデータ（SNSクローラー専用）
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
    // 画像はopengraph-image.tsxが自動生成
  },
  twitter: {
    card: 'summary_large_image',
    title: '家庭菜園チェッカー | おうちの畑',
    description: '簡単な質問に答えるだけで、あなたにぴったりの野菜が見つかります。初心者でも育てやすい野菜を診断して、家庭菜園を始めましょう！',
    // 画像はtwitter-image.tsxが自動生成
  },
}

// SNSクローラー専用の静的ページ
// ユーザーがアクセスすることは想定していない（middleware.tsでBotのみリダイレクト）
export default function CheckerSharePage() {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: 'sans-serif'
    }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        家庭菜園チェッカー
      </h1>
      <p style={{ marginBottom: '2rem', color: '#666' }}>
        あなたにぴったりの野菜を診断します
      </p>
      <a
        href="https://ouchi-no-hatake.com/checker"
        style={{
          display: 'inline-block',
          padding: '0.75rem 1.5rem',
          backgroundColor: '#16a34a',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '0.5rem',
          fontWeight: '600'
        }}
      >
        診断を始める
      </a>
    </main>
  )
}
