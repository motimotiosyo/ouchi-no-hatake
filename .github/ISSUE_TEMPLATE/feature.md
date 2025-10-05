---
name: Feature Request
about: 新機能の追加
title: '[Feature] '
labels: 'feature'
assignees: ''
---

## 機能概要
<!-- 何を実装するか、なぜ必要かを簡潔に説明 -->

## 実装前チェック
> **重要**: 実装開始前に必ず確認してください

### 参考コード確認
**バックエンド実装時**:
- [ ] [backend/app/services/post_service.rb](../../backend/app/services/post_service.rb) を確認済み
- [ ] [backend/app/serializers/application_serializer.rb](../../backend/app/serializers/application_serializer.rb) を確認済み
- [ ] ApplicationSerializer パターンを理解済み

**フロントエンド実装時**:
- [ ] [frontend/src/services/apiClient.ts](../../frontend/src/services/apiClient.ts) を確認済み
- [ ] [frontend/src/types/api.ts](../../frontend/src/types/api.ts) を確認済み
- [ ] ApiResult<T> パターンを理解済み

### ブランチ確認
- [ ] `git branch` で現在のブランチ確認済み
- [ ] mainブランチではないことを確認済み
- [ ] 適切なfeature/ブランチを作成済み

---

## 実装内容

### 変更予定
- [ ] **バックエンド**: [変更内容]
- [ ] **フロントエンド**: [変更内容]
- [ ] **API**: [新規/変更エンドポイント]
- [ ] **その他**: [設定・ドキュメント等]

---

## 実装中セルフチェック
> **重要**: 実装中に随時確認してください

### パターン準拠
**バックエンド**:
- [ ] Controller は50行以内
- [ ] Service層にビジネスロジック配置済み
- [ ] ApplicationSerializer でレスポンス統一済み

**フロントエンド**:
- [ ] apiClient.post/get/put/delete 使用（直接fetch禁止）
- [ ] ApiResult<T> で型安全なエラーハンドリング実装済み
- [ ] types/ に型定義追加済み

### セキュリティ
- [ ] 機密情報（JWT、パスワード、個人情報）のログ出力なし
- [ ] Logger.debug() または環境分岐使用
- [ ] console.log は開発環境のみで使用

---

## 達成条件（Definition of Done）

### 機能要件
- [ ] 要求された機能が正常に動作する
- [ ] エラーケースが適切にハンドリングされている
- [ ] ユーザーフィードバック（成功・エラーメッセージ）が表示される

### 技術要件
- [ ] コーディング規約に準拠している
- [ ] メソッド・クラス・ファイルサイズが基準内（50行・200行・500行）
- [ ] セキュリティ要件を満たしている（機密情報ログなし）
- [ ] RuboCop/ESLint 通過
- [ ] ビルド成功確認済み

### 品質要件
- [ ] 手動テストでの動作確認完了
- [ ] エラーケースの動作確認完了
- [ ] レスポンシブデザイン対応（フロントエンド変更時）

## 参考資料
<!-- デザイン、仕様書、参考URL等 -->

## 補足・注意事項
<!-- 実装時の注意点、制約等 -->