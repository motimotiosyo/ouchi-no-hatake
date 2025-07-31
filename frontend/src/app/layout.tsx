import './globals.css'

import { AuthProvider } from '@/contexts/AuthContext'
import { FlashProvider } from '@/contexts/FlashContext'
import LayoutWrapper from '@/components/layout/LayoutWrapper'
import FlashMessages from '@/components/ui/FlashMessages'
import AutoLogoutModalContainer from '@/components/ui/AutoLogoutModalContainer'

export const metadata = {
  title: 'おうちの畑',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen flex flex-col" style={{ minWidth: '360px' }}>
        <FlashProvider>
          <AuthProvider>
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
            <FlashMessages />
            <AutoLogoutModalContainer />
          </AuthProvider>
        </FlashProvider>
      </body>
    </html>
  )
}