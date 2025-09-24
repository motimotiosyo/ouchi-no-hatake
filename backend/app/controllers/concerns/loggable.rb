# Controller用の統一ログ機能を提供するConcern
module Loggable
  extend ActiveSupport::Concern

  private

  # 情報レベルログ（全環境）
  def log_info(message, context = {})
    Rails.logger.info format_controller_log(message, context)
  end

  # デバッグレベルログ（開発環境のみ）
  def log_debug(message, context = {})
    return unless Rails.env.development?
    Rails.logger.debug format_controller_log(message, context)
  end

  # 警告レベルログ（全環境）
  def log_warn(message, context = {})
    Rails.logger.warn format_controller_log(message, context)
  end

  # エラーレベルログ（全環境、機密情報フィルタリング付き）
  def log_error(message, error = nil, context = {})
    error_context = build_controller_error_context(error, context)
    Rails.logger.error format_controller_log(message, error_context)
  end

  # ユーザー操作ログ（全環境、安全な情報のみ）
  def log_user_action(action, user_id = nil, details = {})
    safe_details = sanitize_controller_details(details)
    context = { user_id: user_id }.merge(safe_details).compact
    log_info("User action: #{action}", context)
  end

  # API操作ログ（開発環境のみ）
  def log_api_request(method = request.method, endpoint = request.fullpath, status = nil)
    return unless Rails.env.development?
    
    context = { 
      method: method, 
      endpoint: endpoint, 
      status: status,
      user_agent: request.user_agent&.truncate(100),
      ip: request.remote_ip
    }.compact
    log_debug("API request", context)
  end

  # 認証関連ログ（セキュリティ重要、機密情報は一切出力しない）
  def log_auth_event(event, user_id = nil, success = nil)
    context = { 
      user_id: user_id, 
      success: success,
      ip: request.remote_ip,
      user_agent: request.user_agent&.truncate(50)
    }.compact
    log_info("Auth event: #{event}", context)
  end

  private

  # Controllerログメッセージの統一フォーマット
  def format_controller_log(message, context = {})
    controller_name = self.class.name
    action_name = action_name rescue 'unknown'
    timestamp = Time.current.iso8601
    
    log_entry = {
      timestamp: timestamp,
      controller: controller_name,
      action: action_name,
      message: message
    }
    
    log_entry.merge!(context) if context.any?
    
    if Rails.env.development?
      # 開発環境では読みやすい形式
      log_entry.to_json
    else
      # 本番環境では構造化ログ
      log_entry.to_json
    end
  end

  # Controller用エラーコンテキストの構築（機密情報フィルタリング）
  def build_controller_error_context(error, additional_context = {})
    return additional_context unless error

    error_info = {
      error_class: error.class.name,
      error_message: error.message
    }

    # 開発環境のみスタックトレースを含める
    if Rails.env.development?
      error_info[:stack_trace] = error.backtrace&.first(5)
    end

    additional_context.merge(error_info)
  end

  # Controller用詳細情報の安全化（機密情報除去）
  def sanitize_controller_details(details)
    return {} unless details.is_a?(Hash)

    # 除外すべき機密フィールド
    sensitive_fields = %w[
      password password_confirmation token auth_token jwt
      api_key secret private_key cookie session_id
      email phone address credit_card authorization
    ].map(&:to_sym)

    details.except(*sensitive_fields)
  end
end