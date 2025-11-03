import { ReactNode } from 'react'

// 完全に隔離された最小レイアウト
// Provider、Script、'use client'を一切含まない
export default function ShareLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
