import './globals.css'

import { AuthProvider } from '@/contexts/auth'
import { FlashProvider } from '@/contexts/FlashContext'
import LayoutWrapper from '@/components/layout/LayoutWrapper'
import FlashMessages from '@/components/ui/FlashMessages'
import AutoLogoutModalContainer from '@/components/ui/AutoLogoutModalContainer'
import RedirectMessageHandler from '@/components/ui/RedirectMessageHandler'

import type { Metadata, Viewport } from 'next'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export const metadata: Metadata = {
  title: {
    default: 'おうちの畑',
    template: '%s | おうちの畑',
  },
  description: '初心者が気軽に家庭菜園を始められる掲示板型サービス。野菜診断で育てやすい野菜を提案し、育て方指南で栽培をサポート。成長記録を共有して楽しく野菜を育てよう。',
  openGraph: {
    title: 'おうちの畑',
    description: '初心者が気軽に家庭菜園を始められる掲示板型サービス。野菜診断で育てやすい野菜を提案し、育て方指南で栽培をサポート。成長記録を共有して楽しく野菜を育てよう。',
    url: 'https://ouchi-no-hatake.vercel.app',
    siteName: 'おうちの畑',
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'おうちの畑',
    description: '初心者が気軽に家庭菜園を始められる掲示板型サービス。野菜診断で育てやすい野菜を提案し、育て方指南で栽培をサポート。成長記録を共有して楽しく野菜を育てよう。',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen flex flex-col" style={{ minWidth: '360px' }}>
        <FlashProvider>
          <AuthProvider>
            <RedirectMessageHandler />
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