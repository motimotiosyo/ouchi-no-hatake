## 変更概要
<!-- このPRで何を変更したか、なぜ必要かを簡潔に説明 -->

## 種別
<!-- 該当する種別にチェック -->
- [ ] **Feature**: 新機能追加
- [ ] **Bug**: バグ修正
- [ ] **Refactor**: リファクタリング・コード改善
- [ ] **Security**: セキュリティ問題修正
- [ ] **Docs**: ドキュメント更新
- [ ] **Chore**: ビルド・設定変更

## 実装前チェック（確認済み）
> **重要**: 以下を実装前に確認したことを示してください

### 参考コード確認
**バックエンド実装時**:
- [ ] [backend/app/services/post_service.rb](../backend/app/services/post_service.rb) を確認済み
- [ ] [backend/app/serializers/application_serializer.rb](../backend/app/serializers/application_serializer.rb) を確認済み

**フロントエンド実装時**:
- [ ] [frontend/src/services/apiClient.ts](../frontend/src/services/apiClient.ts) を確認済み
- [ ] [frontend/src/types/api.ts](../frontend/src/types/api.ts) を確認済み

### ブランチ確認
- [ ] `git branch` で適切なブランチを確認済み（mainではない）

---

## 実装パターン準拠チェック
> **重要**: リファクタ成果を維持するため、以下を確認してください

### バックエンド
- [ ] Controller は50行以内
- [ ] Service層にビジネスロジック配置済み
- [ ] ApplicationSerializer でレスポンス統一済み
```ruby
# 正しいパターン例
def create
  result = Service.create_resource(current_user, params)
  render json: ApplicationSerializer.success(result), status: :created
end
```

### フロントエンド
- [ ] apiClient.post/get/put/delete 使用（直接fetch禁止）
- [ ] ApiResult<T> で型安全なエラーハンドリング実装済み
- [ ] types/ に型定義追加済み
```typescript
// 正しいパターン例
const result = await apiClient.post<ResponseType>('/api/v1/endpoint', data)
if (result.success) {
  // result.data は型安全
} else {
  // result.error.message
}
```

---

## セキュリティチェック
> **重要**: セキュリティ要件を満たしていることを確認してください

- [ ] 機密情報（JWT、パスワード、個人情報）のログ出力なし
- [ ] Logger.debug() または環境分岐使用
- [ ] console.log は開発環境のみで使用
- [ ] 適切なバリデーション・サニタイゼーション実装済み
- [ ] 認証・認可の適切な実装（該当する場合）

---

## 品質チェック
> **重要**: コード品質基準を満たしていることを確認してください

### コードメトリクス
- [ ] メソッド50行以内
- [ ] クラス/コンポーネント200行以内
- [ ] 単一責任原則の遵守

### ビルド・品質ツール
- [ ] RuboCop 通過（バックエンド変更時）
- [ ] ESLint 通過（フロントエンド変更時）
- [ ] ビルド成功確認済み

## 変更内容

### 主な変更
- [ ] **バックエンド**: [変更内容]
- [ ] **フロントエンド**: [変更内容]
- [ ] **データベース**: [変更内容]
- [ ] **その他**: [設定・ドキュメント等]

## 動作確認

- [ ] 主要機能の動作確認完了
- [ ] エラーケースの動作確認完了
- [ ] 関連機能の回帰テスト完了

## 関連情報
<!-- 関連Issue、参考資料、注意事項等 -->

Closes #[issue番号]