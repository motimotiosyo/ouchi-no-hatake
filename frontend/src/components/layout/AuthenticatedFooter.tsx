import Link from 'next/link'

export default function AuthenticatedFooter() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-[#95FB99] py-2 px-4 md:py-3 md:px-4 shadow z-50">
      <div className="flex justify-center">
        <nav className="w-full max-w-2xl px-2 md:px-4">
        <div className="flex items-center justify-between">
          {/* ホーム */}
          <Link href="/" className="flex flex-col items-center justify-start w-14 md:w-28 py-0 px-0.5 md:py-0 md:px-2 hover:bg-green-300 rounded transition-colors">
            <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-[9px] md:text-xs scale-75 md:scale-100 font-medium mt-0 md:mt-0.5 text-center whitespace-nowrap origin-top">ホーム</span>
          </Link>

          {/* 成長記録 */}
          <Link href="/growth-records" className="flex flex-col items-center justify-start w-14 md:w-28 py-0 px-0.5 md:py-0 md:px-2 hover:bg-green-300 rounded transition-colors">
            <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-[9px] md:text-xs scale-75 md:scale-100 font-medium mt-0 md:mt-0.5 text-center whitespace-nowrap origin-top">成長記録</span>
          </Link>

          {/* 育て方ガイド */}
          <Link href="/guides" className="flex flex-col items-center justify-start w-14 md:w-28 py-0 px-0.5 md:py-0 md:px-2 hover:bg-green-300 rounded transition-colors">
            <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="text-[9px] md:text-xs scale-75 md:scale-100 font-medium mt-0 md:mt-0.5 text-center whitespace-nowrap origin-top">ガイド</span>
          </Link>

          {/* 家庭菜園チェッカー */}
          <Link href="/checker" className="flex flex-col items-center justify-start w-14 md:w-28 py-0 px-0.5 md:py-0 md:px-2 hover:bg-green-300 rounded transition-colors">
            <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <span className="text-[9px] md:text-xs scale-75 md:scale-100 font-medium mt-0 md:mt-0.5 text-center whitespace-nowrap origin-top">チェッカー</span>
          </Link>

          {/* マイページ */}
          <Link href="/profile" className="flex flex-col items-center justify-start w-14 md:w-28 py-0 px-0.5 md:py-0 md:px-2 hover:bg-green-300 rounded transition-colors">
            <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-[9px] md:text-xs scale-75 md:scale-100 font-medium mt-0 md:mt-0.5 text-center whitespace-nowrap origin-top">マイページ</span>
          </Link>
        </div>
        </nav>
      </div>
    </footer>
  )
}