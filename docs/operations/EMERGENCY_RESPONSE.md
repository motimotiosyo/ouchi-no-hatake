# 緊急時対応マニュアル

## 📋 概要

本番環境で障害が発生した際の初動対応と復旧手順を記載したマニュアルです。
障害レベル別に対応優先度を設定し、迅速な復旧を実現します。

**本番環境構成**:
- バックエンド: Render（Rails API）
- フロントエンド: Vercel（Next.js）
- データベース: Render PostgreSQL
- ストレージ: AWS S3

**関連ドキュメント**:
- [監視・ログ確認手順](MONITORING_AND_LOGS.md) - エラー調査フロー、ログ確認方法

## 🚨 障害レベル定義

### Critical（緊急）
**定義**: サービス全体が停止、または主要機能が完全に利用不可

**対応時間**: 即座（検知後15分以内に初動対応開始）

**例**:
- Renderバックエンドが完全ダウン
- Vercelフロントエンドがアクセス不可
- PostgreSQLデータベース接続不可

### High（高）
**定義**: 主要機能の一部が停止、多数のユーザーに影響

**対応時間**: 1時間以内に初動対応開始

**例**:
- 投稿機能が全ユーザーでエラー
- 画像アップロードが完全に失敗
- ログイン機能が動作しない

### Medium（中）
**定義**: 一部機能に不具合、限定的なユーザーに影響

**対応時間**: 24時間以内に対応開始

**例**:
- 特定条件下でのエラー発生
- UI表示の崩れ
- パフォーマンス劣化

### Low（低）
**定義**: 軽微な不具合、ユーザー影響が極めて限定的

**対応時間**: 1週間以内に対応

**例**:
- 文言の誤字
- デザインの微調整
- ログ出力の改善

## 🔥 想定される障害パターンと対応手順

### 1. Render（バックエンド）ダウン

#### 障害レベル: Critical

#### 症状
- フロントエンドからAPIリクエストが全て失敗
- Render Dashboard で「Service Unavailable」表示
- ユーザーがログイン・投稿・閲覧不可

#### 初動対応（5分以内）
1. **Render Dashboard確認**:
   ```
   https://dashboard.render.com
   ```
   - サービスのステータス確認
   - 「Events」タブでデプロイ失敗・再起動を確認

2. **ログ確認**:
   - 「Logs」タブで直近のエラーログを確認
   - クラッシュの原因特定（メモリ不足、起動失敗等）

#### 原因調査（10分以内）
**パターン1: デプロイ失敗**
- 「Events」タブで最新デプロイのステータス確認
- ビルドログでエラー箇所特定

**パターン2: メモリ不足・クラッシュ**
- 「Metrics」タブでメモリ使用率確認
- ログで `Out of Memory` エラー確認

**パターン3: データベース接続エラー**
- ログで `PG::ConnectionBad`, `ActiveRecord::ConnectionNotEstablished` を検索
- PostgreSQL Dashboardで接続数確認

#### 復旧手順
**デプロイ失敗の場合**:
1. 前回の正常なコミットを特定
2. Render Dashboard で「Manual Deploy」→「Clear build cache & deploy」
3. または、Gitで前回のコミットにロールバック:
   ```bash
   git revert [エラーを起こしたコミット]
   git push origin main
   ```

**メモリ不足の場合**:
1. Render Dashboard で「Settings」→「Instance Type」を確認
2. 一時的にインスタンスタイプをアップグレード
3. 根本対策: メモリリークの調査・修正

**データベース接続エラーの場合**:
1. PostgreSQL Dashboard で接続数確認
2. 接続数上限に達している場合、`database.yml` の `pool` 設定を確認
3. 必要に応じて接続をリセット

#### 再発防止
- デプロイ前のローカル環境でのビルド確認徹底
- メモリ使用量の定期モニタリング
- データベース接続プールの適切な設定

---

### 2. Vercel（フロントエンド）デプロイ失敗

#### 障害レベル: Critical

#### 症状
- フロントエンドが表示されない、または古いバージョンが表示される
- Vercel Dashboard で「Failed」ステータス

#### 初動対応（5分以内）
1. **Vercel Dashboard確認**:
   ```
   https://vercel.com/dashboard
   ```
   - 「Deployments」タブで最新デプロイのステータス確認
   - 失敗したデプロイをクリック

2. **ビルドログ確認**:
   - 「Building」タブでエラー箇所確認
   - ESLint、TypeScript、ビルドエラーの特定

#### 原因調査（10分以内）
**パターン1: TypeScript型エラー**
- ビルドログで `TS` から始まるエラーコードを検索
- 型定義の不一致を特定

**パターン2: ESLintエラー**
- ビルドログで `@typescript-eslint` エラーを検索
- 未使用変数、構文エラーを特定

**パターン3: 環境変数未設定**
- ビルドログで `undefined` エラーを検索
- Vercel Dashboard「Settings」→「Environment Variables」確認

#### 復旧手順
**型エラー・ESLintエラーの場合**:
1. ローカル環境でエラー再現:
   ```bash
   docker-compose exec frontend npm run build
   ```
2. エラー修正後、pushで自動デプロイ
3. または、Vercel Dashboard で前回の正常なデプロイに「Promote to Production」

**環境変数未設定の場合**:
1. Vercel Dashboard「Settings」→「Environment Variables」
2. 必要な環境変数を追加（例: `NEXT_PUBLIC_API_URL`）
3. 「Redeploy」で再デプロイ

#### 再発防止
- デプロイ前のローカルビルド確認（`npm run build`）
- TypeScript strict mode の厳格運用
- 環境変数チェックリストの作成

---

### 3. PostgreSQL接続エラー

#### 障害レベル: Critical

#### 症状
- バックエンドログで `PG::ConnectionBad` エラー
- データベース接続が確立できない
- 全てのAPI操作が失敗

#### 初動対応（5分以内）
1. **Render PostgreSQL Dashboard確認**:
   ```
   https://dashboard.render.com
   ```
   - PostgreSQLサービスのステータス確認
   - 「Metrics」タブで接続数確認

2. **バックエンドログ確認**:
   - Render Backend「Logs」タブでエラー詳細確認
   - 接続タイムアウト、認証エラーを特定

#### 原因調査（10分以内）
**パターン1: 接続数上限到達**
- Metrics で「Connections」が上限に達していないか確認
- デフォルト: 97接続（Renderの場合）

**パターン2: 認証エラー**
- 環境変数 `DATABASE_URL` が正しいか確認
- パスワード変更後の更新漏れを確認

**パターン3: ネットワークエラー**
- Render Status Page で障害情報確認:
  ```
  https://status.render.com
  ```

#### 復旧手順
**接続数上限到達の場合**:
1. 一時対応: Render Backend を再起動（接続リセット）
2. 根本対策: `database.yml` の `pool` 設定を調整:
   ```yaml
   production:
     pool: <%= ENV.fetch("RAILS_MAX_THREADS") { 5 } %>
   ```

**認証エラーの場合**:
1. Render PostgreSQL Dashboard で「Connection String」確認
2. Render Backend「Environment」タブで `DATABASE_URL` を更新
3. バックエンドを再デプロイ

**ネットワークエラーの場合**:
- Render側の復旧を待つ
- Status Page で進捗確認

#### 再発防止
- 接続プール設定の適切な調整
- 定期的な接続数モニタリング
- データベースメンテナンス時の事前通知確認

---

### 4. AWS S3アクセスエラー

#### 障害レベル: High

#### 症状
- 画像アップロードが失敗
- 既存画像が表示されない
- バックエンドログで `Aws::S3::Errors` エラー

#### 初動対応（5分以内）
1. **バックエンドログ確認**:
   - Render Backend「Logs」タブで `Aws::S3` エラーを検索
   - エラーメッセージから原因特定（権限、バケット名等）

2. **AWS S3 Console確認**:
   ```
   https://s3.console.aws.amazon.com
   ```
   - バケットの存在確認
   - アクセス権限確認

#### 原因調査（10分以内）
**パターン1: 認証エラー（AccessDenied）**
- IAMユーザーのアクセスキーが無効化されていないか確認
- バケットポリシーが変更されていないか確認

**パターン2: バケット設定エラー（NoSuchBucket）**
- 環境変数 `S3_BUCKET_NAME` が正しいか確認
- バケットが削除されていないか確認

**パターン3: リージョンエラー**
- 環境変数 `S3_REGION` が正しいか確認

#### 復旧手順
**認証エラーの場合**:
1. AWS IAM Console でアクセスキーのステータス確認
2. 無効化されている場合、新しいアクセスキーを発行
3. Render Backend「Environment」タブで環境変数更新:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
4. バックエンドを再デプロイ

**バケット設定エラーの場合**:
1. AWS S3 Console でバケット名確認
2. Render Backend「Environment」タブで `S3_BUCKET_NAME` を更新
3. バックエンドを再デプロイ

**リージョンエラーの場合**:
1. AWS S3 Console でバケットのリージョン確認
2. Render Backend「Environment」タブで `S3_REGION` を更新（例: `ap-northeast-1`）
3. バックエンドを再デプロイ

#### 再発防止
- IAMアクセスキーの定期ローテーション
- 環境変数のバックアップ管理
- S3バケット設定の変更時チェックリスト

---

### 5. アプリケーションエラー（500エラー）

#### 障害レベル: High ～ Medium

#### 症状
- 特定のAPI操作で500エラー発生
- フロントエンドでエラーページ表示
- バックエンドログで例外スタックトレース

#### 初動対応（5分以内）
1. **エラー頻度の確認**:
   - 全ユーザーに影響 → High
   - 特定操作のみ → Medium

2. **バックエンドログ確認**:
   - Render Backend「Logs」タブで例外クラスを特定
   - スタックトレースから発生箇所を特定

#### 原因調査（詳細は[MONITORING_AND_LOGS.md](MONITORING_AND_LOGS.md)参照）
**調査フロー**:
1. エラーの種類を特定（Step 1）
2. フロントエンドログを確認（Step 2）
3. バックエンドログを確認（Step 3）
4. データベースの確認（Step 4）
5. 外部サービスの確認（Step 5）
6. 問題の切り分け（Step 6）

**よくあるエラーパターン**:
- `ActiveRecord::RecordNotFound` - データ不存在
- `ActiveRecord::RecordInvalid` - バリデーションエラー
- `NoMethodError` - nil参照エラー
- `JWT::DecodeError` - 認証エラー

#### 復旧手順
**一時対応**:
1. エラーが発生する操作を特定
2. 影響範囲をユーザーに告知（必要時）
3. 緊急性に応じて機能を一時無効化

**恒久対策**:
1. ローカル環境でエラー再現
2. 原因特定・修正
3. テスト実施
4. デプロイ

#### 再発防止
- エラーハンドリングの強化
- バリデーションの追加
- エッジケースのテスト追加

---

## 🔍 障害対応フローチャート

```
[障害検知]
    ↓
[障害レベル判定]
    ├─ Critical → 即座に対応開始（15分以内）
    ├─ High → 1時間以内に対応開始
    ├─ Medium → 24時間以内に対応
    └─ Low → 1週間以内に対応
    ↓
[初動対応]
    ├─ ダッシュボード確認（Render/Vercel/AWS）
    ├─ ログ確認
    └─ 障害パターン特定
    ↓
[原因調査]
    ├─ MONITORING_AND_LOGS.md の調査フロー実施
    ├─ エラーメッセージ・スタックトレース確認
    └─ メトリクス確認（CPU/メモリ/接続数）
    ↓
[復旧実施]
    ├─ 一時対応（ロールバック/再起動/設定変更）
    ├─ 動作確認
    └─ ユーザーへの状況報告（必要時）
    ↓
[恒久対策]
    ├─ 根本原因の修正
    ├─ テスト追加
    └─ デプロイ
    ↓
[事後対応]
    ├─ 再発防止策の実施
    ├─ モニタリング強化
    └─ ドキュメント更新
```

## 📊 障害対応チェックリスト

### 初動対応時
- [ ] 障害レベルを判定した
- [ ] 影響範囲を確認した（全ユーザー/一部ユーザー）
- [ ] 該当するダッシュボードにアクセスした
- [ ] ログで直近のエラーを確認した
- [ ] 障害パターンを特定した

### 原因調査時
- [ ] エラーメッセージをログから取得した
- [ ] スタックトレースを確認した（該当する場合）
- [ ] メトリクス（CPU/メモリ/接続数）を確認した
- [ ] 環境変数の設定を確認した（該当する場合）
- [ ] 外部サービスのステータスページを確認した（該当する場合）

### 復旧実施時
- [ ] 一時対応を実施した
- [ ] 復旧後の動作確認を実施した
- [ ] ユーザーへの影響がないことを確認した
- [ ] 必要に応じてユーザーに状況報告した

### 事後対応時
- [ ] 根本原因を特定した
- [ ] 恒久対策を実施した
- [ ] テストを追加した（該当する場合）
- [ ] 再発防止策をドキュメント化した
- [ ] モニタリング項目を追加した（必要時）

## 🔗 関連リンク

### ダッシュボード
- Render Dashboard: https://dashboard.render.com
- Vercel Dashboard: https://vercel.com/dashboard
- AWS S3 Console: https://s3.console.aws.amazon.com

### ステータスページ
- Render Status: https://status.render.com
- Vercel Status: https://www.vercel-status.com
- AWS Service Health Dashboard: https://health.aws.amazon.com/health/status

### ドキュメント
- [監視・ログ確認手順](MONITORING_AND_LOGS.md)
- Render Documentation: https://render.com/docs
- Vercel Documentation: https://vercel.com/docs
- AWS S3 Documentation: https://docs.aws.amazon.com/s3/

## 📝 補足

このマニュアルは個人開発のポートフォリオ作品として、実践的な障害対応手順を整備する目的で作成されています。
実際の障害発生時に迅速に対応できるよう、定期的な見直しと更新を推奨します。
