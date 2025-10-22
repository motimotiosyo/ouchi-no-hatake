export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">プライバシーポリシー</h1>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">1. 個人情報の収集</h2>
        <p className="mb-2">
          当サービス「おうちの畑」（以下「本サービス」といいます）では、ユーザー登録の際に以下の個人情報を収集します。
        </p>
        <ul className="list-disc list-inside ml-4">
          <li>メールアドレス</li>
          <li>ユーザー名</li>
          <li>パスワード（暗号化して保存）</li>
          <li>プロフィール画像（任意）</li>
          <li>投稿された写真・テキスト情報</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">2. 個人情報の利用目的</h2>
        <p className="mb-2">
          収集した個人情報は、以下の目的で利用します。
        </p>
        <ul className="list-disc list-inside ml-4">
          <li>本サービスの提供・運営のため</li>
          <li>ユーザー認証・本人確認のため</li>
          <li>ユーザーからのお問い合わせに回答するため</li>
          <li>利用規約に違反したユーザーや、不正・不当な目的でサービスを利用しようとするユーザーの特定をし、ご利用をお断りするため</li>
          <li>ユーザーにご自身の登録情報の閲覧や変更、削除、ご利用状況の閲覧を行っていただくため</li>
          <li>サービスの改善、新サービスの開発のため</li>
          <li>メール認証、パスワードリセット等のセキュリティ機能提供のため</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">3. 個人情報の第三者提供</h2>
        <p className="mb-2">
          当サービスは、以下の場合を除き、個人情報を第三者に提供することはありません。
        </p>
        <ul className="list-disc list-inside ml-4">
          <li>ユーザーの同意がある場合</li>
          <li>法令に基づく場合</li>
          <li>人の生命、身体または財産の保護のために必要がある場合であって、本人の同意を得ることが困難である場合</li>
        </ul>
        <p className="mt-4 mb-2">
          なお、以下のサービスを利用しており、各サービスの利用規約に従って情報が取り扱われます。
        </p>
        <ul className="list-disc list-inside ml-4">
          <li>AWS S3 - 画像ストレージ</li>
          <li>SendGrid - メール配信</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">4. 個人情報の安全管理</h2>
        <p className="mb-2">
          当サービスは、個人情報の紛失、破壊、改ざん及び漏洩などのリスクに対して、個人情報の安全管理が図られるよう、必要かつ適切な措置を講じます。
        </p>
        <ul className="list-disc list-inside ml-4 mt-2">
          <li>パスワードは暗号化（bcrypt）して保存</li>
          <li>JWT（JSON Web Token）による安全な認証</li>
          <li>HTTPS通信による暗号化</li>
          <li>機密情報のログ出力を制限</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">5. Cookie（クッキー）の使用について</h2>
        <p className="mb-2">
          当サービスでは、ユーザーの利便性向上のためにCookieを使用することがあります。
        </p>
        <p className="mb-2">
          Cookieとは、ウェブサーバーからユーザーのブラウザに送信される小さなテキストファイルで、ユーザーのコンピュータに保存されます。
          本サービスでは、認証トークンの保存等にCookieまたはローカルストレージを使用します。
        </p>
        <p className="mb-2">
          ユーザーは、ブラウザの設定によりCookieの受け取りを拒否することができますが、その場合、本サービスの一部機能が利用できなくなることがあります。
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">6. アクセス解析ツールについて</h2>
        <p className="mb-2">
          当サービスでは、サービスの利用状況を把握するため、アクセス解析ツールを使用することがあります。
        </p>
        <p className="mb-2">
          これらのツールは、トラフィックデータの収集のためにCookieを使用することがあります。
          トラフィックデータは匿名で収集されており、個人を特定するものではありません。
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">7. 投稿情報の公開範囲</h2>
        <p className="mb-2">
          ユーザーが本サービスに投稿した情報（写真、テキスト、成長記録等）は、他のユーザーに公開されます。
        </p>
        <p className="mb-2">
          投稿時には、公開される情報の内容にご注意ください。個人を特定できる情報や、公開したくない情報の投稿はお控えください。
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">8. 個人情報の開示・訂正・削除</h2>
        <p className="mb-2">
          ユーザーは、本サービス上で自身の個人情報の閲覧、訂正、削除を行うことができます。
        </p>
        <p className="mb-2">
          アカウント削除をご希望の場合は、お問い合わせフォームよりご連絡ください。
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">9. 本サービスの性質について</h2>
        <p className="mb-2">
          本サービスは、個人開発のポートフォリオ作品です。
        </p>
        <p className="mb-2">
          個人情報の取り扱いには十分注意を払っておりますが、商用サービスと同等のセキュリティレベルを保証するものではありません。
          ご利用の際は、この点をご理解いただいた上でご利用ください。
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">10. プライバシーポリシーの変更</h2>
        <p className="mb-2">
          当サービスは、必要に応じて、このプライバシーポリシーの内容を変更することがあります。
        </p>
        <p className="mb-2">
          変更後のプライバシーポリシーは、本ページに掲載したときから効力を生じるものとします。
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">11. お問い合わせ</h2>
        <p className="mb-2">
          本ポリシーに関するお問い合わせは、本サービスのお問い合わせフォームよりご連絡ください。
        </p>
      </section>

      <div className="mt-8 text-right text-gray-600">
        <p>制定日：2025年10月22日</p>
      </div>
    </div>
  )
}
