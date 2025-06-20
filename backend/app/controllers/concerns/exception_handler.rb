module ExceptionHandler
  extend ActiveSupport::Concern

  # カスタム例外クラス定義
  class AuthenticationError < StandardError; end
  class MissingToken < StandardError; end
  class InvalidToken < StandardError; end

  included do
  # カスタム例外クラスのハンドリング
  rescue_from ExceptionHandler::AuthenticationError, with: :unauthorized_request
  rescue_from ExceptionHandler::MissingToken, with: :four_twenty_two
  rescue_from ExceptionHandler::InvalidToken, with: :four_twenty_two
  rescue_from ActiveRecord::RecordInvalid, with: :four_twenty_two
  rescue_from ActiveRecord::RecordNotFound, with: :not_found
  end

  private

  # 401
  def unauthorized_request(e)
    render json: { message: e.message }, status: :unauthorized
  end

  #422
  def four_twenty_two(e)
    render json: { message: e.message }, status: :unprocessable_entity
  end

  #404
  def not_found(e)
    render json: { message: e.message }, status: :not_found
  end
end