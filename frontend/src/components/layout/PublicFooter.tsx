import Link from 'next/link'

export default function PublicFooter() {
  return (
    <footer className="bg-gray-100 p-4 shadow">
      <nav className="container mx-auto flex space-x-6">
        <Link href="/privacy-policy">プライバシーポリシー</Link>
        <Link href="/terms-of-service">利用規約</Link>
        <Link href="/contact">お問い合わせ</Link>
      </nav>
    </footer>
  )
}