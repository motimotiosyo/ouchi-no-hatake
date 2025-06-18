import './globals.css'

import PublicHeader from '@/components/layout/PublicHeader'
import PublicFooter from '@/components/layout/PublicFooter'

export const metadata = {
  title: 'ベジファミリー',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen flex flex-col">
        <PublicHeader />
        <main className="flex-1 container mx-auto p-6">
          {children}
        </main>
        <PublicFooter />
      </body>
    </html>
  )
}