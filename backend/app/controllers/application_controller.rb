class ApplicationController < ActionController::API
  include ExceptionHandler
  include Loggable

  before_action :authenticate_request
  before_action :check_email_verification

  private

  def authenticate_request
    header = request.headers["Authorization"]


    header = header.split(" ").last if header


    # トークン無い場合
    if header.blank?
      log_auth_event("Token missing in request", nil, false)
      raise ExceptionHandler::MissingToken, "トークンが提供されていません"
    end

    # JWTデコード
    begin
      @decoded = JsonWebToken.decode(header)

    rescue => e
      log_auth_event("JWT decode failed", nil, false)
      log_error("JWT decode error", e)
      raise ExceptionHandler::InvalidToken, "トークンが無効です: #{e.message}"
    end

    # ブラックリストチェック
    if @decoded[:jti] && JwtBlacklist.blacklisted?(@decoded[:jti])
      log_auth_event("Blacklisted token detected", @decoded[:user_id], false)
      raise ExceptionHandler::InvalidToken, "トークンは無効化されています"
    end

    # ユーザー検索
    begin
      @current_user = User.find(@decoded[:user_id])

    rescue ActiveRecord::RecordNotFound => e
      log_auth_event("User not found for token", @decoded[:user_id], false)
      raise ExceptionHandler::InvalidToken, "ユーザーが見つかりません"
    end

    # 認証成功をログ記録
    log_auth_event("Authentication successful", @current_user.id, true)
  end

  def current_user
    @current_user
  end

  def current_token
    header = request.headers["Authorization"]
    header.split(" ").last if header
  end

  def check_email_verification
    return unless @current_user

    unless @current_user.email_verified?
      render json: ApplicationSerializer.error(
        message: "メールアドレスの認証が完了していません。認証メールをご確認ください",
        code: "EMAIL_NOT_VERIFIED",
        details: [ "requires_verification: true", "email: #{@current_user.email}" ]
      ), status: :forbidden
    end
  end
end
