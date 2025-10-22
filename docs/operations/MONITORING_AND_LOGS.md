# 本番環境監視・ログ確認手順書

## 📋 概要

**本番環境構成**:
- バックエンド: Render（Rails API）
- フロントエンド: Vercel（Next.js）
- データベース: Render PostgreSQL
- ストレージ: AWS S3

このドキュメントでは、本番環境でのログ確認方法とエラー発生時の調査手順を説明します。

**関連ドキュメント**:
- [緊急時対応マニュアル](EMERGENCY_RESPONSE.md) - 障害発生時の初動対応・復旧手順

## 🔍 ログ設定の確認

### バックエンド（Rails API）

**ログ設定**: [backend/config/environments/production.rb](../../backend/config/environments/production.rb)

```ruby
# STDOUTへのログ出力（Renderで自動収集）
config.logger = ActiveSupport::Logger.new(STDOUT)
  .tap  { |logger| logger.formatter = ::Logger::Formatter.new }
  .then { |logger| ActiveSupport::TaggedLogging.new(logger) }

# ログレベル: info以上（本番環境）
config.log_level = ENV.fetch("RAILS_LOG_LEVEL", "info").to_sym

# 機密情報フィルタリング
config.filter_parameters += [
  :password, :password_confirmation, :token, :auth_token, :jwt,
  :api_key, :secret, :private_key, :cookie, :session_id,
  :email, :name, :user_id, :phone, :address
]
```

**特徴**:
- ✅ STDOUT出力でRenderが自動収集
- ✅ リクエストIDでログを紐付け
- ✅ 機密情報は自動フィルタリング
- ✅ 本番環境ではinfoレベル以上のみ出力

### フロントエンド（Next.js）

**Logger実装**: [frontend/src/utils/logger.ts](../../frontend/src/utils/logger.ts)

```typescript
class Logger {
  private static isDevelopment = process.env.NODE_ENV === 'development'

  // 開発環境のみ出力
  static debug(message: string, ...args: unknown[])

  // 全環境で出力（機密情報フィルタリング済み）
  static info(message: string, context?: Record<string, unknown>)
  static warn(message: string, context?: Record<string, unknown>)
  static error(message: string, error?: Error, context?: Record<string, unknown>)

  // 専用ログ
  static userAction(action: string, userId?: number, details?: Record<string, unknown>)
  static apiCall(method: string, endpoint: string, status?: number, duration?: number) // 開発環境のみ
  static auth(message: string, userId?: number)
}
```

**特徴**:
- ✅ 環境別ログレベル制御
- ✅ 本番環境では機密情報を含まない
- ✅ カテゴリ別ログ（USER, API, AUTH等）

## 📊 Render（バックエンド）でのログ確認

### 1. Renderダッシュボードにアクセス

1. https://dashboard.render.com にログイン
2. 「おうちの畑」のバックエンドサービスを選択
3. 左メニューの「Logs」をクリック

### 2. ログの確認方法

**リアルタイムログ**:
- ダッシュボードの「Logs」タブで最新ログをリアルタイム表示
- 自動更新されるため、エラー発生直後の確認に最適

**ログの検索**:
- 検索ボックスでキーワード検索
- 例: `ERROR`, `500`, リクエストID

**時間範囲の指定**:
- 「Last hour」「Last 24 hours」などで絞り込み

### 3. よく確認するログ

**リクエストログ**:
```
[INFO] Started GET "/api/v1/posts" for 1.2.3.4 at 2025-10-23 00:00:00
[INFO] Processing by Api::V1::PostsController#index as JSON
[INFO] Completed 200 OK in 150ms
```

**エラーログ**:
```
[ERROR] Error in PostsController#create: ActiveRecord::RecordInvalid
[ERROR] Validation failed: Title can't be blank
```

**認証ログ**:
```
[INFO] User authenticated successfully
[INFO] JWT token validation completed
```

### 4. メトリクスの確認

**Metrics タブで確認可能な情報**:
- CPU使用率
- メモリ使用率
- リクエスト数/秒
- レスポンスタイム

**確認手順**:
1. Renderダッシュボードで「Metrics」タブを選択
2. 時間範囲を指定（1時間/24時間/7日間）
3. グラフで推移を確認

## 🌐 Vercel（フロントエンド）でのログ確認

### 1. Vercelダッシュボードにアクセス

1. https://vercel.com にログイン
2. 「おうちの畑」プロジェクトを選択
3. 上部メニューの「Logs」をクリック

### 2. ログの種類

**ビルドログ**:
- デプロイ時のビルド成功/失敗ログ
- 「Deployments」→ 各デプロイを選択 → 「Building」タブ

**デプロイログ**:
- デプロイの進行状況
- 「Deployments」→ 各デプロイを選択

**ランタイムログ**（サーバーサイドレンダリング時）:
- Next.js サーバー側のエラー
- 「Logs」タブでリアルタイム確認

### 3. デプロイ状況の確認

**デプロイ履歴**:
1. 「Deployments」タブを選択
2. 最新のデプロイステータスを確認
   - ✅ Ready（成功）
   - ❌ Failed（失敗）
   - 🔄 Building（ビルド中）

**ビルドエラーの確認**:
1. 失敗したデプロイをクリック
2. 「Building」タブでエラー詳細を確認
3. ESLintエラー、TypeScriptエラーなどが表示される

## 🗄️ Render PostgreSQL のメトリクス確認

### 1. データベースダッシュボードにアクセス

1. Renderダッシュボードにログイン
2. PostgreSQLデータベースを選択
3. 「Metrics」タブを確認

### 2. 確認可能なメトリクス

**データベース接続数**:
- 現在のアクティブ接続数
- 最大接続数に対する使用率

**ストレージ使用量**:
- 使用中のディスク容量
- 残り容量

**クエリパフォーマンス**:
- スロークエリの有無（プランによる）

## 🚨 エラー発生時の調査フロー

### Step 1: エラーの種類を特定

**ユーザーからの報告内容を確認**:
- どのページで発生したか
- どの操作で発生したか
- エラーメッセージ（画面表示があれば）
- 発生日時

### Step 2: フロントエンドログを確認

1. Vercel ダッシュボードにアクセス
2. 「Logs」タブで該当時刻のログを検索
3. エラーメッセージ、スタックトレースを確認

**確認すべき情報**:
- エラーメッセージ
- リクエストURL
- HTTPステータスコード

### Step 3: バックエンドログを確認

1. Render ダッシュボードにアクセス
2. 「Logs」タブで該当時刻のログを検索
3. リクエストIDでログを追跡

**確認すべき情報**:
```
[INFO] [request-id-123] Started POST "/api/v1/posts"
[ERROR] [request-id-123] Error in PostsController#create: ...
[ERROR] [request-id-123] Validation failed: Title can't be blank
```

### Step 4: データベースの確認

**接続数の確認**:
- Render PostgreSQL Metricsで接続数を確認
- 最大接続数に達していないか

**クエリエラーの確認**:
- バックエンドログでSQL関連エラーを検索
- `ActiveRecord::`, `PG::Error` などのキーワードで検索

### Step 5: 外部サービスの確認

**AWS S3（画像アップロード関連）**:
- バックエンドログで `AWS::`, `S3` 関連エラーを検索
- アクセス権限、バケット設定を確認

**SendGrid（メール送信関連）**:
- バックエンドログで `SendGrid`, `Mail` 関連エラーを検索
- API keyの有効性を確認

### Step 6: 問題の切り分け

**フロントエンド側の問題**:
- ビルドエラー → Vercelデプロイログ確認
- UIエラー → ブラウザコンソールログ確認
- Next.js エラーページ表示 → error.tsx, not-found.tsx

**バックエンド側の問題**:
- APIエラー（4xx, 5xx） → Renderログ確認
- データベースエラー → PostgreSQL Metrics確認
- 外部サービスエラー → バックエンドログ確認

## 🔐 セキュリティ

### ログに含まれない情報（フィルタリング済み）

**バックエンド**:
- パスワード、パスワード確認
- JWT、認証トークン
- APIキー、シークレットキー
- メールアドレス、ユーザー名、電話番号

**フロントエンド**:
- 本番環境ではスタックトレース詳細は非表示
- 機密情報は Logger クラスで自動フィルタリング

### ログ確認時の注意事項

- ログは個人情報を含む可能性があるため、取り扱いに注意
- スクリーンショットを共有する際は機密情報をマスキング
- ログファイルのダウンロードは必要最小限に

## 📈 定期確認項目

### 週次確認（推奨）

- [ ] Render Metricsで異常な負荷がないか確認
- [ ] Vercel デプロイ履歴で失敗がないか確認
- [ ] Render PostgreSQL ストレージ使用量確認

### 月次確認（推奨）

- [ ] エラーログの傾向分析（同じエラーが頻発していないか）
- [ ] パフォーマンスメトリクスの推移確認
- [ ] データベース容量の増加傾向確認

## 🔗 関連リンク

- Render Dashboard: https://dashboard.render.com
- Vercel Dashboard: https://vercel.com/dashboard
- Render Logging ドキュメント: https://render.com/docs/logs
- Vercel Logging ドキュメント: https://vercel.com/docs/observability/runtime-logs

## 補足

このドキュメントは個人開発のポートフォリオ作品として、Render・Vercelの組み込み監視機能を活用する運用を想定しています。外部監視サービス（Sentry、DataDog等）は導入していません。
