import Link from 'next/link'

export default function PublicFooter() {
  return (
    <footer className="bg-[#6AF484] p-4 shadow">
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