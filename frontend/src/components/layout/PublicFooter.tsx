import Link from 'next/link'

export default function PublicFooter() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-[#6AF484] p-4 shadow z-50">
      <div className="flex justify-center">
        <nav className="w-full max-w-2xl min-w-80 px-4">
          <div className="flex items-center justify-end space-x-6 pr-6">
            <Link href="/privacy-policy">プライバシーポリシー</Link>
            <Link href="/terms-of-service">利用規約</Link>
            <Link href="/contact">お問い合わせ</Link>
          </div>
        </nav>
      </div>
    </footer>
  )
}