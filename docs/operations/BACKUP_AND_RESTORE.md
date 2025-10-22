# バックアップ・復旧手順書

## 📋 概要

本ドキュメントは、「おうちの畑」アプリケーションのデータバックアップと復旧手順を定義します。

**本番環境構成**:
- バックエンド: Render（Rails API）
- フロントエンド: Vercel（Next.js）
- データベース: Render PostgreSQL
- ストレージ: AWS S3

**対象データ**:
- PostgreSQLデータベース（Render管理）
- AWS S3画像ファイル

**想定復旧時間**: 30分以内（データ量による）

## 🔐 前提条件

### 必要なアクセス権限

- Render Dashboard へのアクセス権限
- AWS Management Console または AWS CLI の認証情報

### 必要なツール（ローカル復旧時）

- PostgreSQL クライアント（`pg_dump`, `pg_restore`, `psql`）
- AWS CLI（S3操作用、オプション）

## 💾 PostgreSQLデータベースのバックアップ（Render）

### 1. Renderの自動バックアップ機能

Renderは有料プラン（Starter以上）でPostgreSQLデータベースを自動的にバックアップします。

**自動バックアップの特徴**:
- **Point-in-Time Recovery (PITR)**: 過去数日間の任意の時点に復元可能
- **保持期間**: 7日間（論理バックアップ）
- **注意**: Freeプランでは自動バックアップなし

### 2. 手動バックアップ（Render Dashboard）

#### Render Dashboardからのエクスポート

1. Render Dashboard にログイン
2. 対象のPostgreSQLデータベースを選択
3. 「Backups」タブを開く
4. 「Create Backup」をクリック
5. バックアップが作成されたら、`.dir.tar.gz` ファイルをダウンロード

**保存先（推奨）**:
- ローカルマシンの安全な場所
- Google Drive / Dropbox等のクラウドストレージ
- 外部バックアップ用S3バケット

**保存期間**:
- Renderは7日間のみ保持するため、長期保存が必要な場合は定期的にダウンロード

### 3. pg_dumpを使った手動バックアップ（Freeプラン向け）

Freeプランの場合、ローカルからpg_dumpを使用してバックアップを取得できます。

```bash
# DATABASE_URLを使用（Render Dashboardから取得）
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# 圧縮版（推奨）
pg_dump $DATABASE_URL | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

**DATABASE_URLの取得方法**:
1. Render Dashboard → PostgreSQL → 「Info」タブ
2. 「External Database URL」または「Internal Database URL」をコピー

### 4. ローカル開発環境のバックアップ

```bash
# Dockerコンテナ内のデータベースをバックアップ
docker-compose exec db pg_dump -U postgres backend_development > backup_dev_$(date +%Y%m%d_%H%M%S).sql

# 圧縮版
docker-compose exec db pg_dump -U postgres backend_development | gzip > backup_dev_$(date +%Y%m%d_%H%M%S).sql.gz
```

## 🔄 PostgreSQLデータベースの復旧

### 1. Render Point-in-Time Recovery（有料プラン）

特定の時点に復元する場合：

1. Render Dashboard → PostgreSQL → 「Recovery」タブ
2. 「Point-in-Time Recovery」セクション
3. 復元したい日時を選択
4. 「Restore」をクリック

⚠️ **注意**: この操作は既存データを上書きします。事前に現在のバックアップを取得することを推奨します。

### 2. エクスポートファイルからの復旧（Render新規インスタンス）

#### 新しいRender PostgreSQLインスタンスへの復旧

1. Render Dashboardで新しいPostgreSQLインスタンスを作成

2. ローカルでバックアップファイルを展開
```bash
tar -xzf backup_YYYYMMDD.dir.tar.gz
cd backup_YYYYMMDD
```

3. pg_restoreで復旧
```bash
# Renderの新しいDATABASE_URLを使用
pg_restore --verbose --clean --no-acl --no-owner \
  -d $NEW_DATABASE_URL \
  .
```

### 3. ローカル開発環境への復旧

#### Dockerコンテナへの復旧

```bash
# データベースを初期化
docker-compose exec db psql -U postgres -c "DROP DATABASE IF EXISTS backend_development;"
docker-compose exec db psql -U postgres -c "CREATE DATABASE backend_development;"

# バックアップから復旧（非圧縮版）
cat backup_YYYYMMDD_HHMMSS.sql | docker-compose exec -T db psql -U postgres backend_development

# バックアップから復旧（圧縮版）
zcat backup_YYYYMMDD_HHMMSS.sql.gz | docker-compose exec -T db psql -U postgres backend_development
```

#### 復旧後の確認

```bash
# レコード数確認
docker-compose exec db psql -U postgres backend_development -c "SELECT COUNT(*) FROM users;"
docker-compose exec db psql -U postgres backend_development -c "SELECT COUNT(*) FROM posts;"
docker-compose exec db psql -U postgres backend_development -c "SELECT COUNT(*) FROM growth_records;"

# Railsマイグレーション状態確認
docker-compose exec backend rails db:migrate:status
```

## 🖼️ AWS S3画像ファイルのバックアップ

### 1. バージョニング設定（推奨）

AWS S3バケットのバージョニングを有効にすることで、自動的にファイル履歴が保存されます。

#### AWSコンソールでの設定

1. AWS S3コンソールを開く
2. 対象バケットを選択
3. 「プロパティ」タブ → 「バケットのバージョニング」
4. 「有効にする」を選択

#### AWS CLIでの設定

```bash
aws s3api put-bucket-versioning \
  --bucket $AWS_S3_BUCKET \
  --versioning-configuration Status=Enabled
```

### 2. 手動バックアップ（別バケットへコピー）

```bash
# S3バケット全体を別バケットにコピー
aws s3 sync s3://your-bucket-name s3://backup-bucket-name/backup_$(date +%Y%m%d)/ \
  --region ap-northeast-1

# ローカルにダウンロード（小規模な場合のみ推奨）
aws s3 sync s3://your-bucket-name ./backups/s3_$(date +%Y%m%d)/ \
  --region ap-northeast-1
```

## 🔄 AWS S3画像ファイルの復旧

### 1. バージョニングからの復旧

```bash
# 特定バージョンのファイルを復元
aws s3api list-object-versions \
  --bucket your-bucket-name \
  --prefix path/to/file.jpg

aws s3api copy-object \
  --bucket your-bucket-name \
  --copy-source your-bucket-name/path/to/file.jpg?versionId=VERSION_ID \
  --key path/to/file.jpg
```

### 2. バックアップバケットからの復旧

```bash
# バックアップバケットから本番バケットへコピー
aws s3 sync s3://backup-bucket-name/backup_YYYYMMDD/ s3://your-bucket-name \
  --region ap-northeast-1

# ローカルバックアップから復旧
aws s3 sync ./backups/s3_YYYYMMDD/ s3://your-bucket-name \
  --region ap-northeast-1
```

## 📅 推奨バックアップスケジュール

### 開発環境
- **頻度**: 手動バックアップ（重要な変更前）
- **保存期間**: 最新3世代

### 本番環境（Render）

**データベース**:
- **自動バックアップ**: Renderが自動的に実行（有料プラン）
- **手動エクスポート**: 月1回（長期保存用）
- **保存期間**:
  - Render上: 7日間（自動）
  - ローカル/クラウド: 6ヶ月以上

**AWS S3**:
- **バージョニング**: 有効化（自動）
- **クロスリージョンレプリケーション**: オプション（災害対策）

## 🚨 緊急時対応フロー

### 1. データ損失発見時

1. **影響範囲の確認**
   - 何のデータが失われたか
   - いつから失われているか
   - 影響を受けるユーザー数

2. **最新バックアップの確認**
   - Render Dashboard → Backups タブで確認
   - または、ローカル保存バックアップの確認

3. **復旧計画の策定**
   - 復旧時間の見積もり
   - ユーザーへの影響範囲
   - メンテナンス告知の必要性

### 2. 復旧作業

#### Render上での復旧（PITR使用）

1. Render Dashboard → PostgreSQL → Recovery
2. Point-in-Time Recoveryで時点を指定
3. 復旧実行

#### 新規インスタンスへの復旧

1. 新しいPostgreSQLインスタンスを作成
2. エクスポートファイルからpg_restoreで復旧
3. Renderアプリの環境変数を新しいDATABASE_URLに更新
4. 再デプロイ

### 3. 動作確認

- 主要機能のテスト
- データ整合性の確認
- ユーザー認証・投稿・画像表示等の確認

### 4. 事後対応

- インシデントレポート作成
- 原因分析
- 再発防止策の検討

## ⚠️ 重要な注意事項

### Render固有の制約

- **Freeプラン**: 自動バックアップなし → 定期的なpg_dumpが必須
- **削除済みデータベース**: Renderはバックアップを保持しないため、削除前に必ずエクスポート
- **保持期間**: 論理バックアップは7日間のみ

### セキュリティ

- DATABASE_URLには認証情報が含まれるため、取扱注意
- バックアップファイルは暗号化されたストレージに保存
- 公開リポジトリにDATABASE_URLやバックアップファイルを含めない

## 📚 参考資料

- [Render PostgreSQL Backups公式ドキュメント](https://render.com/docs/postgresql-backups)
- [PostgreSQL公式ドキュメント - pg_dump](https://www.postgresql.org/docs/current/app-pgdump.html)
- [AWS S3 バージョニング](https://docs.aws.amazon.com/ja_jp/AmazonS3/latest/userguide/Versioning.html)

## 🔄 更新履歴

- 2025-10-22: 初版作成（Render + Vercel環境に対応）
