# 全Serviceクラスの基底クラス
# 統一的なログ出力、エラーハンドリング、共通処理を提供
require 'ostruct'

class ApplicationService
  # サービス実行の標準メソッド
  def self.call(*args, **kwargs)
    new.call(*args, **kwargs)
  end

  # サブクラスで実装される主要メソッド
  def call
    raise NotImplementedError, "#{self.class}#call must be implemented"
  end

  private

  # 環境制御対応ログメソッド群

  # 情報レベルログ（全環境）
  def log_info(message, context = {})
    Rails.logger.info format_log_message(message, context)
  end

  # デバッグレベルログ（開発環境のみ）
  def log_debug(message, context = {})
    return unless Rails.env.development?
    Rails.logger.debug format_log_message(message, context)
  end

  # 警告レベルログ（全環境）
  def log_warn(message, context = {})
    Rails.logger.warn format_log_message(message, context)
  end

  # エラーレベルログ（全環境、機密情報フィルタリング付き）
  def log_error(message, error = nil, context = {})
    error_context = build_error_context(error, context)
    Rails.logger.error format_log_message(message, error_context)
  end

  # ユーザー操作ログ（全環境、安全な情報のみ）
  def log_user_action(action, user_id = nil, details = {})
    safe_details = sanitize_user_details(details)
    context = { user_id: user_id }.merge(safe_details).compact
    log_info("User action: #{action}", context)
  end

  # API操作ログ（開発環境のみ）
  def log_api_call(method, endpoint, status = nil, duration = nil)
    return unless Rails.env.development?

    context = { method: method, endpoint: endpoint, status: status, duration: duration }.compact
    log_debug("API call", context)
  end

  # 認証関連ログ（セキュリティ重要、機密情報は一切出力しない）
  def log_auth_event(event, user_id = nil, success = nil)
    context = { user_id: user_id, success: success }.compact
    log_info("Auth event: #{event}", context)
  end

  # データベース操作ログ（開発環境のみ）
  def log_db_operation(operation, model = nil, record_id = nil)
    return unless Rails.env.development?

    context = { operation: operation, model: model, record_id: record_id }.compact
    log_debug("DB operation", context)
  end

  private

  # ログメッセージの統一フォーマット
  def format_log_message(message, context = {})
    service_name = self.class.name
    timestamp = Time.current.iso8601

    log_entry = {
      timestamp: timestamp,
      service: service_name,
      message: message
    }

    log_entry.merge!(context) if context.any?

    if Rails.env.development?
      # 開発環境では読みやすい形式
      "#{log_entry.to_json}"
    else
      # 本番環境では構造化ログ
      log_entry.to_json
    end
  end

  # エラーコンテキストの構築（機密情報フィルタリング）
  def build_error_context(error, additional_context = {})
    return additional_context unless error

    error_info = {
      error_class: error.class.name,
      error_message: error.message
    }

    # 開発環境のみスタックトレースを含める
    if Rails.env.development?
      error_info[:stack_trace] = error.backtrace&.first(10)
    end

    additional_context.merge(error_info)
  end

  # ユーザー詳細情報の安全化（機密情報除去）
  def sanitize_user_details(details)
    return {} unless details.is_a?(Hash)

    # 除外すべき機密フィールド
    sensitive_fields = %w[
      password password_confirmation token auth_token jwt
      api_key secret private_key cookie session_id
      email phone address credit_card
    ].map(&:to_sym)

    details.except(*sensitive_fields)
  end

  # パフォーマンス測定付きメソッド実行
  def with_performance_logging(operation_name)
    start_time = Time.current
    result = yield
    duration = ((Time.current - start_time) * 1000).round(2)

    log_debug("Performance: #{operation_name}", { duration_ms: duration })
    result
  rescue => error
    duration = ((Time.current - start_time) * 1000).round(2)
    log_error("Performance: #{operation_name} failed", error, { duration_ms: duration })
    raise
  end

  # 例外の安全なログ出力
  def log_exception(exception, context = {})
    log_error("Exception occurred", exception, context)

    # 開発環境では例外の詳細を追加出力
    if Rails.env.development?
      Rails.logger.debug "Full exception details: #{exception.inspect}"
      Rails.logger.debug "Backtrace: #{exception.backtrace.join("\n")}"
    end
  end
end
