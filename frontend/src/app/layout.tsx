import './globals.css'
import Link from 'next/link'

export const metadata = {
  title: 'ベジファミリー',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen flex flex-col">
        <header className="bg-green-100 p-4 shadow">
          <nav className="container mx-auto flex space-x-6">
            <Link href="/" className="font-medium">ホーム</Link>
            <Link href="/login" className="font-medium">ログイン</Link>
            <Link href="/diagnosis" className="font-medium">野菜診断</Link>
          </nav>
        </header>
        <main className="flex-1 container mx-auto p-6">
          {children}
        </main>
        <footer className="bg-gray-100 p-4 text-center">
          © 2025 ベジファミリー
        </footer>
      </body>
    </html>
  )
}