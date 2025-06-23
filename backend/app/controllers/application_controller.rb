class ApplicationController < ActionController::API
  include ExceptionHandler

  before_action :authenticate_request

  private

  def authenticate_request
    header = request.headers['Authorization']
    header = header.split(' ').last if header

    # トークン無い場合
    if header.blank?
      raise ExceptionHandler::MissingToken, 'トークンが提供されていません'
    end

    # JWTデコード
    @decoded = JsonWebToken.decode(header)

    # ブラックリストチェック
    if @decoded[:jti] && JwtBlacklist.blacklisted?(@decoded[:jti])
      raise ExceptionHandler::InvalidToken, 'トークンは無効化されています'
    end

    # ユーザー検索
    @current_user = User.find(@decoded[:user_id])
  end

  def current_user
    @current_user
  end

  def current_token
    header = request.headers['Authorization']
    header.split(' ').last if header
  end
end
