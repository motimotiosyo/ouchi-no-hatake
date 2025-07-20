import './globals.css'

import { AuthProvider } from '@/contexts/AuthContext'
import { FlashProvider } from '@/contexts/FlashContext'
import LayoutWrapper from '@/components/layout/LayoutWrapper'
import FlashMessages from '@/components/ui/FlashMessages'

export const metadata = {
  title: 'おうちの畑',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen flex flex-col">
        <FlashProvider>
          <AuthProvider>
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
            <FlashMessages />
          </AuthProvider>
        </FlashProvider>
      </body>
    </html>
  )
}