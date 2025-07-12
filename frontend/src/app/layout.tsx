import './globals.css'

import { AuthProvider } from '@/contexts/AuthContext'
import LayoutWrapper from '@/components/layout/LayoutWrapper'

export const metadata = {
  title: 'ベジファミリー',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen flex flex-col">
        <AuthProvider>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </AuthProvider>
      </body>
    </html>
  )
}