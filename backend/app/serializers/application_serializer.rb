# frozen_string_literal: true

# 統一されたAPIレスポンス形式を提供する基底Serializerクラス
#
# Usage:
#   # 成功レスポンス
#   ApplicationSerializer.success(data: users, meta: { total: 100 })
#
#   # エラーレスポンス
#   ApplicationSerializer.error(message: "エラーが発生しました", code: "VALIDATION_ERROR")
#
class ApplicationSerializer
  # 成功レスポンスの標準フォーマット
  # @param data [Object] レスポンスデータ
  # @param meta [Hash] メタデータ（ページネーション等）
  # @return [Hash] 統一形式の成功レスポンス
  def self.success(data:, meta: {})
    {
      success: true,
      data: data,
      meta: default_meta.merge(meta)
    }
  end

  # エラーレスポンスの標準フォーマット
  # @param message [String] エラーメッセージ
  # @param code [String, nil] エラーコード
  # @param details [Array] 詳細エラー情報（バリデーションエラー等）
  # @return [Hash] 統一形式のエラーレスポンス
  def self.error(message:, code: nil, details: [])
    {
      success: false,
      error: {
        message: message,
        code: code,
        details: details
      }.compact,
      meta: default_meta
    }
  end

  private

  # メタデータのデフォルト値
  # @return [Hash] timestamp を含むデフォルトメタデータ
  def self.default_meta
    {
      timestamp: Time.current.iso8601
    }
  end
end
