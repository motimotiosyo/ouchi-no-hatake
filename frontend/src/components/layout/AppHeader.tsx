interface AppHeaderProps {
  onLogout: () => void
}

export default function AppHeader({ onLogout }: AppHeaderProps) {
  return (
    <header className="bg-green-400 text-white">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-white rounded-sm flex items-center justify-center">
            <span className="text-green-500 font-bold text-sm">🌱</span>
          </div>
          <span className="font-semibold text-lg">Vegetamily</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <button onClick={onLogout} className="text-white hover:text-green-100">
            <span className="text-sm">ログアウト</span>
          </button>
          <button className="text-white hover:text-green-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-12h0z" />
            </svg>
          </button>
          <button className="text-white hover:text-green-100">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}