class ApplicationController < ActionController::API
  include ExceptionHandler

  before_action :authenticate_request
  before_action :check_email_verification

  private

  def authenticate_request
    header = request.headers["Authorization"]
    Rails.logger.debug "Authorization request received"

    header = header.split(" ").last if header
    Rails.logger.debug "Token extraction completed"

    # トークン無い場合
    if header.blank?
      Rails.logger.error "Token is blank"
      raise ExceptionHandler::MissingToken, "トークンが提供されていません"
    end

    # JWTデコード
    begin
      @decoded = JsonWebToken.decode(header)
      Rails.logger.debug "JWT decode successful"
    rescue => e
      Rails.logger.error "JWT decode error: #{e.class.name} - #{e.message}"
      raise ExceptionHandler::InvalidToken, "トークンが無効です: #{e.message}"
    end

    # ブラックリストチェック
    if @decoded[:jti] && JwtBlacklist.blacklisted?(@decoded[:jti])
      Rails.logger.error "Token is blacklisted: #{@decoded[:jti]}"
      raise ExceptionHandler::InvalidToken, "トークンは無効化されています"
    end

    # ユーザー検索
    begin
      @current_user = User.find(@decoded[:user_id])
      Rails.logger.debug "User authentication successful"
    rescue ActiveRecord::RecordNotFound => e
      Rails.logger.error "User not found for provided token"
      raise ExceptionHandler::InvalidToken, "ユーザーが見つかりません"
    end
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
      render json: {
        error: "メールアドレスの認証が完了していません。認証メールをご確認ください",
        requires_verification: true,
        email: @current_user.email
      }, status: :forbidden
    end
  end
end
