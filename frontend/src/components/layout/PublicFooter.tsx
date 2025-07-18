import Link from 'next/link'

export default function PublicFooter() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-[#6AF484] p-4 shadow z-50">
      <nav className="container mx-auto flex items-center px-4">
        <div className="ml-auto flex space-x-3 mr-4">
          <Link href="/privacy-policy">プライバシーポリシー</Link>
          <Link href="/terms-of-service">利用規約</Link>
          <Link href="/contact">お問い合わせ</Link>
        </div>
      </nav>
    </footer>
  )
}