import Link from 'next/link'

interface AuthenticatedHeaderProps {
  onLogout: () => void
}

export default function AuthenticatedHeader({ onLogout }: AuthenticatedHeaderProps) {
  return (
    <header className="bg-[#6AF484] p-4 shadow">
      <nav className="container mx-auto flex items-center justify-between px-4">
        <Link href="/dashboard" className="font-medium">🌱 Vegetamily</Link>
        
        <div className="flex items-center space-x-3">
          {/* 通知 */}
          <button className="p-1 hover:bg-green-300 rounded font-medium">
            通知
          </button>
          
          {/* ハンバーガーアイコン */}
          <button className="p-1 hover:bg-green-300 rounded">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </nav>
    </header>
  )
}